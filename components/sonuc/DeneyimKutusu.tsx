"use client";

import { useState, useSyncExternalStore } from "react";
import { olay } from "@/lib/analitik";
import { ILETISIM_EPOSTA } from "@/lib/marka";

/**
 * Kullanıcı deneyimi toplama. İki adımlıdır:
 *  1) Anonim memnuniyet puanı (1-5): yalnızca sayı olarak Umami'ye gider, kişisel veri yok.
 *  2) İsteğe bağlı yorum: kişinin kendi e-posta uygulamasında hazır bir e-posta açılır; göndermeyi kişi
 *     yapar. Sitede saklanmaz. Yayın izni ayrı bir kutuyla alınır; izinli yorumlar proje sahibinin
 *     onayıyla content/yorumlar.yaml'a eklenir.
 * Soru bir cihazda bir kez sorulur.
 */
const ANAHTAR = "vefa:deneyim:v1";

const okuYapildi = () => {
  try {
    return localStorage.getItem(ANAHTAR) === "1";
  } catch {
    return false;
  }
};

export function DeneyimKutusu() {
  const dahaOnce = useSyncExternalStore(
    () => () => {},
    okuYapildi,
    () => true,
  );
  const [puan, setPuan] = useState<number | null>(null);
  const [yorum, setYorum] = useState("");
  const [kim, setKim] = useState("");
  const [izin, setIzin] = useState(false);
  const [bitti, setBitti] = useState(false);

  if (dahaOnce && puan === null) return null;

  function puanVer(p: number) {
    setPuan(p);
    olay("memnuniyet", { puan: p });
    try {
      localStorage.setItem(ANAHTAR, "1");
    } catch {
      // Tarayıcı depolaması kapalıysa soru yeniden sorulabilir; sorun değil.
    }
  }

  const govde = [
    `Puan: ${puan ?? "-"} / 5`,
    "",
    "Deneyimim:",
    yorum.trim(),
    "",
    `Baş harflerim ve şehrim: ${kim.trim() || "-"}`,
    izin
      ? "Bu yorumun baş harflerim ve şehrimle Vefat Rehberi sitesinde yayınlanmasına izin veriyorum."
      : "Bu yorumun sitede yayınlanmasını istemiyorum; yalnızca geri bildirim olarak iletiyorum.",
  ].join("\n");
  const mailto = `mailto:${ILETISIM_EPOSTA}?subject=${encodeURIComponent("Vefat Rehberi: deneyimim")}&body=${encodeURIComponent(govde)}`;

  return (
    <section aria-labelledby="deneyim-baslik" className="rounded-2xl border border-cizgi bg-yuzey p-5">
      {puan === null ? (
        <>
          <h2 id="deneyim-baslik" className="font-semibold">
            Bu liste işinize yarıyor mu?
          </h2>
          <p className="mt-1 text-base text-metin-ikincil">Tek dokunuş yeterli; kim olduğunuzu bilmeyiz.</p>
          <div role="group" aria-label="1'den 5'e puan" className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => puanVer(p)}
                aria-label={`${p} yıldız`}
                className="flex size-12 items-center justify-center rounded-xl text-3xl text-altin hover:bg-altin-acik"
              >
                ★
              </button>
            ))}
          </div>
        </>
      ) : bitti ? (
        <p className="font-semibold text-vurgu-koyu">Teşekkür ederiz. Deneyiminiz bir sonraki aileye yol gösterecek.</p>
      ) : (
        <>
          <h2 id="deneyim-baslik" className="font-semibold">
            Teşekkürler. Deneyiminizi birkaç cümleyle yazmak ister misiniz?
          </h2>
          <p className="mt-1 text-base text-metin-ikincil">İsteğe bağlı. Ne işe yaradı, neyi eksik buldunuz?</p>
          <label className="mt-3 block">
            <span className="sr-only">Deneyiminiz</span>
            <textarea
              rows={4}
              value={yorum}
              onChange={(e) => setYorum(e.target.value)}
              className="w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 py-3 text-lg"
            />
          </label>
          <label className="mt-3 block">
            <span className="block font-semibold">Baş harfleriniz ve şehriniz (isteğe bağlı)</span>
            <input
              value={kim}
              onChange={(e) => setKim(e.target.value)}
              placeholder="Örn. A.K., İzmir"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-cizgi bg-yuzey px-4 text-lg"
            />
          </label>
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-base">
            <input type="checkbox" checked={izin} onChange={(e) => setIzin(e.target.checked)} className="mt-1 size-5 shrink-0 accent-vurgu" />
            <span>Yorumumun baş harflerim ve şehrimle sitede yayınlanmasına izin veriyorum.</span>
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={mailto}
              onClick={() => {
                setBitti(true);
                olay("sonuc_paylasildi", { yontem: "deneyim_eposta" });
              }}
              aria-disabled={!yorum.trim()}
              className={`dugme dugme-birincil ${yorum.trim() ? "" : "pointer-events-none opacity-50"}`}
            >
              E-postayla gönder
            </a>
            <button type="button" onClick={() => setBitti(true)} className="dugme dugme-ikincil">
              Şimdi değil
            </button>
          </div>
          <p className="mt-2 text-sm text-metin-ikincil">
            E-posta uygulamanız hazır bir mesajla açılır; göndermeden önce metni görürsünüz. Yorumunuz sitede saklanmaz.
          </p>
        </>
      )}
    </section>
  );
}
