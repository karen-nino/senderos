/**
 * Middlewares. Se mantienen todos los existentes.
 * strapi::body: maxFileSize 5MB para que los uploads respeten el sizeLimit de config/plugins (upload).
 */
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    // El sitio consulta Strapi desde el servidor de Next (sin CORS); el navegador solo lo usa en el admin.
    // Se limita a esos orígenes en lugar del '*' por defecto.
    name: 'strapi::cors',
    config: {
      origin: [
        'https://senderosdechiapas.com.mx',
        'https://www.senderosdechiapas.com.mx',
        'https://senderos-backend.fly.dev',
        'http://localhost:3000',
        'http://localhost:1337',
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: 5 * 1024 * 1024, // 5MB, coherente con upload.sizeLimit
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
