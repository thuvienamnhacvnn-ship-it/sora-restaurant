import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import styles from "./home-dishes.module.css";

export function TableSetting({ locale }: { locale: Locale }) {
  return <figure className={styles.tableSetting} tabIndex={0} aria-label={locale === "vi" ? "Cốc và nến trên bàn" : "Gläser und Kerzenlicht"}>
    <Image src="/hero/table-glasses-candle-v3.png" alt="" aria-hidden width={1536} height={1024} sizes="(max-width: 1199px) 340px, 440px" />
    <span className={styles.candleGlow} aria-hidden="true" />
    <span className={styles.candleFlame} aria-hidden="true"><i /></span>
  </figure>;
}
