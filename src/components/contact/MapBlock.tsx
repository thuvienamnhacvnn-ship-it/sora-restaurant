/*
 * Khối bản đồ.
 *
 * `googleMapsUrl` còn null — chưa ai gửi hồ sơ Google Business của quán. Nhúng
 * iframe Google Maps "đoán" theo địa chỉ là tự dựng một hồ sơ không ai xác
 * nhận, nên KHÔNG nhúng. Cũng KHÔNG vẽ bản đồ giả: mọi nét ở đây là khung
 * trang trí, không mô phỏng đường phố thật.
 *
 * Thay vào đó: khối tĩnh ghi địa chỉ ĐÃ XÁC MINH + nút chỉ đường mở Google
 * Maps bằng chính địa chỉ đó (tìm theo chuỗi, không phải place-id bịa).
 * Khối cao bằng chỗ bản đồ trong mẫu để cột trái không hụt so với cột form.
 *
 * Khi Sếp gửi link chính thức: điền `googleMapsUrl` trong
 * data/restaurant-info.json, nhánh `hasMap()` tự chuyển sang iframe.
 */
import { Icon } from "@/components/ui/Icon";
import { ChoSep } from "@/components/ui/ChoSep";
import { addressLines, hasMap, restaurant } from "@/data/restaurant";

function directionsHref(): string {
  const a = restaurant.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${a.street}, ${a.postalCode} ${a.city}`
  )}`;
}

export function MapBlock({
  title,
  routeLabel,
}: {
  /** Tiêu đề cho máy đọc màn hình — mẫu không in tiêu đề cho khối này. */
  title: string;
  routeLabel: string;
}) {
  if (hasMap()) {
    return (
      <section className="sora-card overflow-hidden">
        <h2 className="sr-only">{title}</h2>
        <iframe
          src={restaurant.googleMapsUrl ?? ""}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[260px] w-full border-0"
        />
      </section>
    );
  }

  return (
    <section className="sora-card relative isolate flex min-h-[230px] flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center">
      <h2 className="sr-only">{title}</h2>

      {/* decor: mẫu 06 KHÔNG có hoạ tiết nào ở khối bản đồ — soi 1:1 góc
          trên-trái (x 258→518, y 580→720 trên khung 1672) thì sạch. Cành hoa
          cũ ở đây còn vi phạm luật "không dán decor lên ảnh". Đã gỡ. */}

      <span className="grid size-14 place-items-center rounded-full border border-gold/45 bg-bg text-gold">
        <Icon name="map-pin" size={26} />
      </span>

      <address className="space-y-0.5 text-[16px] leading-snug not-italic text-text">
        {addressLines().map((line) => (
          <p key={line}>{line}</p>
        ))}
      </address>

      <a
        href={directionsHref()}
        target="_blank"
        rel="noreferrer"
        className="sora-btn-ghost"
      >
        <Icon name="map-pin" size={16} />
        {routeLabel}
        <Icon name="arrow-right" size={16} />
      </a>

      <ChoSep note="Google-Maps-Link des Restaurants (für die eingebettete Karte)" />
    </section>
  );
}
