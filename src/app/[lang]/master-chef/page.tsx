import Image from "next/image";
import { notFound } from "next/navigation";
import { FallingPetals } from "@/components/decor/Decor";
import { ChefWorkspace } from "@/components/chef/ChefWorkspace";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { isLocale } from "@/lib/i18n";
export const metadata={title:'Master Chef AI · Gerichte entdecken'};
export default async function ChefPage({params}:{params:Promise<{lang:string}>}) {
 const {lang}=await params;if(!isLocale(lang))notFound();
 return <><section className="sora-subpage-magic-hero"><Image src="/banner/speisekarte_hero-1920.webp" alt="" fill priority sizes="(max-width:767px) 100vw, (max-width:1199px) calc(100vw - 88px), calc(100vw - 250px)" className="sora-subpage-magic-background"/><FallingPetals className="sora-subpage-petals"/><div className="sora-subpage-magic-heading"><h1 className="text-center font-serif text-[clamp(42px,7vw,106px)] leading-tight text-gold">Master Chef AI</h1></div></section><ChefWorkspace locale={lang}/><MobileFooter locale={lang}/></>;
}
