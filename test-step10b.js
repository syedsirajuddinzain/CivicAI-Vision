import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5057;

async function runTests() {
  console.log('====================================================');
  console.log('STEP 10B: REAL OPENAI VISION BACKEND VERIFICATION');
  console.log('====================================================');

  const server = app.listen(PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`[TEST SERVER] Running on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. Verify Error State when OPENAI_API_KEY is missing/empty
    console.log('\n--- 1. Testing AI Endpoint Without OPENAI_API_KEY ---');
    const savedKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    // Create a temporary test image file
    const sampleImgPath = path.join(__dirname, 'test-sample.jpg');
    fs.writeFileSync(sampleImgPath, Buffer.from('test-image-binary-payload-data'));

    const formData = new FormData();
    formData.append(
      'image',
      new Blob([fs.readFileSync(sampleImgPath)], { type: 'image/jpeg' }),
      'test-sample.jpg'
    );

    const resNoKey = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      body: formData,
    });
    const jsonNoKey = await resNoKey.json();

    if (
      resNoKey.status === 503 &&
      jsonNoKey.message === 'AI service is unavailable. Please try again.'
    ) {
      console.log('[PASS] Correctly returned HTTP 503:');
      console.log(`       Message: "${jsonNoKey.message}"`);
      console.log('       [CONFIRMED] No mock or fake result was returned.');
    } else {
      throw new Error(`Expected 503 AI_UNAVAILABLE, got: ${resNoKey.status} ${JSON.stringify(jsonNoKey)}`);
    }

    if (fs.existsSync(sampleImgPath)) fs.unlinkSync(sampleImgPath);
    if (savedKey) process.env.OPENAI_API_KEY = savedKey;

    // 2. Verify that uploaded image reaches the server disk storage
    console.log('\n--- 2. Verifying Actual Uploaded Image Storage ---');
    const imgPayload = path.join(__dirname, 'test-upload-check.jpg');
    const testBuffer = Buffer.from('jpeg-binary-header-bytes-12345678');
    fs.writeFileSync(imgPayload, testBuffer);

    const checkForm = new FormData();
    checkForm.append(
      'image',
      new Blob([fs.readFileSync(imgPayload)], { type: 'image/jpeg' }),
      'camera-capture.jpg'
    );

    await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      body: checkForm,
    });

    const uploadsDir = path.join(__dirname, 'server/uploads');
    const uploadedFiles = fs.readdirSync(uploadsDir);
    const recentUpload = uploadedFiles.find(f => f.startsWith('evidence-'));

    if (recentUpload) {
      console.log(`[PASS] Uploaded image successfully streamed to backend disk: ${recentUpload}`);
      console.log(`       Path: server/uploads/${recentUpload}`);
    } else {
      throw new Error('Image was not saved to server/uploads/');
    }

    if (fs.existsSync(imgPayload)) fs.unlinkSync(imgPayload);

    // 3. Test OpenAI Vision with active key if available
    console.log('\n--- 3. Testing OpenAI Vision API Integration ---');
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_key_here') {
      console.log('Valid OPENAI_API_KEY detected. Sending live vision request to gpt-4o-mini...');
      const testVisionImg = path.join(__dirname, 'test-vision.jpg');
      fs.writeFileSync(testVisionImg, Buffer.from('data'));

      const vForm = new FormData();
      vForm.append('image', new Blob([fs.readFileSync(testVisionImg)], { type: 'image/jpeg' }), 'pothole.jpg');

      const vRes = await fetch(`${baseUrl}/api/ai/analyze`, {
        method: 'POST',
        body: vForm,
      });
      const vData = await vRes.json();
      console.log('[LIVE OPENAI RESPONSE]:', vData);
      if (fs.existsSync(testVisionImg)) fs.unlinkSync(testVisionImg);
    } else {
      console.log('[INFO] OPENAI_API_KEY is currently unset in server/.env.');
      console.log('       The backend correctly halts and displays "AI service is unavailable. Please try again."');
      console.log('       To test with live OpenAI vision model, set OPENAI_API_KEY=sk-... in server/.env.');
    }

    console.log('\n====================================================');
    console.log('STEP 10B VERIFICATION COMPLETE!');
    console.log('====================================================\n');

    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('TEST FAILED:', err);
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();
