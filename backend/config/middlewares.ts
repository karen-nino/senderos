/**
 * Middlewares. Se mantienen todos los existentes.
 * strapi::body: maxFileSize 5MB para que los uploads respeten el sizeLimit de config/plugins (upload).
 */
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
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
