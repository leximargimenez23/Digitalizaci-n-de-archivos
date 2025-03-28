import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("change-password-form");

    if (!form) {
        console.error("Error: No se encontró el formulario.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const mensaje = document.getElementById("mensaje");

        // Limpiar mensajes anteriores
        mensaje.textContent = "";
        mensaje.style.color = "black";

        // Verificar que las contraseñas coincidan antes de cualquier otra operación
        if (newPassword !== confirmPassword) {
            mensaje.textContent = "❌ Las contraseñas no coinciden.";
            mensaje.style.color = "red";
            return;
        }

        try {
            // Obtener la sesión actual
            const { data: session, error: sessionError } = await supabase.auth.getSession();

            // Verificar si la sesión es válida
            if (sessionError || !session || !session.session) {
                mensaje.textContent = "❌ Error: No hay sesión activa. Inicia sesión nuevamente.";
                mensaje.style.color = "red";
                // Redirigir al usuario a la página de login si la sesión no es válida
                window.location.href = 'login.html'; 
                return;
            }

            // Cambiar la contraseña usando el método correcto
            const { error } = await supabase.auth.update({
                password: newPassword
            });

            // Verificar si hubo un error en el proceso de cambio de contraseña
            if (error) {
                mensaje.textContent = `❌ Error al cambiar la contraseña: ${error.message}`;
                mensaje.style.color = "red";
                return;
            }

            // Si no hubo errores, informar al usuario
            if (mensaje) {
                mensaje.textContent = "✅ Contraseña cambiada exitosamente. Redirigiendo...";
                mensaje.style.color = "green";
            }

            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = "Frontend/login.html"; // Redirige al login
            }, 3000);

        } catch (err) {
            console.error("Error inesperado:", err);
            if (mensaje) {
                mensaje.textContent = `❌ Error inesperado: ${err.message}`;
                mensaje.style.color = "red";
            }
        }
    });
});
