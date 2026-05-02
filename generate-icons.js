const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const SVG = path.join(__dirname, 'icons/icon.svg');
const OUT = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, {recursive:true});
const sizes = [16,32,72,96,128,144,152,180,192,384,512];
async function run() { const buf = fs.readFileSync(SVG); for (const s of sizes) { await sharp(buf).resize(s,s).png().toFile(path.join(OUT,`icon-${s}.png`)); console.log(`✓ icon-${s}.png`);} const inner = Math.round(512*0.72), off = Math.round((512-inner)/2); const ib = await sharp(buf).resize(inner,inner).png().toBuffer(); await sharp({create:{width:512,height:512,channels:4,background:{r:5,g:5,b:8,alpha:1}}}).composite([{input:ib,left:off,top:off}]).png().toFile(path.join(OUT,'maskable-512.png')); console.log('✓ maskable-512.png — all done'); }
run().catch(console.error);
