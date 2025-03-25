import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Configura Supabase con tus credenciales
const supabaseUrl = 'https://bkdnidzlvszxokasrmol.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZG5pZHpsdnN6eG9rYXNybW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1OTQ4MTIsImV4cCI6MjA1ODE3MDgxMn0.xG8tWSaWBf2xE9VFbJmiGsYju6_xtgn_p0uO15Y5j50'; 
export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Función para registrar usuario
export async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
}

// 🔹 Función para iniciar sesión
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error("Error en inicio de sesión:", error.message);
        throw new Error(error.message);
    }

    console.log("Inicio de sesión exitoso:", data);
    return data;
}

// 🔹 Función para cerrar sesión
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}
