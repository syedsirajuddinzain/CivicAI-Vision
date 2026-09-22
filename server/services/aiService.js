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
  "description": "<Detailed dynamic visual observations of the civic issue in the photo>"
}

Strict Rules:
- If the image does not clearly show one of the supported civic issues (e.g., food, products, pets, indoor rooms, selfies, unrelated objects), return EXACTLY:
{
  "issueType": "Other / Unknown",
  "confidence": 0,
  "severity": "Low",
  "description": "Unable to identify a supported urban civic issue in this image."
}
- If the image shows road cavities, asphalt damage, craters, or potholes, classify as "Road / Pothole".
- If the image shows broken/flickering streetlights, damaged lamp poles, or exposed electrical wiring, classify as "Electrical / Streetlight".
- If the image shows uncollected garbage piles, overflowing trash bins, or waste dumps, classify as "Garbage / Sanitation".
- If the image shows clogged drainage grates, sewage overflow, culverts, or flooded street wastewater, classify as "Drainage / Wastewater".
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
};

export function getActiveAiEngine() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '' && geminiKey.trim() !== 'your_key_here') {
    return { engine: 'Google Gemini Flash Vision (Multimodal)', isCloud: true, provider: 'gemini', model: 'gemini-3.1-flash-lite' };
  }
  if (openaiKey && openaiKey.trim() !== '' && openaiKey.trim() !== 'your_key_here') {
    return { engine: 'OpenAI Vision (GPT-4o-mini)', isCloud: true, provider: 'openai', model: 'gpt-4o-mini' };
  }
  return { engine: 'No Vision Provider Configured', isCloud: false, provider: 'none', model: null };
}

export async function analyzeCivicImage(imagePath, mimeType = 'image/jpeg', originalName = '') {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const hasGemini = Boolean(geminiKey && geminiKey.trim() !== '' && geminiKey.trim() !== 'your_key_here');
  const hasOpenAI = Boolean(openaiKey && openaiKey.trim() !== '' && openaiKey.trim() !== 'your_key_here');

  if (!hasGemini && !hasOpenAI) {
    return {
      error: 'AI_NOT_CONFIGURED',
      message: 'Configure a Google Gemini or OpenAI API key in AI Settings to enable multimodal vision analysis.',
    };
  }

  const buffer = fs.readFileSync(imagePath);
  const imageBase64 = buffer.toString('base64');
  let result = null;
  let engineUsed = '';
  let lastError = null;

  // 1. Dynamic Multimodal Google Gemini Vision
  if (hasGemini) {
    const geminiModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
    ];
    const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });

    for (const modelName of geminiModels) {
      if (result) break;
      try {
        console.log(`[AI Vision] Sending photo to Google Gemini (${modelName})...`);

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
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        let rawText = response.text || '{}';
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        result = JSON.parse(rawText);
        engineUsed = `Google Gemini Vision (${modelName})`;
        console.log(`[AI Vision] Successfully analyzed image via ${modelName}:`, result.issueType, `(${result.confidence})`);
        break;
      } catch (err) {
        console.warn(`[AI Vision] Gemini (${modelName}) error:`, err.message);
        lastError = err.message;
      }
    }
  }

  // 2. OpenAI GPT-4o-mini Vision Fallback
  if (!result && hasOpenAI) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey.trim() });
      console.log(`[AI Vision] Fallback to OpenAI GPT-4o-mini vision model...`);

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
      console.warn('[AI Vision] OpenAI error:', err.message);
      lastError = err.message;
    }
  }

  if (!result) {
    return {
      error: 'AI_UNAVAILABLE',
      message: lastError || 'AI vision analysis failed. Please try again.',
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
  if (isNaN(confidence) || confidence < 0) confidence = 0.85;
  if (confidence > 1) confidence = 1;
  confidence = Number(confidence.toFixed(2));

  let severity = result?.severity;
  if (!allowedSeverities.includes(severity)) {
    severity = 'High';
  }

  let description = String(result?.description || '').trim();
  if (!description) {
    description = `${issueType} issue observed in photographic evidence.`;
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
