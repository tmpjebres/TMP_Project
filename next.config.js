/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Route lama dari era navigasi berbasis state: 'input-makam' dulu me-render
      // DaftarMakam. Dialihkan di level HTTP supaya tautan lama tidak mati.
      {
        source: "/dashboard/input-makam",
        destination: "/dashboard/daftar-makam",
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
