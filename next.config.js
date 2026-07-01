/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: __dirname,
    },
    // Keystone POSTs to /auth/websso/ (trailing slash). Do not 308-strip it.
    skipTrailingSlashRedirect: true,
    async rewrites() {
        return [{ source: '/auth/websso/', destination: '/auth/websso' }];
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

module.exports = nextConfig;
