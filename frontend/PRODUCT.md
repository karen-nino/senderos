# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## What it is

Senderos de Chiapas: agencia de viajes y turismo con sede en Chiapas, México. El sitio presenta tours, paquetes, paquetes de aventura y paquetes por temporada, y lleva al visitante a cotizar o reservar (contacto directo por WhatsApp y formulario).

## Users

- Turistas nacionales e internacionales en proporción similar, planeando un viaje a Chiapas y comparando agencias.
- Idioma del sitio: español (es-MX).

## Positioning

- Operación local: guías y conocimiento de primera mano de Chiapas.
- Trato cercano y precio accesible: atención directa por WhatsApp.
- Paquetes completos: transporte, hospedaje y tours en un solo paquete.

## Content source

Todo el contenido editorial (slides del hero, tours, paquetes, temporadas, servicios, testimonio, galería) viene de Strapi. Hero slide: `title`, `subtitle`/`description`, `image`, `mobileImage`, `buttonText`/`ctaText`, `buttonLink`/`ctaLink`. Algunas imágenes subidas al hero llevan texto incrustado.

## Constraints

- No inventar testimonios, cifras ni claims; usar solo datos de Strapi.
- Stack: Next.js 14 (App Router), React 18, Bootstrap 5, SCSS global (`app/globals.scss`).
- Para el hero: sin restricciones visuales fijas confirmadas (colores, carrusel e imágenes abiertos a rediseño).
