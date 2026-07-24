/** @type {import('next').NextConfig} */
const nextConfig = {
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