// next.config.js
export default {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "default-src *; script-src 'self' 'unsafe-eval' 'unsafe-inline' *; style-src 'self' 'unsafe-inline' *",
            },
          ],
        },
      ];
    },
  };