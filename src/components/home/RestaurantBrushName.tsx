import styles from "./restaurant-brush.module.css";
import { WordmarkSora } from "@/components/chu/ChuCo";

/**
 * Tên thương hiệu ở khối banner điện thoại: wordmark "SoRa" (ảnh nét cọ) +
 * chữ "Restaurant" đặt bằng FONT serif (Playfair), KHÔNG còn ghép từng chữ
 * cái cắt ra từ ảnh sprite nét cọ.
 *
 * Vì sao bỏ kiểu ghép (lời Sếp 10/10/2026): các glyph cọ khi xếp cạnh nhau bị
 * đè/chồng lệch, đọc thành "Rrestauramt" — nhìn vỡ. Chỉ giữ chữ "SoRa" cọ,
 * còn "Restaurant" dùng font cho sạch và rõ.
 */
export function RestaurantBrushName() {
  return (
    <h1 className={styles.name} aria-label="SoRa Restaurant">
      <span className="sr-only">SoRa Restaurant</span>
      <WordmarkSora trangTri nganGon className={styles.wordmark} />
      <span aria-hidden="true" className={styles.word}>
        Restaurant
      </span>
    </h1>
  );
}
