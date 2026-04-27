# 🎓 Guía para Pasantes — Autonomous Task Agent

Bienvenido al proyecto **ATA**. Esta guía está diseñada para que puedas comenzar a contribuir en tu primer día.

---

## 📋 Checklist de Onboarding

Completa estas tareas en orden:

- [ ] Lee el `README.md` principal completo
- [ ] Crea una cuenta en [Supabase](https://supabase.com)
- [ ] Crea un proyecto en Supabase (free tier)
- [ ] Ejecuta el schema SQL en el SQL Editor de Supabase
- [ ] Configura `config.local.js` con tus credenciales
- [ ] Corre el proyecto localmente
- [ ] Crea tu primera tarea desde el dashboard
- [ ] Activa el Worker y mira cómo se ejecuta
- [ ] Lee este documento completo
- [ ] Habla con tu supervisor sobre tu primera tarea asignada

---

## 🗺️ Mapa del Código

### ¿Por dónde empezar?

```
Si quieres cambiar la UI          → frontend/index.html + frontend/css/dashboard.css
Si quieres cambiar la lógica DB   → frontend/js/supabase-client.js
Si quieres cambiar el agente      → agent/core/agent-core.js
Si quieres agregar herramientas   → agent/tools/example-tasks.js
Si quieres cambiar los prompts    → agent/prompts/prompts.js
Si quieres cambiar el worker      → workers/worker.js
```

### Flujo de una tarea (de principio a fin)

```
1. Usuario crea tarea en el Dashboard (index.html)
   → llama a createTask() en supabase-client.js
   → inserta fila en tabla 'tasks' con status='pending'

2. Worker hace polling (worker.js)
   → cada 5 segundos consulta: SELECT * FROM tasks WHERE status='pending'
   → reclama la tarea: UPDATE tasks SET status='running' WHERE id=...
   → llama a runTask() en agent-core.js

3. Agente ejecuta (agent-core.js)
   → recuerda memorias relevantes (recallMemory)
   → llama al LLM con el goal + contexto + memorias
   → LLM responde: { action: "tool_name", args: {...}, done: false }
   → ejecuta la herramienta (invokeTool)
   → guarda resultado en agent_memory
   → registra log en task_logs
   → repite hasta done=true o max_iterations

4. Dashboard actualiza en tiempo real
   → Supabase Realtime envía cambios vía WebSocket
   → La UI se refresca automáticamente
```

---

## 🛠️ Tareas de Práctica

### Nivel 1 — Familiarización (día 1-2)

1. **Agrega un campo nuevo a las tareas**
   - Agrega un campo `tags` (array de strings) a la tabla `tasks`
   - Muéstralo en el modal de creación de tareas
   - Muéstralo en la lista de tareas como pills/chips

2. **Mejora el badge de status**
   - Agrega íconos a los badges (✓ para completed, ⚡ para running, etc.)
   - Anima el badge de "running" con una animación CSS diferente

3. **Agrega confirmación antes de cancelar**
   - Actualmente el botón "Cancel" cancela sin pedir confirmación
   - Agrega un `confirm()` o un pequeño modal de confirmación

### Nivel 2 — Funcionalidad (día 3-5)

4. **Filtro por prioridad**
   - Agrega un slider o selector de prioridad en la vista de Tasks
   - Filtra las tareas según la prioridad seleccionada

5. **Exportar logs como CSV**
   - En la vista de Logs, agrega un botón "Export CSV"
   - Descarga los logs del task seleccionado como archivo CSV

6. **Contador de tiempo de ejecución**
   - Para tareas en estado "running", muestra un contador de tiempo activo
   - Actualízalo cada segundo con JavaScript

### Nivel 3 — Agente (día 6-10)

7. **Crea un plugin personalizado**
   - Implementa un plugin que calcule el tiempo aproximado de lectura de un texto
   - Regístralo con `AgentPlugin.register()`
   - Pruébalo creando una tarea que lo use

8. **Agrega una nueva herramienta al agente**
   - Agrega una herramienta `date_info` que retorne la fecha/hora actual y el día de la semana
   - Agrégala al objeto `TOOLS` en `agent-core.js`
   - Escribe un test manual: crea una tarea con goal "¿Qué día es hoy?"

9. **Sistema de etiquetas de memoria**
   - Agrega un campo `tags` a `agent_memory`
   - En la vista Memory, permite filtrar memorias por tag
   - Modifica la herramienta `memory_store` para aceptar tags

---

## 🐛 Cómo Hacer Debug

### El agente no ejecuta tareas

1. ¿Está el Worker iniciado? (tab Worker → botón verde)
2. ¿La tarea tiene status `pending` en Supabase? (Table Editor)
3. ¿Hay errores en la consola del navegador? (F12)
4. ¿El `SUPABASE_URL` y `SUPABASE_ANON_KEY` están bien configurados?

### El LLM no responde

1. ¿Pusiste tu API key en `config.js`?
2. El agente tiene un **fallback** que funciona sin LLM — busca logs con "Fallback"
3. Verifica el modelo: Groq → `llama3-8b-8192`, OpenAI → `gpt-3.5-turbo`

### Error 401 / 403 en Supabase

- Revisa que `anonKey` sea la clave **anon/public** (no la service_role)
- Verifica que RLS esté habilitado y las policies estén creadas (ejecuta el SQL completo)

### La UI no actualiza en tiempo real

- Verifica que Realtime esté habilitado en tu proyecto Supabase (Dashboard → Database → Replication)
- Habilita la tabla `tasks` y `task_logs` para Realtime

---

## 🔄 Git Workflow

```bash
# 1. Crea tu branch desde main
git checkout -b feature/mi-nueva-funcionalidad

# 2. Haz commits pequeños y descriptivos
git add .
git commit -m "feat: add priority filter to tasks view"

# 3. Push y crea Pull Request
git push origin feature/mi-nueva-funcionalidad
# → Abre PR en GitHub hacia main
```

### Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     solo documentación
style:    formato, no cambia lógica
refactor: refactorización sin new features
test:     agregar o modificar tests
chore:    build, configuración, etc.
```

---

## ❓ Preguntas Frecuentes

**¿Puedo usar un framework de JS?**
Por ahora no, el proyecto usa Vanilla JS a propósito para que sea fácil de entender. Si propones agregar un framework, llévalo a discusión en el equipo primero.

**¿Qué LLM recomiendan para desarrollo?**
Groq con `llama3-8b-8192` — es gratis, muy rápido, y compatible con la API de OpenAI.

**¿Cómo pruebo sin LLM?**
El agente tiene un modo fallback. Deja `apiKey` como `"YOUR_LLM_API_KEY"` y el agente ejecutará pasos predeterminados (task_splitter + memory_store).

**¿Puedo romper algo?**
Trabaja siempre en tu propio branch. Nunca hagas push directo a `main`.

---

## 📞 Contacto

- **Dudas técnicas**: Abre un Issue en GitHub con el label `question`
- **Bugs**: Abre un Issue con el label `bug` e incluye pasos para reproducir
- **Ideas**: Abre un Issue con el label `enhancement`

¡Mucho éxito y bienvenido al equipo! 🚀
