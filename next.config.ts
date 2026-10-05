import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt huy hiệu dev của Next để ảnh chụp QA không dính nó.
  devIndicators: false,
  /*
   * `/` -> `/de`. Toàn bộ route nằm dưới `app/[lang]/` để <html lang> đổi được
   * theo ngôn ngữ; DE là mặc định cho tới khi Sếp duyệt bản dịch VI.
   */
  async redirects() {
    return [{ source: "/", destination: "/de", permanent: false }];
  },
};

export default nextConfig;
