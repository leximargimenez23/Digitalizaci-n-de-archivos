// Importa la biblioteca de Supabase
import { supabase } from "./supabase.js";

// Obtener el access_token desde la URL
const urlParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = urlParams.get('access_token');

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-password-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const mensaje = document.getElementById("mensaje");

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            mensaje.textContent = "❌ Las contraseñas no coinciden.";
            mensaje.style.color = "red";
            return;
        }

        // Validar que el token esté presente
        if (!accessToken) {
            mensaje.textContent = "❌ Error: No se encontró un token válido.";
            mensaje.style.color = "red";
            return;
        }

        try {
            // Cambiar la contraseña en Supabase
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                mensaje.textContent = `❌ Error al cambiar la contraseña: ${error.message}`;
                mensaje.style.color = "red";
                return;
            }

            // Mensaje de éxito y redirección
            mensaje.textContent = "✅ Contraseña cambiada exitosamente. Redirigiendo...";
            mensaje.style.color = "green";

            setTimeout(() => {
                window.location.href = "login.html"; // Redirige al login
            }, 3000);

        } catch (err) {
            console.error("Error inesperado:", err);
            mensaje.textContent = `❌ Error inesperado: ${err.message}`;
            mensaje.style.color = "red";
        }
    });
});
