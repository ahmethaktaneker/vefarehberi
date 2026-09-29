import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

/** Sosyal medyada paylaşım görseli: logo, marka ve alt başlık birlikte. */
export const alt = `${URUN_ADI}: ${URUN_ALT_BASLIK}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dosya = (yol: string) => readFile(path.join(process.cwd(), yol));

export default async function Image() {
  const [lora, loraExt, atk, atkExt, logo] = await Promise.all([
    dosya("node_modules/@fontsource/lora/files/lora-latin-600-normal.woff"),
    dosya("node_modules/@fontsource/lora/files/lora-latin-ext-600-normal.woff"),
    dosya("node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff"),
    dosya("node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-400-normal.woff"),
    dosya("public/logo.png"),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: "72px 88px", background: "#0f2a47" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={300} alt="" style={{ borderRadius: 48 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Lora", fontSize: 92, color: "#ffffff", lineHeight: 1.05 }}>{URUN_ADI}</div>
          <div style={{ fontFamily: "Atkinson", fontSize: 44, color: "#c9a45c", marginTop: 16 }}>{URUN_ALT_BASLIK}</div>
          <div style={{ fontFamily: "Atkinson", fontSize: 32, color: "rgba(255,255,255,0.82)", marginTop: 44, lineHeight: 1.35, maxWidth: 640 }}>
            Size özel yapılacaklar listesi, son tarihler ve hak edebileceğiniz ödemeler. Ücretsiz.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Lora", data: lora, weight: 600, style: "normal" },
        { name: "Lora", data: loraExt, weight: 600, style: "normal" },
        { name: "Atkinson", data: atk, weight: 400, style: "normal" },
        { name: "Atkinson", data: atkExt, weight: 400, style: "normal" },
      ],
    },
  );
}
