# Final prelaunch audit

## Automated gates

- `npm ci` without force or legacy peer dependency flags
- Prisma migrations against a fresh and representative legacy database
- Unit tests for authentication, API authorization, uploads, routing, sitemap, metadata, validation and XSS
- Functional database tests for create, update, delete, slug collisions and transaction rollback
- Backup creation, restore into a separate database and schema verification
- ESLint, TypeScript and production build
- Production dependency audit with no high or critical vulnerabilities
- Staging smoke checks for readiness, robots, sitemap and login

## Security review

- Signed HttpOnly admin session with expiry
- Rate limiting for failed logins
- Constant-time password comparison
- Origin checks for administrative mutations
- Upload authorization, byte signatures, size limits and random names
- Open redirect restrictions and HTTPS-only external resources
- HTML sanitization, safe JSON-LD serialization and restricted custom head code
- CSP, HSTS, nosniff, frame and referrer headers

## Performance and SEO review

- Shared settings and navigation caches with revalidation
- Paginated directory and article lists
- Indexed common Prisma filters
- Encoded and escaped sitemap URLs
- Canonical URLs restricted to the configured site
- Published dates and noIndex sitemap exclusions
- Stable organization structured data without fabricated ratings

## External release gates

These checks require the real deployment and cannot be completed by source tests alone:

1. Run the `Staging smoke test` workflow with the real HTTPS staging URL.
2. Validate representative structured data and sitemap files using Google tools.
3. Verify persistent media survives a staging redeployment.
4. Confirm the production backup destination is encrypted and retained off-server.
5. Enable GitHub branch protection for `main` and require the `quality` and `migrate` jobs.
6. Review real server response times, database logs and Core Web Vitals before public launch.
