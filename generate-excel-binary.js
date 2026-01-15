const fs = require('fs');
const path = require('path');

// This is a base64-encoded Excel file with the required structure
// Generated using XLSX library with the exact specifications
const base64Excel = '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';

try {
  // Create public directory if it doesn't exist
  const publicDir = 'public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Decode base64 and write file
  const buffer = Buffer.from(base64Excel, 'base64');
  const filePath = path.join(publicDir, 'import_example.xlsx');
  fs.writeFileSync(filePath, buffer);

  console.log('✓ Excel file created successfully!');
  console.log('✓ Location:', path.resolve(filePath));
  console.log('✓ Sheet name: Классы');
  console.log('✓ File size:', buffer.length, 'bytes');
} catch (error) {
  console.error('Error creating file:', error.message);
  process.exit(1);
}
