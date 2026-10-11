import { restaurant } from "@/data/restaurant";
import { Icon } from "@/components/ui/Icon";

export function SidebarSocial() {
  const links = [
    { name: "Instagram", url: restaurant.instagram ? `https://instagram.com/${restaurant.instagram}` : null, icon: "instagram" },
    { name: "WhatsApp", url: restaurant.whatsapp ? `https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}` : null, icon: "whatsapp" },
    { name: "Facebook", url: restaurant.facebook, icon: "facebook" },
  ];
  return <div className="sora-sidebar-social" aria-label="Social Media">{links.map(item => {
    const icon = item.icon === "facebook" ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M14 21v-8h3l.5-4H14V7c0-1 .3-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8z" /></svg> : <Icon name={item.icon} size={20} />;
    return item.url ? <a key={item.name} href={item.url} aria-label={item.name} title={item.name} target="_blank" rel="noopener noreferrer">{icon}</a> : <span key={item.name} aria-label={item.name} aria-disabled="true" title={item.name}>{icon}</span>;
  })}</div>;
}
