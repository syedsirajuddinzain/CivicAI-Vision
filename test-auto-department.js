import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAutoAnalysis() {
  console.log('====================================================');
  console.log('TESTING ZERO-CLICK AUTOMATIC AI & DEPARTMENT MATCH');
  console.log('====================================================');

  const baseUrl = 'http://localhost:5000';

  const testCases = [
    {
      name: 'Pothole Road Damage Photo',
      filename: 'road_pothole_crater.jpg',
      buffer: Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'),
      expectedDept: 'Roads & Infrastructure Department',
      expectedIssue: 'Pothole / Road Damage',
    },
    {
      name: 'Garbage Dumpster Photo',
      filename: 'dumpster_garbage_trash.jpg',
      buffer: Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'),
      expectedDept: 'Sanitation Department',
      expectedIssue: 'Garbage / Sanitation Issue',
    },
    {
      name: 'Streetlight Pole Photo',
      filename: 'broken_streetlight_pole.jpg',
      buffer: Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'),
      expectedDept: 'Electrical Department',
      expectedIssue: 'Streetlight / Electrical Issue',
    },
    {
      name: 'Drainage Overflow Photo',
      filename: 'clogged_drain_water.jpg',
      buffer: Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'),
      expectedDept: 'Water & Drainage Department',
      expectedIssue: 'Drainage / Wastewater Issue',
    },
    {
      name: 'Unrelated Food Photo',
      filename: 'burger_food_plate.jpg',
      buffer: Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'),
      expectedDept: 'General Municipal Department',
      expectedIssue: 'Other / Unknown',
    },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting Image: "${tc.name}" (${tc.filename})`);
    const formData = new FormData();
    formData.append('image', new Blob([tc.buffer], { type: 'image/jpeg' }), tc.filename);

    const res = await fetch(`${baseUrl}/api/ai/analyze`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(`Analysis failed for ${tc.name}: ${JSON.stringify(json)}`);
    }

    const data = json.data;
    console.log(`[PASS] Detected Issue:       ${data.issueType}`);
    console.log(`       Target Department:    ${data.departmentName}`);
    console.log(`       Confidence:           ${(data.confidence * 100).toFixed(0)}%`);
    console.log(`       Severity:             ${data.severity}`);
    console.log(`       Description:          "${data.description}"`);

    if (data.issueType !== tc.expectedIssue) {
      throw new Error(`Expected issue "${tc.expectedIssue}", got "${data.issueType}"`);
    }
    if (data.departmentName !== tc.expectedDept) {
      throw new Error(`Expected department "${tc.expectedDept}", got "${data.departmentName}"`);
    }
  }

  console.log('\n====================================================');
  console.log('ALL ZERO-CLICK AUTOMATIC ANALYSES & MATCHES PASSED!');
  console.log('====================================================\n');
}

testAutoAnalysis()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
  });
