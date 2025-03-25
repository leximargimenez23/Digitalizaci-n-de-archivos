// Importar la biblioteca de Supabase
import { supabase } from "./supabase.js"; // Asegúrate de que el archivo `supabase.js` está en la misma carpeta

// Obtener el `access_token` desde la URL (puede venir en `hash` o `search`)
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get("access_token");

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("change-password-form");

    if (!form) {
        console.error("Error: No se encontró el formulario. Verifica que el ID sea correcto en el HTML.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const mensaje = document.getElementById("mensaje");

        // Limpiar mensaje previo
        mensaje.textContent = "";
        mensaje.style.color = "black";

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
            const { error } = await supabase.auth.api.updateUser(
                accessToken,
                { password: newPassword }
            );

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
