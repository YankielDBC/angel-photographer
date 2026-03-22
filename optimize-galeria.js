const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const galeriaDir = path.join(__dirname, 'public', 'img', 'galeria');

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  const original = fs.statSync(file).size;
  const name = path.basename(file, ext);
  
  if (ext === '.png') {
    const webpPath = path.join(path.dirname(file), name + '.webp');
    await sharp(file).webp({ quality: 85 }).toFile(webpPath);
    const optimized = fs.statSync(webpPath).size;
    const savings = ((original - optimized) / original * 100).toFixed(1);
    console.log(`  ${name}: ${(original/1024).toFixed(0)}KB → ${(optimized/1024).toFixed(0)}KB WebP (${savings}% ahorro)`);
    fs.unlinkSync(file);
  } else if (['.jpg', '.jpeg'].includes(ext)) {
    const tmpPath = file + '.tmp';
    await sharp(file).jpeg({ quality: 85, mozjpeg: true }).toFile(tmpPath);
    const optimized = fs.statSync(tmpPath).size;
    const savings = ((original - optimized) / original * 100).toFixed(1);
    if (optimized < original) {
      fs.unlinkSync(file);
      fs.renameSync(tmpPath, file);
      console.log(`  ${name}: ${(original/1024).toFixed(0)}KB → ${(optimized/1024).toFixed(0)}KB (${savings}% ahorro)`);
    } else {
      fs.unlinkSync(tmpPath);
    }
  }
}

async function main() {
  const files = fs.readdirSync(galeriaDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(galeriaDir, f));
  
  console.log(`📦 Optimizando ${files.length} imágenes de galería...\n`);
  
  for (const file of files) {
    const name = path.basename(file);
    process.stdout.write(`${name}\n`);
    await optimize(file);
  }
  
  console.log('\n✅ Galería optimizada!');
}

main();
