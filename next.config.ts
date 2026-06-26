import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Character artwork is hot-linked from AniList's CDN, never copied into the
    // bundle. Declared here so next/image works if a component ever switches to it.
    remotePatterns: [{ protocol: "https", hostname: "s4.anilist.co" }],
  },
  /* config options here */
};

export default nextConfig;
