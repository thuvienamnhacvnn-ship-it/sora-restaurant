"use client";

/**
 * Bộ chọn màu đồ trang trí Noel (bóng, quà, nơ, chuông, sao). Cành thông giữ nguyên màu.
 * Ghi --noel-hue / --noel-sat lên <html>; nhớ lựa chọn trong localStorage.
 */
import { useEffect, useState } from "react";

const MAU = [
  { id: "classic", ten: "Klassisch Rot-Gold", hue: 0, sat: 1, chip: "#c8102e" },
  { id: "eis", ten: "Eisblau", hue: 200, sat: 0.9, chip: "#3b8fd9" },
  { id: "smaragd", ten: "Smaragd", hue: 120, sat: 0.95, chip: "#1f9d57" },
  { id: "rose", ten: "Roségold", hue: -38, sat: 0.85, chip: "#d9728a" },
] as const;

const KHOA = "sora-noel-mau";

export function NoelMauSac() {
  const [id, setId] = useState<string>("classic");
  const [mo, setMo] = useState(false);

  useEffect(() => {
    let v = "classic";
    try { v = localStorage.getItem(KHOA) || "classic"; } catch { /* bỏ qua */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(MAU.some((m) => m.id === v) ? v : "classic");
  }, []);

  useEffect(() => {
    const m = MAU.find((x) => x.id === id) ?? MAU[0];
    document.documentElement.style.setProperty("--noel-hue", `${m.hue}deg`);
    document.documentElement.style.setProperty("--noel-sat", String(m.sat));
    try { localStorage.setItem(KHOA, id); } catch { /* bỏ qua */ }
  }, [id]);

  const cur = MAU.find((m) => m.id === id) ?? MAU[0];
  return (
    <div className="noel-mau" role="group" aria-label="Farbe der Weihnachtsdeko">
      <button
        type="button"
        className="noel-mau-chip noel-mau-goc"
        title="Deko-Farbe"
        aria-label="Deko-Farbe ändern"
        aria-expanded={mo}
        style={{ background: cur.chip }}
        onClick={() => setMo((v) => !v)}
      >
        <span aria-hidden="true" className="noel-mau-sao">❄</span>
      </button>
      {mo &&
        MAU.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.ten}
            aria-label={m.ten}
            aria-pressed={id === m.id}
            className="noel-mau-chip"
            style={{ background: m.chip }}
            onClick={() => { setId(m.id); setMo(false); }}
          />
        ))}
    </div>
  );
}
