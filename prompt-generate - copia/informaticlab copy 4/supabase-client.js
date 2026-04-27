// ================================================
// supabase-client.js
// Inicialización de Supabase
// ================================================

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO SUPABASE
// Los encuentras en: Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://rvgaozmexpocgxtlomkh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2Fvem1leHBvY2d4dGxvbWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzMzOTIsImV4cCI6MjA4NzY0OTM5Mn0.SPssPQGYL541QpD7GZv6WHzCSMzmXAFGYHJRsfjfWmQ';

// Inicializar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar como variable global (usada en todos los archivos)
window.supabase = supabaseClient;

console.log('✅ Supabase inicializado correctamente');
