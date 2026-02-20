# Senderos de Chiapas - Next.js Project

Este proyecto ha sido migrado de HTML estático a Next.js 14 con App Router.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

### Build de Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
senderos-de-chiapas/
├── app/                    # Páginas y rutas de Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   ├── about/             # Página About
│   └── ...
├── components/            # Componentes React reutilizables
│   ├── Header.tsx         # Componente del header
│   ├── Footer.tsx         # Componente del footer
│   └── Scripts.tsx        # Carga de scripts JavaScript
├── public/                # Archivos estáticos
│   └── assets/           # Assets del template original
│       ├── images/        # Imágenes
│       ├── fonts/         # Fuentes
│       ├── css/           # Estilos CSS
│       ├── js/            # JavaScript
│       └── vendor/        # Librerías de terceros
└── HTML Template/         # Template HTML original (referencia)
```

## 🎨 Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript
- ✅ Componentes React reutilizables
- ✅ Assets migrados del template original
- ✅ Estilos CSS preservados
- ✅ JavaScript/jQuery integrado
- ✅ Responsive design
- ✅ SEO optimizado

## 📄 Páginas Disponibles

- `/` - Página de inicio
- `/about` - Sobre nosotros
- `/contact` - Contacto
- `/tour` - Tours
- `/tour-details` - Detalles de tour
- `/tours` - Destinos (tours)
- `/tour-details` - Detalles de tour
- `/blog-list` - Lista de blog
- `/blog-details` - Detalles de blog
- `/gallery` - Galería
- `/events` - Eventos
- `/shop` - Tienda
- `/product-details` - Detalles de producto

## 🔧 Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Bootstrap 5** - Framework CSS
- **jQuery** - Librería JavaScript
- **Slick Slider** - Carruseles
- **Magnific Popup** - Popups de imágenes
- **WOW.js** - Animaciones
- **Font Awesome** - Iconos

## 📝 Notas de Migración

1. Los assets (imágenes, CSS, fuentes) se han copiado a `public/assets/`
2. Los componentes HTML se han convertido a componentes React
3. Las rutas HTML se han convertido a rutas de Next.js
4. Los scripts JavaScript se cargan dinámicamente en el componente `Scripts`
5. Las imágenes se optimizan automáticamente con Next.js Image

## 🛠️ Próximos Pasos

- [ ] Migrar todas las páginas restantes
- [ ] Optimizar imágenes con next/image
- [ ] Convertir jQuery a React hooks donde sea posible
- [ ] Agregar TypeScript types para mejor tipado
- [ ] Implementar internacionalización (i18n) si es necesario
- [ ] Agregar tests

## 📞 Soporte

Para más información sobre el template original, consulta la carpeta `Documentation/`.

