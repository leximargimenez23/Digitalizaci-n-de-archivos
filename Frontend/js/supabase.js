import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Configura Supabase con tus credenciales
const supabaseUrl = 'https://bkdnidzlvszxokasrmol.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZG5pZHpsdnN6eG9rYXNybW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1OTQ4MTIsImV4cCI6MjA1ODE3MDgxMn0.xG8tWSaWBf2xE9VFbJmiGsYju6_xtgn_p0uO15Y5j50'; 
export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Función para registrar usuario y devolver su ID
export async function registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data.user; // Devolvemos el usuario para obtener el ID
}

// 🔹 Función para crear perfil después del registro
export async function createUserProfile(userId, nombre) {
    const { data, error } = await supabase
        .from("perfiles")
        .insert([{ id: userId, nombre: nombre }]);

    if (error) {
        console.error("Error al crear perfil:", error.message);
        throw new Error(error.message);
    }
    return data;
}

// 🔹 Función para iniciar sesión
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
}

// 🔹 Función para cerrar sesión
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}


