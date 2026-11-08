# 3CB Code Arena — arquitectura y hoja de ruta

## Lo que ya ofrece el prototipo
- Conserva el catálogo de retos, editor, pruebas públicas locales, ranking local,
  solicitudes institucionales, panel administrativo de demostración y maratones.
- Agrega modo oscuro, modo claro y protección visual cálida.
- Agrega navegación responsive, Dev Social con snippets/comentarios locales,
  Pixel World con mascota BIT y vitrina indie local, y Arena Business con niveles
  de servicio y formulario de interés comercial.
- Corrige la referencia a una variable inexistente en el formulario de maratones.

## Lo que NO debe confundirse con producción
- `localStorage` solo existe en el navegador/dispositivo actual.
- El botón Admin no está protegido por autenticación real. El frontend nunca debe
  decidir por sí solo si alguien es administrador.
- El evaluador JavaScript ejecuta código en el navegador y solo valida ejemplos
  públicos; el resto de lenguajes usa heurísticas. No es un juez competitivo seguro.
- Los precios son hipótesis de empaquetado, no checkout ni una oferta contractual.
- No hay chat en tiempo real, moderación, subida segura de archivos ni ranking global.

## Arquitectura objetivo para Hostinger
Frontend (HTML/CSS/JS) -> API HTTPS -> Laravel 12 -> MySQL.
Autenticación: sesiones seguras o tokens gestionados en servidor, roles y permisos.
Archivos: almacenamiento privado con URLs temporales y validación de tipo/tamaño.
Juez: servicio aislado en contenedores, límites CPU/RAM/tiempo, sin acceso a secretos
ni a la red; nunca ejecutar envíos de usuarios directamente en el servidor web.
Eventos: maratones, participantes, equipos, problemas, envíos, puntuaciones y auditoría.
Social: publicaciones, fragmentos, comentarios, reacciones, reportes y moderación.
Gaming: fichas de juegos, capturas, enlaces, versiones y revisión antes de publicar.
Comercial: organizaciones, planes, suscripciones, facturas, pagos y límites por plan.

## Modelo de datos inicial sugerido
users, profiles, roles, organizations, organization_members, plans, subscriptions,
challenges, test_cases, marathons, marathon_challenges, teams, participants,
submissions, verdicts, leaderboard_snapshots, posts, code_snippets, comments,
reactions, indie_games, game_assets, reports, moderation_actions, audit_logs,
payment_customers, payment_events.

## Freemium sugerido
Community: acceso gratuito a retos públicos, perfil, publicaciones y ranking abierto.
Organizer Pro: maratones privadas, equipos, cronómetro, panel, exportaciones y reportes.
Institution: espacios multiadministrador, retos privados, branding, analítica y soporte.

Antes de cobrar, define precio final, impuestos, términos, privacidad, política de
reembolsos, pasarela de pago y automatización de activación/cancelación de planes.
