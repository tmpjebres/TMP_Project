/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    serverComponentsExternalPackages: ["pdfkit", "fontkit"],
  },
  async redirects() {
    return [
      {
        source: "/input-makam",
        destination: "/daftar-makam",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=()",
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig