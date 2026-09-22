import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const CIVIC_VISION_PROMPT = `You are an expert AI vision inspection system for a municipal civic authority.
Analyze the provided image of a reported civic infrastructure problem in a city.

You must classify the problem ONLY into one of these 5 categories:
1. "Road / Pothole"
2. "Electrical / Streetlight"
3. "Garbage / Sanitation"
4. "Drainage / Wastewater"
5. "Other / Unknown"

You must return ONLY a JSON object with this exact schema:
{
  "issueType": "<ONE OF THE 5 CATEGORIES ABOVE>",
  "confidence": <number between 0.00 and 1.00 representing your genuine visual certainty>,
  "severity": "<ONE OF: 'Low' | 'Medium' | 'High' | 'Critical'>",
  "description": "<Concise description of the observed civic issue>"
}

Strict Rules:
- If the image does not clearly show one of the supported civic issues (e.g., food, products, pets, indoor rooms, selfies, unrelated objects), return EXACTLY:
{
  "issueType": "Other / Unknown",
  "confidence": 0,
  "severity": "Low",
  "description": "Unable to confidently identify a supported civic issue."
}
- NEVER automatically classify an unrelated image as a pothole.
- If the image shows road cavities, asphalt damage, craters, or potholes, classify as "Road / Pothole".
- If the image shows broken/flickering streetlights, damaged lamp poles, or exposed electrical wiring, classify as "Electrical / Streetlight".
- If the image shows uncollected garbage piles, overflowing trash bins, or waste dumps, classify as "Garbage / Sanitation".
- If the image shows clogged drainage grates, sewage overflow, or flooded street wastewater, classify as "Drainage / Wastewater".
- Do NOT include markdown fences, markdown codeblocks, or conversational text. Return raw JSON only.`;

export const DEPARTMENT_MAP = {
  'Road / Pothole': {
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
  },
  'Electrical / Streetlight': {
    departmentId: 'dept_electrical',
    departmentName: 'Electrical Department',
  },
  'Garbage / Sanitation': {
    departmentId: 'dept_sanitation',
    departmentName: 'Sanitation Department',
  },
  'Drainage / Wastewater': {
    departmentId: 'dept_water',
    departmentName: 'Water & Drainage Department',
  },
  'Other / Unknown': {
    departmentId: 'dept_general',
    departmentName: 'General Municipal Department',
  },
  // Legacy string aliases
  'Pothole / Road Damage': {
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
  },
  'Streetlight / Electrical Issue': {
    departmentId: 'dept_electrical',
    departmentName: 'Electrical Department',
  },
  'Drainage / Wastewater Issue': {
    departmentId: 'dept_water',
    departmentName: 'Water & Drainage Department',
  },
  'Garbage / Sanitation Issue': {
    departmentId: 'dept_sanitation',
    departmentName: 'Sanitation Department',
  },
};

export function getActiveAiEngine() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '' && geminiKey.trim() !== 'your_key_here') {
    return { engine: 'Google Gemini Vision (3.6 Flash)', isCloud: true, provider: 'gemini', model: 'gemini-3.6-flash' };
  }
  if (openaiKey && openaiKey.trim() !== '' && openaiKey.trim() !== 'your_key_here') {
    return { engine: 'OpenAI Vision (GPT-4o-mini)', isCloud: true, provider: 'openai', model: 'gpt-4o-mini' };
  }
  return { engine: 'No Vision Provider Configured', isCloud: false, provider: 'none', model: null };
}

export async function analyzeCivicImage(imagePath, mimeType = 'image/jpeg', originalName = '') {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const hasOpenAI = Boolean(openaiKey && openaiKey.trim() !== '' && openaiKey.trim() !== 'your_key_here');
  const hasGemini = Boolean(geminiKey && geminiKey.trim() !== '' && geminiKey.trim() !== 'your_key_here');

  if (!hasOpenAI && !hasGemini) {
    return {
      error: 'AI_NOT_CONFIGURED',
      message: 'Configure an OpenAI API key or Google Gemini API key in AI Settings to enable real vision analysis.',
    };
  }

  const buffer = fs.readFileSync(imagePath);
  const imageBase64 = buffer.toString('base64');
  let result = null;
  let engineUsed = '';
  let lastError = null;

  // Try Google Gemini first if configured (or as fallback)
  if (hasGemini) {
    const geminiModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.7-flash',
      'gemini-3.8-flash',
    ];
    for (const modelName of geminiModels) {
      if (result) break;
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
        console.log(`[AI Vision] Sending actual image to Gemini (${modelName}) vision model...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: imageBase64 } },
                { text: CIVIC_VISION_PROMPT },
              ],
            },
          ],
          config: { responseMimeType: 'application/json' },
        });

        let rawText = response.text || '{}';
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        result = JSON.parse(rawText);
        engineUsed = `Google Gemini Vision (${modelName})`;
        break;
      } catch (err) {
        console.error(`[AI Vision] Gemini (${modelName}) failed:`, err.message);
        lastError = err.message;
      }
    }
  }

  // Try OpenAI if Gemini wasn't used or failed
  if (!result && hasOpenAI) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey.trim() });
      console.log(`[AI Vision] Sending actual image to OpenAI GPT-4o-mini vision model...`);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: CIVIC_VISION_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this civic issue photo and return structured JSON.' },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const raw = response.choices?.[0]?.message?.content || '{}';
      result = JSON.parse(raw);
      engineUsed = 'OpenAI Vision (GPT-4o-mini)';
    } catch (err) {
      console.error('[AI Vision] OpenAI vision analysis failed:', err.message);
      lastError = err.message;
      if (err.status === 429 || err.message?.includes('credits') || err.message?.includes('quota')) {
        lastError = 'OpenAI API quota exceeded (no credits remaining). Please add credits to your OpenAI account or use a Google Gemini key in AI Settings.';
      }
    }
  }

  if (!result) {
    return {
      error: 'AI_UNAVAILABLE',
      message: lastError || 'AI analysis is unavailable. Please try again.',
      details: lastError,
    };
  }

  const sanitized = sanitizeResult(result);
  const deptInfo = DEPARTMENT_MAP[sanitized.issueType] || DEPARTMENT_MAP['Other / Unknown'];

  return {
    ...sanitized,
    engineUsed,
    departmentId: deptInfo.departmentId,
    departmentName: deptInfo.departmentName,
  };
}

function sanitizeResult(result) {
  const allowedTypes = [
    'Road / Pothole',
    'Electrical / Streetlight',
    'Garbage / Sanitation',
    'Drainage / Wastewater',
    'Other / Unknown',
  ];
  const allowedSeverities = ['Low', 'Medium', 'High', 'Critical'];

  let issueType = result?.issueType;
  // Normalize aliases if any
  if (issueType === 'Pothole / Road Damage' || issueType === 'Road' || issueType === 'Pothole') {
    issueType = 'Road / Pothole';
  } else if (issueType === 'Streetlight / Electrical Issue' || issueType === 'Electrical' || issueType === 'Streetlight') {
    issueType = 'Electrical / Streetlight';
  } else if (issueType === 'Drainage / Wastewater Issue' || issueType === 'Drainage' || issueType === 'Wastewater') {
    issueType = 'Drainage / Wastewater';
  } else if (issueType === 'Garbage / Sanitation Issue' || issueType === 'Garbage' || issueType === 'Sanitation') {
    issueType = 'Garbage / Sanitation';
  }

  if (!allowedTypes.includes(issueType)) {
    issueType = 'Other / Unknown';
  }

  let confidence = Number(result?.confidence);
  if (isNaN(confidence) || confidence < 0) confidence = 0;
  if (confidence > 1) confidence = 1;
  confidence = Number(confidence.toFixed(2));

  let severity = result?.severity;
  if (!allowedSeverities.includes(severity)) {
    severity = issueType === 'Other / Unknown' ? 'Low' : 'Medium';
  }

  let description = String(result?.description || '').trim();
  if (!description) {
    description =
      issueType === 'Other / Unknown'
        ? 'Unable to confidently identify a supported civic issue.'
        : `${issueType} issue detected in photo.`;
  }

  return {
    issueType,
    confidence,
    severity,
    description,
    analyzedAt: new Date().toISOString(),
  };
}

export default {
  analyzeCivicImage,
  getActiveAiEngine,
  DEPARTMENT_MAP,
};
