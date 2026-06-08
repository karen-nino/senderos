/**
 * Plugins configuration.
 * - SEO: plugin oficial para meta tags y análisis SEO en el Content Manager.
 * - Upload: Cloudinary cuando hay credenciales (prod en Fly), local en caso contrario (dev).
 *   Esto evita que las fotos se pierdan en cada deploy a Fly (filesystem efímero).
 */
export default ({ env }) => {
  const cloudinaryName = env('CLOUDINARY_NAME');
  const useCloudinary = Boolean(
    cloudinaryName && env('CLOUDINARY_KEY') && env('CLOUDINARY_SECRET'),
  );

  return {
    seo: {
      enabled: true,
    },
    upload: {
      config: useCloudinary
        ? {
            provider: 'cloudinary',
            providerOptions: {
              cloud_name: cloudinaryName,
              api_key: env('CLOUDINARY_KEY'),
              api_secret: env('CLOUDINARY_SECRET'),
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
            sizeLimit: 5 * 1024 * 1024,
            breakpoints: {
              large: 1000,
              medium: 750,
              small: 500,
            },
          }
        : {
            provider: 'local',
            providerOptions: {
              sizeLimit: 5 * 1024 * 1024,
            },
            sizeLimit: 5 * 1024 * 1024,
            breakpoints: {
              large: 1000,
              medium: 750,
              small: 500,
            },
          },
    },
  };
};
