const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const folders = fs.readdirSync(templatesDir);

let count = 0;
folders.forEach(folder => {
  const p = path.join(templatesDir, folder, 'template.html');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.match(/margin:\s*\[10,\s*10,\s*10,\s*10\]/)) {
      content = content.replace(/margin:\s*\[10,\s*10,\s*10,\s*10\]/g, 'margin: 0');
      fs.writeFileSync(p, content, 'utf8');
      count++;
    }
  }
});
console.log(`Updated ${count} templates.`);
