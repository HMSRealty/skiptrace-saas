/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Images are self-hosted brand assets (SVG/raster) in /public, so we skip
    // the optimizer entirely — guarantees rendering on any host with no
    // external dependency. Swap in real photos under /public/products/.
    unoptimized: true,
  },
};

export default nextConfig;
