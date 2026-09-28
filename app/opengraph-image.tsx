import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { URUN_ADI, URUN_ALT_BASLIK } from "@/lib/marka";

/** Sosyal medyada paylaşım görseli: marka ve alt başlık birlikte (Brief 14a). */
export const alt = `${URUN_ADI}: ${URUN_ALT_BASLIK}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const yaziTipi = (dosya: string) => readFile(path.join(process.cwd(), "node_modules/@fontsource", dosya));

export default async function Image() {
  const [serifLatin, serifExt, sansLatin, sansExt] = await Promise.all([
    yaziTipi("source-serif-4/files/source-serif-4-latin-600-normal.woff"),
    yaziTipi("source-serif-4/files/source-serif-4-latin-ext-600-normal.woff"),
    yaziTipi("source-sans-3/files/source-sans-3-latin-400-normal.woff"),
    yaziTipi("source-sans-3/files/source-sans-3-latin-ext-400-normal.woff"),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#faf8f4",
          borderLeft: "24px solid #3f6b56",
        }}
      >
        <div style={{ fontFamily: "Serif", fontSize: 104, color: "#2f5242" }}>{URUN_ADI}</div>
        <div style={{ fontFamily: "Sans", fontSize: 48, color: "#26241f", marginTop: 16 }}>{URUN_ALT_BASLIK}</div>
        <div style={{ fontFamily: "Sans", fontSize: 34, color: "#5c5850", marginTop: 56, lineHeight: 1.35 }}>
          Size özel yapılacaklar listesi, son tarihler ve hak edebileceğiniz ödemeler. Ücretsiz.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serifLatin, weight: 600, style: "normal" },
        { name: "Serif", data: serifExt, weight: 600, style: "normal" },
        { name: "Sans", data: sansLatin, weight: 400, style: "normal" },
        { name: "Sans", data: sansExt, weight: 400, style: "normal" },
      ],
    },
  );
}
