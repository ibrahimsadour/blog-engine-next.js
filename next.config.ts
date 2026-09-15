import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

function getHttpsHostname(value: string | undefined): string | null {
  if (!value?.trim() || value.includes("*")) return null;

  try {
    const candidate = value.includes("://") ? value.trim() : `https://${value.trim()}`;
    const url = new URL(candidate);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      (value.includes("://") === false &&
        (url.pathname !== "/" || url.search || url.hash))
    ) {
      return null;
    }

    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

const remoteImageHosts = new Set<string>();
const siteHostname = getHttpsHostname(process.env.NEXT_PUBLIC_SITE_URL);
if (siteHostname) remoteImageHosts.add(siteHostname);

for (const configuredHost of (process.env.IMAGE_REMOTE_HOSTS || "").split(",")) {
  const hostname = getHttpsHostname(configuredHost);
  if (hostname) remoteImageHosts.add(hostname);
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https:",
  "media-src 'self' data: blob: https:",
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: Array.from(remoteImageHosts, (hostname) => ({
      protocol: "https" as const,
      hostname,
      port: "",
      pathname: "/**",
    })),
    maximumRedirects: 0,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'none'; sandbox;",
  },
};

export default nextConfig;
