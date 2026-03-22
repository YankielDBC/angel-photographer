const sharp = require('sharp');
const fs = require('fs');

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  const original = fs.statSync(file).size;
  
  if (['.jpg', '.jpeg'].includes(ext)) {
    await sharp(file).jpeg({ quality: 80, mozjpeg: true }).toFile(file + '.tmp');
  } else if (ext === '.png') {
    await sharp(file).webp({ quality: 80 }).toFile(file.replace('.png', '.webp'));
    return;
  } else if (ext === '.webp') {
    await sharp(file).webp({ quality: 80 }).toFile(file + '.tmp');
  }
  
  const optimized = fs.statSync(file + '.tmp').size;
  const savings = ((original - optimized) / original * 100).toFixed(1);
  
  if (optimized < original) {
    fs.unlinkSync(file);
    fs.renameSync(file + '.tmp', file);
    console.log(`${path.basename(file)}: ${(original/1024).toFixed(0)}KB → ${(optimized/1024).toFixed(0)}KB (${savings}% ahorro)`);
  } else {
    fs.unlinkSync(file + '.tmp');
    console.log(`${path.basename(file)}: ya estaba optimizado`);
  }
}

const path = require('path');
const imgDir = 'C:\\Users\\WorkMonitor\\.openclaw\\workspace\\angel-photographer\\public\\img';

async function main() {
  const files = [
    'service-maternidad.jpg',
    'gallery-boda.jpg',
    'gallery-retrato.jpg',
    'gallery-familia.jpg',
    'hero-4.jpg',
    'hero-2.jpg',
    'service-familias.jpg',
  ];
  
  for (const f of files) {
    const fullPath = path.join(imgDir, f);
    if (fs.existsSync(fullPath)) {
      console.log(`Optimizando: ${f}`);
      await optimize(fullPath);
    }
  }
  console.log('\nListo!');
}

main();
