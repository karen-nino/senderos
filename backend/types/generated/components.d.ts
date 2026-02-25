import type { Schema, Struct } from '@strapi/strapi';

export interface GalleryGallery extends Struct.ComponentSchema {
  collectionName: 'components_gallery_galleries';
  info: {
    displayName: 'Gallery';
  };
  attributes: {
    gallery: Schema.Attribute.Media<'images', true>;
    title: Schema.Attribute.String;
  };
}

export interface HomeHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_slides';
  info: {
    displayName: 'Hero Slider';
  };
  attributes: {
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomeServices extends Struct.ComponentSchema {
  collectionName: 'components_home_services';
  info: {
    displayName: 'Services List';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images', true>;
    list: Schema.Attribute.Blocks;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomeTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_home_testimonials';
  info: {
    displayName: 'Testimonial';
  };
  attributes: {
    name: Schema.Attribute.String;
    ocupation: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
    profilePhoto: Schema.Attribute.Media<'images'>;
    testimonial: Schema.Attribute.Text;
  };
}

export interface ItineraryItineraryItem extends Struct.ComponentSchema {
  collectionName: 'components_itinerary_itinerary_items';
  info: {
    displayName: 'itineraryItem';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    activity: Schema.Attribute.String;
    dayTitle: Schema.Attribute.String;
    routeItinerary: Schema.Attribute.Blocks;
    time: Schema.Attribute.String;
  };
}

export interface MapMapItem extends Struct.ComponentSchema {
  collectionName: 'components_map_map_items';
  info: {
    displayName: 'mapItem';
  };
  attributes: {
    map: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'gallery.gallery': GalleryGallery;
      'home.hero-slide': HomeHeroSlide;
      'home.services': HomeServices;
      'home.testimonial': HomeTestimonial;
      'itinerary.itinerary-item': ItineraryItineraryItem;
      'map.map-item': MapMapItem;
    }
  }
}
