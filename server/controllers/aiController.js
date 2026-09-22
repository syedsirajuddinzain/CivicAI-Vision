import fs from 'fs';
import path from 'path';
import { analyzeCivicImage, getActiveAiEngine } from '../services/aiService.js';

export async function analyzeImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please provide an image to analyze.',
      });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype || 'image/jpeg';

    const result = await analyzeCivicImage(imagePath, mimeType, req.file.originalname);

    if (result?.error === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        code: 'AI_NOT_CONFIGURED',
        message: result.message || 'Configure an OpenAI API key in AI Settings to enable real vision analysis.',
      });
    }

    if (result?.error === 'AI_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        code: 'AI_UNAVAILABLE',
        message: result.message || 'AI analysis is unavailable. Please try again.',
        details: result.details,
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        imageUrl,
        imageName: req.file.originalname,
      },
    });
  } catch (err) {
    console.error('[AI Controller] Error analyzing image:', err);
    return res.status(500).json({
      success: false,
      code: 'AI_UNAVAILABLE',
      message: 'AI analysis is unavailable. Please try again.',
      error: err.message,
    });
  }
}

export function getAiStatus(req, res) {
  const activeEngine = getActiveAiEngine();
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && process.env.OPENAI_API_KEY !== 'your_key_here');
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_key_here');

  return res.status(200).json({
    success: true,
    data: {
      ...activeEngine,
      hasOpenAiKey,
      hasGeminiKey,
    },
  });
}

export function configureApiKey(req, res) {
  try {
    const { openaiApiKey, geminiApiKey } = req.body;

    const envPath = path.resolve(process.cwd(), 'server', '.env');
    let envContent = '';
    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
    } catch (e) {
      console.warn('Could not read .env file:', e.message);
    }

    if (openaiApiKey !== undefined) {
      const cleanOpenAiKey = openaiApiKey.trim();
      process.env.OPENAI_API_KEY = cleanOpenAiKey;
      if (envContent.includes('OPENAI_API_KEY=')) {
        envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY=${cleanOpenAiKey}`);
      } else {
        envContent += `\nOPENAI_API_KEY=${cleanOpenAiKey}`;
      }
    }

    if (geminiApiKey !== undefined) {
      const cleanGeminiKey = geminiApiKey.trim();
      process.env.GEMINI_API_KEY = cleanGeminiKey;
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanGeminiKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanGeminiKey}`;
      }
    }

    try {
      fs.writeFileSync(envPath, envContent, 'utf8');
    } catch (e) {
      console.warn('Could not write to .env:', e.message);
    }

    const active = getActiveAiEngine();
    return res.status(200).json({
      success: true,
      message: 'API Key configured successfully.',
      data: active,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to configure API key.',
      error: err.message,
    });
  }
}
