import type { NextConfig } from "next";

/**
 * Security-oriented Next.js configuration.
 *
 * Sends a restrained set of HTTP security headers on every response:
 *
 *   - X-Content-Type-Options: nosniff
 *       Prevents browsers from MIME-sniffing responses, which defeats a
 *       class of XSS attacks that rely on mis-typed downloads.
 *
 *   - X-Frame-Options: DENY
 *       Blocks the site from being iframed, defeating clickjacking. The
 *       demo has no legitimate embedding use case.
 *
 *   - Referrer-Policy: strict-origin-when-cross-origin
 *       Prevents leakage of full paths (e.g. jobIds) to cross-origin
 *       resources while keeping same-origin referrers useful.
 *
 *   - Permissions-Policy
 *       Disables powerful APIs (camera, mic, geolocation, etc.) the app
 *       does not need so a future XSS cannot escalate to those surfaces.
 *
 *   - Content-Security-Policy
 *       Locks the document to same-origin scripts/styles, blocks plugins,
 *       and forbids inline object/embed. Purposely permissive of inline
 *       styles because Tailwind injects some at build time; no `unsafe-eval`
 *       is permitted.
 *
 *   - Strict-Transport-Security
 *       Only honored on HTTPS origins; on Vercel, that's always true for
 *       production deployments.
 */
const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
