const fs = require('fs');

const required = ['index.html', 'styles.css', 'script.js', 'manifest.json', 'sw.js', 'wrapped-cinematic-module.js'];
const failures = [];

for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`Missing required file: ${file}`);
}

const checks = [
  ['index.html', ['href="/manifest.json"', 'src="/icons/icon.svg"', "register('/sw.js')", 'href="/icons/icon.svg"']],
  ['manifest.json', ['"/icons/icon.svg"', '"start_url": "/"']],
  ['sw.js', ["'/index.html'", "['/', '/index.html'", "caches.match('/index.html')", "icon:'/icons/icon.svg'", "badge:'/icons/icon.svg'"]]
];

for (const [file, patterns] of checks) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (content.includes(pattern)) failures.push(`Found broken pattern in ${file}: ${pattern}`);
  }
}

if (failures.length) {
  console.error('Smoke test failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log('Smoke test passed.');
