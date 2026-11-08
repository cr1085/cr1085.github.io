# 3CB Code Arena — Comunidad v2

Plataforma estática creada con HTML5, CSS3 y JavaScript nativo. Conserva el diseño visual de la versión original y añade módulos locales de comunidad y maratones.

## Módulos
- Inicio y catálogo de retos.
- Editor con selector de JavaScript, Python, C, C++, Java, PHP, C#, Go, Rust, TypeScript y pseudocódigo.
- Juez local: JavaScript ejecuta ejemplos públicos; otros lenguajes reciben evaluación heurística por rúbrica, sin compilación ni ejecución real.
- Gestión administrativa de retos, estados, temporadas/semanas, lenguajes objetivo e importación/exportación JSON.
- Comunidad local: perfil, publicaciones, tipos de publicación y apoyos.
- Maratones locales: crear salas, elegir retos, duración, código y registro local de participantes.
- Ranking, solicitudes institucionales y árbitro explicativo.
- Persistencia en localStorage y exportación de respaldo JSON.

## Publicar en GitHub Pages
1. Descomprime el ZIP.
2. Crea un repositorio público en GitHub y sube `index.html`, `css/`, `js/` y `assets/` en la raíz.
3. Ve a Settings → Pages.
4. En Build and deployment selecciona Deploy from a branch, branch `main`, folder `/ (root)`, y guarda.
5. Espera a que GitHub Pages publique el sitio.

No requiere build, Node, frameworks ni servicios de pago. Mantiene el frontend estático.

## Persistencia y límites honestos
Los perfiles, posts, maratones, envíos y retos se guardan en el navegador del usuario mediante localStorage. Los datos no se comparten entre dispositivos, usuarios o instituciones. Publicar el sitio en GitHub Pages no convierte localStorage en una base de datos común. Exporta respaldos periódicamente desde Administración.

El selector permite trabajar con varios lenguajes como objetivo, pero solo JavaScript se ejecuta en el navegador. La evaluación de los demás lenguajes es una rúbrica de patrones sintácticos y no acredita que el programa compile o produzca una salida correcta. No usar para concursos oficiales de alto impacto hasta añadir ejecución real y verificación confiable.

No se usa ningún servicio externo ni librería de terceros. Las fuentes visuales usan fuentes de sistema en esta versión para evitar solicitudes externas.
