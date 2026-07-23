const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(srcDir, filePath);
  
  const matches = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (
      line.includes('apiFetch') ||
      line.includes('fetch(') ||
      line.includes('axios') ||
      line.includes('localhost:5000') ||
      line.includes('VITE_API_URL') ||
      line.includes('/uploads') ||
      line.includes('BASE_URL')
    ) {
      matches.push(`  L${idx + 1}: ${line.trim()}`);
    }
  });
  
  if (matches.length > 0) {
    console.log(`\n=== ${rel} ===`);
    matches.forEach(m => console.log(m));
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

scanDir(srcDir);
