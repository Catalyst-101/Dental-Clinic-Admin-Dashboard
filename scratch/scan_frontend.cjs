const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (
          line.includes('http:') ||
          line.includes('https:') ||
          line.includes('localhost') ||
          line.includes('5000') ||
          line.includes('fetch(') ||
          line.includes('axios') ||
          line.includes('BASE_URL') ||
          line.includes('uploads/') ||
          line.includes('/uploads')
        ) {
          console.log(`${path.relative(srcDir, fullPath)}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scanDir(srcDir);
