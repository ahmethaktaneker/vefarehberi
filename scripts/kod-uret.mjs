// Erişim kodu üretir: kodları ekrana yazar, yalnızca özetlerini content/erisim.yaml'a ekler.
// Kullanım: npm run kod-uret -- 3 "deneme kullanıcıları"
// Kodları bir yere not edin; dosyada yalnızca özet durduğu için sonradan geri alınamaz.
// Bir kodu iptal etmek için ilgili satırı dosyadan silin.
import { createHash, randomInt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const HARFLER = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // karışan harfler (0/O, 1/I/L) yok
const adet = Math.min(Number(process.argv[2]) || 1, 100);
const not = (process.argv[3] ?? "").replace(/"/g, "'");
const dosya = path.join(process.cwd(), "content", "erisim.yaml");
const bugun = new Date().toISOString().slice(0, 10);

const parca = () => Array.from({ length: 4 }, () => HARFLER[randomInt(HARFLER.length)]).join("");
const satirlar = [];
for (let i = 0; i < adet; i++) {
  const kod = `VR-${parca()}-${parca()}-${parca()}`;
  const ozet = createHash("sha256").update(`vefatrehberi:${kod.replace(/[^A-Z0-9]/g, "")}`).digest("hex");
  console.log(kod);
  satirlar.push(`  - { ozet: "${ozet}", urunler: [beyanname, aile], tarih: "${bugun}"${not ? `, not: "${not}"` : ""} }`);
}
fs.appendFileSync(dosya, satirlar.join("\n") + "\n");
console.error(`\n${adet} kod eklendi: content/erisim.yaml. Commit edip yayınlayınca geçerli olur.`);
