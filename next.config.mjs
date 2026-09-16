import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'qrcode.react', 'html5-qrcode'],
  },
  // En-têtes de sécurité renforcés HTTP
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // 🔒 CSP durci : Stripe supprimé, QR server ajouté, sources minimisées
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-inline requis pour Next.js SSR — ne pas retirer
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              // img-src : Supabase storage + QR server + blob/data
              "img-src 'self' blob: data: https: https://*.supabase.co https://api.qrserver.com",
              // connect-src : Supabase, Sentry monitoring, Google Gemini & QR
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.qrserver.com https://unpkg.com https://generativelanguage.googleapis.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
              // worker-src : Service workers pour Push Notifications & Sentry replay
              "worker-src 'self' blob:",
              // frame-src : Stripe supprimé
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
          {
            // 🔒 HSTS : Force HTTPS pendant 1 an avec includeSubDomains
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
      {
        source: "/(icon.svg|manifest.json|robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "menufid",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: true,

  telemetry: false,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
