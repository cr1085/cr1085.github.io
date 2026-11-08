# 3CB Code Arena v2 — paquete local

## Ejecutar
1. Descomprime la carpeta completa.
2. Abre una terminal dentro de `3cb-code-arena-v2`.
3. Ejecuta `python -m http.server 8000` (o `py -m http.server 8000` en Windows).
4. Abre `http://localhost:8000`.

También puedes usar la extensión Live Server de VS Code. Evita abrir `index.html` directamente con `file://`: sirve la carpeta por HTTP para que rutas, almacenamiento y futuras APIs funcionen de forma consistente.

## Estructura
- `index.html`: entrada de la aplicación.
- `css/main.css`: estilos, responsive, modo oscuro, claro y protección visual.
- `js/app.js`: aplicación y módulos locales.
- `js/storage-adapters.js`: contratos/adaptadores preparados para LocalStorage, IndexedDB, REST, Supabase y Firebase Realtime Database.
- `assets/logo.svg`: marca vectorial.

## Qué funciona localmente
- Catálogo inicial de retos y navegación.
- Editor de soluciones y ejecución local de pruebas públicas JavaScript.
- Evaluación heurística de otros lenguajes (NO compila ni ejecuta esos lenguajes).
- Ranking, perfil, publicaciones y reacciones locales.
- Creación y unión local a maratones.
- Solicitudes institucionales y panel de administración de demostración.
- Importación/exportación JSON.
- Pixel World con mascota BIT y minireto de vocabulario.
- Modos oscuro, claro y protección visual.

## Persistencia y límites
La aplicación actual conserva su base de datos de demostración en `localStorage` (`3cb-code-arena-v1`). Los datos solo existen en el navegador y perfil del dispositivo donde se crean. Borrar los datos del sitio puede eliminarlos. Usa el respaldo JSON desde Administración.

Los adaptadores de `js/storage-adapters.js` son una capa de integración para la siguiente etapa; todavía no sustituyen automáticamente el almacenamiento del `app.js`. Para sincronizar usuarios entre equipos, hay que implementar una API/backend y migrar las operaciones de lectura/escritura.

## Proveedores previstos
- Laravel 12 + MySQL/MariaDB o PostgreSQL mediante API REST.
- Supabase mediante API REST (tabla `arena_records`, con columnas `key` y `value`; configurar RLS).
- Firebase Realtime Database mediante REST y reglas de seguridad.
- IndexedDB para almacenamiento local ampliado.

No conectes desde el navegador con credenciales administrativas o contraseñas de base de datos. Las claves privadas, permisos, pagos, roles y validaciones deben vivir en backend. Supabase `anon key` solo con políticas RLS correctamente configuradas.

## Seguridad importante
Esta es una versión promocional/local, no una plataforma multiusuario segura. El selector de rol Admin es una demostración y cualquiera con acceso al navegador puede modificar datos locales. No introduzcas datos personales sensibles ni uses el ranking local como resultado oficial. El editor ejecuta código JavaScript del participante dentro del navegador: úsalo solo para prácticas confiables; para competencias públicas se necesita un juez aislado en servidor (sandbox con límites de CPU, memoria y tiempo).

## Próxima etapa
1. API de autenticación y roles reales.
2. Modelo de datos centralizado y migraciones.
3. Sincronización de perfiles, publicaciones, comentarios, maratones y ranking.
4. Juez aislado multi-lenguaje.
5. Planes freemium, pagos y panel de organizadores.
