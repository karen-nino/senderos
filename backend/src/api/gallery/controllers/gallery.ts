/**
 * gallery controller
 * Extiende el find para poblar galleryGroup.gallery (el populate por REST da 500).
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::gallery.gallery',
  ({ strapi }) => ({
    async find(ctx) {
      const queryStatus = ctx.query?.status;
      const statusParam =
        queryStatus === 'published' ? 'published' : undefined;
      try {
        const documents = strapi.documents('api::gallery.gallery');
        const result = await (documents.findFirst
          ? documents.findFirst({
              status: statusParam,
              populate: {
                imageBanner: true,
                galleryGroup: { populate: ['gallery'] },
              },
            })
          : documents.findMany({
              limit: 1,
              status: statusParam,
              populate: {
                imageBanner: true,
                galleryGroup: { populate: ['gallery'] },
              },
            }));
        const doc = Array.isArray(result) ? result[0] : result;
        if (!doc) {
          if (ctx.notFound) return ctx.notFound();
          ctx.body = { data: null };
          return;
        }
        ctx.body = { data: doc };
      } catch (e) {
        strapi.log?.error('gallery find with populate', e);
        if (ctx.internalServerError) return ctx.internalServerError();
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: { status: 500, name: 'InternalServerError', message: 'Internal Server Error' },
        };
      }
    },
  })
);
