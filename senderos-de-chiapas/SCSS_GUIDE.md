# Guía de Trabajo con SCSS en Next.js

## ✅ Lo que ya está configurado:

1. **Sass instalado** - Next.js puede compilar SCSS automáticamente
2. **Archivos SCSS copiados** - Están en `styles/scss/`
3. **Hot Reload activo** - Los cambios se reflejan automáticamente

## 🚀 Cómo usar SCSS:

### Opción 1: Usar SCSS en componentes (Recomendado)

Next.js compila SCSS automáticamente cuando lo importas en componentes:

```tsx
// En cualquier componente
import styles from './mi-componente.module.scss'

export default function MiComponente() {
  return <div className={styles.container}>...</div>
}
```

### Opción 2: Usar SCSS global

Los estilos globales están en `app/globals.scss`. Este archivo importa todos los módulos SCSS.

**Para ver cambios en tiempo real:**

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Edita cualquier archivo SCSS:**
   - Archivos en `styles/scss/` (variables, mixins, etc.)
   - Archivos en `styles/scss/sections/` (estilos por sección)
   - El archivo `app/globals.scss`

3. **Los cambios se reflejan automáticamente** ✨
   - Next.js detecta cambios en SCSS
   - Recompila automáticamente
   - Recarga el navegador (Hot Module Replacement)

## 📁 Estructura de archivos SCSS:

```
styles/scss/
├── main.scss          # Archivo principal (importa todo)
├── _variables.scss    # Variables globales (colores, fuentes, etc.)
├── _mixin.scss        # Mixins reutilizables
├── _extend.scss       # Extends
├── _common.scss       # Estilos comunes
└── sections/          # Estilos por sección
    ├── _header.scss
    ├── _hero.scss
    ├── _footer.scss
    └── ...
```

## 🎨 Editar variables:

Edita `styles/scss/_variables.scss` para cambiar:
- Colores principales
- Tipografías
- Espaciados
- Tamaños de fuente

Ejemplo:
```scss
$primary-color: #63AB45;
$secondary-color: #F7921E;
```

## 💡 Tips:

1. **Hot Reload automático:** No necesitas recargar manualmente, Next.js lo hace
2. **Variables SCSS:** Úsalas en cualquier archivo `.scss`
3. **Mixins:** Reutiliza código común con `@include mi-mixin`
4. **Nested selectors:** Anida selectores para mejor organización

## ⚠️ Importante:

- Los archivos que empiezan con `_` son parciales (no se compilan solos)
- Importa archivos SCSS con `@import 'nombre'` (sin la extensión ni el `_`)
- Next.js compila SCSS a CSS automáticamente en desarrollo y producción

## 🔧 Scripts disponibles:

```bash
npm run dev        # Desarrollo con hot reload
npm run build      # Build de producción
npm run css:watch  # Watch manual de SCSS (opcional, Next.js ya lo hace)
```
