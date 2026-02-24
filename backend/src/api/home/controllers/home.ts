/**
 * home controller
 * Fuerza populate de heroSlides e image para que la API siempre devuelva las imágenes (ej. fiesta-grande.webp).
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::home.home', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: {
        ...(typeof ctx.query?.populate === 'object' && ctx.query.populate !== null ? ctx.query.populate : {}),
        heroSlides: {
          populate: ['image'],
        },
        services: { populate: ['image'] },
        testimonial: { populate: ['profilePhoto', 'photo'] },
        gallery: true,
      },
    };
    const result = await super.find(ctx as never);
    return result ?? { data: null };
  },
}));
