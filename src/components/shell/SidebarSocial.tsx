import { restaurant } from "@/data/restaurant";
import { Icon } from "@/components/ui/Icon";

export function SidebarSocial() {
  const links = [
    { name: "Instagram", url: restaurant.instagram ? `https://www.instagram.com/${restaurant.instagram}` : null, icon: "instagram" },
    { name: "WhatsApp", url: restaurant.whatsapp ? `https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}` : null, icon: "whatsapp" },
    { name: "TikTok", url: restaurant.tiktok ? `https://www.tiktok.com/@${restaurant.tiktok}` : null, icon: "tiktok" },
  ];
  return <div className="sora-sidebar-social" aria-label="Social Media">{links.map(item => {
    const icon = <Icon name={item.icon} size={20} />;
    return item.url ? <a key={item.name} href={item.url} aria-label={item.name} title={item.name} target="_blank" rel="noopener noreferrer">{icon}</a> : <span key={item.name} aria-label={item.name} aria-disabled="true" title={item.name}>{icon}</span>;
  })}</div>;
}
