# 3CB Code Arena

Prototipo funcional de interfaz para la plataforma de programación competitiva de 3CB Soluciones Tecnológicas.

## Tecnologías
- HTML5
- CSS3
- JavaScript nativo con módulos ES
- localStorage para persistencia local del prototipo
- SVG para el logotipo

No utiliza React, Vue, Laravel ni un backend propio.

## Ejecutar
Como usa módulos JavaScript, es recomendable servir la carpeta mediante un servidor estático local. Por ejemplo, si tienes Python instalado:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

También puedes publicarlo como sitio estático, teniendo en cuenta las limitaciones descritas abajo.

## Funciones incluidas
- Inicio y catálogo de retos.
- Tres retos de ejemplo.
- Filtros y búsqueda.
- Vista de enunciado y ejemplos.
- Editor de JavaScript.
- Evaluación local de los ejemplos públicos para los retos B-01 e I-01 mediante `solve(input)`.
- Registro local de envíos y ranking local.
- Árbitro explicativo basado en reglas.
- Formulario de solicitudes institucionales.
- Panel de administración local para crear/editar/publicar retos.
- Importación y exportación JSON.
- Diseño responsive.

## Limitaciones importantes
Este proyecto es un prototipo frontend. Los datos viven en el navegador actual y no se sincronizan entre usuarios ni dispositivos. La autenticación no está implementada. El formulario de institución guarda localmente y NO envía correos ni notifica automáticamente a 3CB.

El evaluador inicial ejecuta JavaScript escrito por el participante dentro del navegador mediante `Function`; esto NO debe usarse como juez oficial de producción ni como entorno seguro para código no confiable. No hay aislamiento robusto, límites de CPU/memoria ni casos ocultos protegidos. El botón de evaluación solo verifica los ejemplos públicos disponibles. El reto avanzado no tiene un evaluador de referencia completo en esta versión.

Python, C y Java aparecen en la visión del producto, pero todavía no se ejecutan en esta aplicación. Para evaluarlos sin servicios de pago, se debe integrar y probar un runtime local compatible en navegador o desplegar un ejecutor aislado propio. No se debe afirmar soporte de un lenguaje antes de validar ejecución real.

No uses esta versión para competiciones oficiales con puntuación de alto impacto, licencias seguras ni datos personales reales. Para una operación multiusuario confiable hace falta un servicio de persistencia/autenticación y un mecanismo seguro de ejecución; el frontend puede seguir siendo HTML, CSS y JavaScript nativos.

## Archivos
- `index.html`
- `css/main.css`
- `js/app.js`
- `assets/logo.svg`

## Marca y propiedad
3CB Code Arena — 3CB Soluciones Tecnológicas. Ajusta la información de contacto y condiciones legales antes de publicar.
