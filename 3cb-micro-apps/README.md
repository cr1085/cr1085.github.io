# 3CB Micro Apps

Portal de microherramientas para emprendedores, desarrollado con HTML, CSS y JavaScript puro.

## Características
- 15 herramientas en el catálogo.
- Navegación y búsqueda sin framework.
- Diseño adaptable a móvil y escritorio.
- Tema claro/oscuro.
- PWA con Service Worker y caché offline.
- Procesamiento local, sin backend ni base de datos.

## Ejecutar localmente
Los Service Workers requieren HTTPS o localhost. Desde la carpeta del proyecto puedes iniciar un servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

No abras `index.html` directamente con `file://` si quieres probar el modo offline.

## Publicar en GitHub Pages
1. Crea un repositorio público llamado `3cb-micro-apps`.
2. Sube el contenido de esta carpeta a la raíz del repositorio.
3. En GitHub abre Settings → Pages.
4. En Build and deployment selecciona Deploy from a branch.
5. Selecciona `main` y `/ (root)`.
6. Guarda y espera a que GitHub publique el sitio.

## Estado de herramientas
Las 15 herramientas aparecen en el catálogo. Las calculadoras, documentos imprimibles, tarjeta PNG, generadores de texto y engagement están implementados en esta versión inicial. El generador QR queda marcado como próximamente hasta integrar y probar una biblioteca local de generación QR.

## Consideraciones
- La factura/comprobante es un documento comercial no fiscal.
- Las tasas de impuestos son configurables y deben verificarse antes de su uso.
- El modo offline se activa tras una primera carga exitosa con conexión.
- Revisa las dependencias y políticas antes de distribuir una versión de producción.
