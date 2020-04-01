module.exports = {
  server_endpoint: 'https://comty.julioworld.club',
  siteName: 'Comty',
  copyright: 'RageStudio©',

  LogoPath: '/logo.svg',
  FullLogoPath: '/full_logo.svg',
  DarkFullLogoPath: '/dark_full_logo.svg',
  DarkLogoPath: '/dark_logo.svg',

  resource_bundle: 'light_ng',
  sync_server: 'http://eu653-node.ragestudio.net:5500',

  /* Layout configuration, specify which layout to use for route. */
  layouts: [
    {
      name: 'primary',
      include: [/.*/],
      exclude: [/\/login/, /\/socket\/(.*)/, /\/publics/, /\/authorize/],
    },
  ],

  i18n: {
    languages: [
      {
        key: 'en',
        title: 'English',
      },
    ],
    defaultLanguage: 'en',
  },
}
