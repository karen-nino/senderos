import type { Schema, Struct } from '@strapi/strapi';

export interface DestinationsDestinations extends Struct.ComponentSchema {
  collectionName: 'components_destinations_destinations';
  info: {
    displayName: 'Destinations';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    badge: Schema.Attribute.Enumeration<
      ['new', 'few_left', 'sold_out', 'hide']
    >;
    calendarEnd: Schema.Attribute.Date;
    calendarStart: Schema.Attribute.Date;
    departure: Schema.Attribute.String;
    departureDate: Schema.Attribute.String;
    description: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    home: Schema.Attribute.Boolean;
    icons: Schema.Attribute.JSON;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagesDetails: Schema.Attribute.Media<'images', true> &
      Schema.Attribute.Required;
    includes: Schema.Attribute.Blocks;
    itineraryItem: Schema.Attribute.Component<'itinerary.itinerary-item', true>;
    location: Schema.Attribute.String;
    mapItem: Schema.Attribute.Component<'destinations.map-item', true>;
    price: Schema.Attribute.String;
    route: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    transport: Schema.Attribute.String;
  };
}

export interface DestinationsMapItem extends Struct.ComponentSchema {
  collectionName: 'components_destinations_map_items';
  info: {
    displayName: 'mapItem';
  };
  attributes: {
    map: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface GalleryGallery extends Struct.ComponentSchema {
  collectionName: 'components_gallery_galleries';
  info: {
    displayName: 'Gallery';
  };
  attributes: {
    gallery: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
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
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
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
    image: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
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
    photo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    profilePhoto: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    testimonial: Schema.Attribute.Text;
  };
}

export interface InternationalInternational extends Struct.ComponentSchema {
  collectionName: 'components_international_internationals';
  info: {
    displayName: 'International';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    badge: Schema.Attribute.Enumeration<
      ['new', 'few_left', 'sold_out', 'hide']
    >;
    departure: Schema.Attribute.String;
    departureDate: Schema.Attribute.String;
    description: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    home: Schema.Attribute.Boolean;
    icons: Schema.Attribute.JSON;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagesDetails: Schema.Attribute.Media<'images', true> &
      Schema.Attribute.Required;
    includes: Schema.Attribute.Blocks;
    link: Schema.Attribute.String;
    map: Schema.Attribute.String;
    price: Schema.Attribute.String;
    route: Schema.Attribute.String;
    title: Schema.Attribute.String;
    transport: Schema.Attribute.String;
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

export interface PackagePackage extends Struct.ComponentSchema {
  collectionName: 'components_package_packages';
  info: {
    displayName: 'package';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    badge: Schema.Attribute.Enumeration<
      ['new', 'few_left', 'sold_out', 'hide']
    >;
    calendarEnd: Schema.Attribute.Date;
    calendarStart: Schema.Attribute.Date;
    departure: Schema.Attribute.String;
    departureDate: Schema.Attribute.String;
    description: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    home: Schema.Attribute.Boolean;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagesDetails: Schema.Attribute.Media<'images', true> &
      Schema.Attribute.Required;
    includes: Schema.Attribute.Blocks;
    itineraryItem: Schema.Attribute.Component<'itinerary.itinerary-item', true>;
    mapItem: Schema.Attribute.Component<'destinations.map-item', true>;
    price: Schema.Attribute.String;
    route: Schema.Attribute.Blocks;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    transport: Schema.Attribute.String;
  };
}

export interface PackageSeason extends Struct.ComponentSchema {
  collectionName: 'components_package_seasons';
  info: {
    displayName: 'season';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    badges: Schema.Attribute.Enumeration<['new']>;
    calendarEnd: Schema.Attribute.Date;
    calendarStart: Schema.Attribute.Date;
    departure: Schema.Attribute.String;
    departureDate: Schema.Attribute.String;
    description: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    home: Schema.Attribute.Boolean;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagesDetails: Schema.Attribute.Media<'images', true> &
      Schema.Attribute.Required;
    includes: Schema.Attribute.Blocks;
    itineraryItem: Schema.Attribute.Component<'itinerary.itinerary-item', true>;
    link: Schema.Attribute.String;
    mapItem: Schema.Attribute.Component<'destinations.map-item', true>;
    price: Schema.Attribute.String;
    route: Schema.Attribute.Blocks;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    transport: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'destinations.destinations': DestinationsDestinations;
      'destinations.map-item': DestinationsMapItem;
      'gallery.gallery': GalleryGallery;
      'home.hero-slide': HomeHeroSlide;
      'home.services': HomeServices;
      'home.testimonial': HomeTestimonial;
      'international.international': InternationalInternational;
      'itinerary.itinerary-item': ItineraryItineraryItem;
      'package.package': PackagePackage;
      'package.season': PackageSeason;
    }
  }
}
