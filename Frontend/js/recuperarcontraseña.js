import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-form");
    const emailInput = document.getElementById("email");
    const statusMessage = document.createElement("p"); // Crear un mensaje de estado
    form.appendChild(statusMessage); // Añadir el mensaje de estado al formulario

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            statusMessage.textContent = "❌ Por favor ingresa un correo electrónico válido.";
            statusMessage.style.color = "red";
            return;
        }

        try {
            // Enviar solicitud de recuperación de contraseña con Supabase
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: "https://tu-dominio.com/restablecercontraseña.html"
            });

            if (error) {
                statusMessage.textContent = `❌ Error al enviar el correo: ${error.message}`;
                statusMessage.style.color = "red";
            } else {
                statusMessage.textContent = "✅ Te hemos enviado un correo con instrucciones para restablecer tu contraseña.";
                statusMessage.style.color = "green";
            }
        } catch (err) {
            console.error("Error inesperado:", err);
            statusMessage.textContent = `❌ Error inesperado: ${err.message}`;
            statusMessage.style.color = "red";
        }
    });
});
