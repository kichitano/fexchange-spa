/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-vercel-app.vercel.app',
  generateRobotsTxt: true,
  exclude: [
    '/auth/*',
    '/dashboard/*', // Páginas privadas
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/dashboard/'],
      },
    ],
  },
}