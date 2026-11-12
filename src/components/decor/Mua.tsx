import * as D from "./Decor";
import { MUA } from "./cau-hinh-mua";
import { FallingSnow, NoelCanopyLow, NoelCorner } from "./Noel";
export { NoelCanopyBig } from "./Noel";

export * from "./Decor";
export { MUA };

type P<T extends (...a: never[]) => unknown> = Parameters<T>[0];

export function FallingPetals(p: P<typeof D.FallingPetals>) {
  return MUA === "noel" ? <FallingSnow {...p} /> : <D.FallingPetals {...p} />;
}
export function CornerSakura(p: P<typeof D.CornerSakura>) {
  return MUA === "noel" ? <NoelCorner {...p} /> : <D.CornerSakura {...p} />;
}
export function SakuraEdge(p: P<typeof D.SakuraEdge>) {
  // Noel: dải dọc mép không dùng (nhìn như miếng chữ nhật cắt cụt); tán thông đã phủ mép trên banner.
  return MUA === "noel" ? null : <D.SakuraEdge {...p} />;
}
export function PetalsSettled(p: P<typeof D.PetalsSettled>) {
  return MUA === "noel" ? null : <D.PetalsSettled {...p} />;
}
export function CanopyLow() {
  return MUA === "noel" ? <NoelCanopyLow /> : null;
}
