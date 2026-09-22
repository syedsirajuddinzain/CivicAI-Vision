/**
 * CivicAI - Real AI Civic Issue Detection Service
 * 
 * Sends the actual citizen photo to the backend endpoint POST /api/ai/analyze.
 * The backend securely invokes the Vision AI model (OpenAI GPT-4o-mini or Google Gemini).
 * API keys NEVER reside on the client.
 */

import { getAuthToken, getApiBaseUrl } from './api';

export const SUPPORTED_ISSUE_TYPES = [
  'Road / Pothole',
  'Electrical / Streetlight',
  'Garbage / Sanitation',
  'Drainage / Wastewater',
  'Other / Unknown',
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Send the actual image File to the backend for real AI vision analysis.
 * 
 * @param {File} imageFile - The real File object selected/captured by the citizen
 * @returns {Promise<{issueType: string, confidence: number, severity: string, description: string, imageUrl: string, departmentId: string, departmentName: string, engineUsed: string}>}
 */
export async function analyzeCivicImage(imageFile) {
  if (!imageFile) {
    throw new Error('Please select an image file to analyze.');
  }

  // Create multipart/form-data with the actual image
  const formData = new FormData();
  formData.append('image', imageFile);

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const code = data?.code || 'AI_UNAVAILABLE';
      let msg = data?.message || 'AI analysis is unavailable. Please try again.';
      if (code === 'AI_NOT_CONFIGURED') {
        msg = data?.message || 'Configure an OpenAI API key or Gemini API key in AI Settings to enable real vision analysis.';
      }
      const err = new Error(msg);
      err.code = code;
      throw err;
    }

    const result = data.data;

    return {
      issueType: result.issueType,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      severity: result.severity || 'Medium',
      description: result.description || '',
      departmentId: result.departmentId || '',
      departmentName: result.departmentName || '',
      engineUsed: result.engineUsed || 'Vision AI',
      imageUrl: result.imageUrl || '',
      imageName: result.imageName || imageFile.name,
      analyzedAt: result.analyzedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error('[AI Service Error]', err);
    throw err;
  }
}

/**
 * Fetch current backend AI vision engine status.
 */
export async function getAiEngineStatus() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/ai/status`);
    const data = await res.json();
    return data.data || { engine: 'No Vision Provider Configured', isCloud: false };
  } catch (e) {
    return { engine: 'No Vision Provider Configured', isCloud: false };
  }
}

/**
 * Configure cloud API keys on backend dynamically.
 */
export async function configureAiApiKey({ openaiApiKey, geminiApiKey }) {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/ai/configure-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openaiApiKey, geminiApiKey }),
  });
  return await res.json();
}

export default {
  SUPPORTED_ISSUE_TYPES,
  SEVERITY_LEVELS,
  analyzeCivicImage,
  getAiEngineStatus,
  configureAiApiKey,
};
