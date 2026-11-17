# Instrucciones para subir a GitHub

## Paso 1: Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `senderos-de-chiapas` (o el nombre que prefieras)
3. Descripción: "Next.js 14 project - Migrated from HTML template"
4. Elige si será público o privado
5. **NO** marques "Initialize this repository with a README" (ya tenemos uno)
6. Haz clic en "Create repository"

## Paso 2: Conectar y subir el código

Una vez creado el repositorio, GitHub te mostrará comandos. Usa estos comandos:

```bash
# Reemplaza USERNAME con tu usuario de GitHub y REPO_NAME con el nombre del repositorio
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

O si prefieres usar SSH:

```bash
git remote add origin git@github.com:USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Alternativa: Usar el script automático

Si ya creaste el repositorio, puedes ejecutar:

```bash
# Reemplaza con tu URL de GitHub
git remote add origin https://github.com/TU_USUARIO/senderos-de-chiapas.git
git push -u origin main
```

