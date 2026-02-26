/**
 * Plugins configuration.
 * - SEO: plugin oficial para meta tags y análisis SEO en el Content Manager.
 * - Upload: provider local, límite 5MB, breakpoints para imágenes responsivas (thumbnails).
 * No se modifican configuraciones sensibles (auth, transfer, etc.); eso sigue en config/admin.ts.
 */
export default ({ env }) => ({
  seo: {
    enabled: true,
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 5 * 1024 * 1024, // 5MB (local provider)
      },
      sizeLimit: 5 * 1024 * 1024, // 5MB (límite del plugin Upload)
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500,
      },
    },
  },
});
