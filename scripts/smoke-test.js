const fs = require('fs');
const failures = [];
['index.html','styles.css','script.js','README.md'].forEach((f)=>{ if(!fs.existsSync(f)) failures.push(`Missing required file: ${f}`); });
const index = fs.readFileSync('index.html','utf8');
const script = fs.readFileSync('script.js','utf8');
const style = fs.readFileSync('styles.css','utf8');
const readme = fs.readFileSync('README.md','utf8');

if (!index.includes('window.ECHOVAULT_CONFIG')) failures.push('index.html missing window.ECHOVAULT_CONFIG');
if (!index.includes('https://phfwaxuyauuyskzruqbk.supabase.co')) failures.push('index.html missing Supabase project URL');
if (!index.includes('sb_publishable_')) failures.push('index.html missing publishable key prefix');
if (!index.includes('avatars')) failures.push('index.html missing avatars bucket');
if (!script.includes('avatar-file-input')) failures.push('script.js missing avatar-file-input reference');
if (script.includes("getElementById('avatar-input')") || script.includes('"avatar-input"')) failures.push('script.js still relies on avatar-input');
if (!script.includes('signInWithPassword')) failures.push('script.js missing signInWithPassword');
if (!script.includes('signUp')) failures.push('script.js missing signUp');
if (!script.includes("from('profiles')") && !script.includes('from("profiles")')) failures.push('script.js missing profiles integration');
if (!script.includes('.storage.from(')) failures.push('script.js missing avatar storage upload logic');
if (!style.includes('#user-chip') || !style.includes('@media(max-width:768px)')) failures.push('styles.css missing responsive user-chip handling');
if (!readme.includes('phfwaxuyauuyskzruqbk.supabase.co') || !readme.includes('local mode')) failures.push('README missing Supabase/local fallback notes');

if (failures.length) {
  console.error('Smoke test failed:');
  failures.forEach((f)=>console.error('- '+f));
  process.exit(1);
}
console.log('Smoke test passed.');
