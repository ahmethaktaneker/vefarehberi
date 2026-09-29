// Başlık logosunun keskin küçük sürümlerini üretir: node scripts/logo-kucult.mjs
// Kaynak public/logo.png değişince yeniden çalıştırın.
import sharp from "sharp";

for (const px of [88, 132]) {
  await sharp("public/logo.png").resize(px, px, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).png({ compressionLevel: 9 }).toFile(`public/logo-${px}.png`);
}
