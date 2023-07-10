/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    appDir: true,
  },
  env: {
    WS_URL: process.env.WS_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
        'supports-color': 'supports-color',
      });
    }

    return config;
  },
};
