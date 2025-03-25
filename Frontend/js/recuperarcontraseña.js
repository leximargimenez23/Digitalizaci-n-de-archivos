import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", function() {
    const resetForm = document.getElementById("reset-form");

    if (!resetForm) {
        console.error("❌ No se encontró el formulario de recuperación.");
        return;
    }

    resetForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        if (!emailInput) {
            console.error("❌ No se encontró el campo de email.");
            return;
        }

        const email = emailInput.value.trim();
        if (!email) {
            alert("⚠️ Por favor, ingresa tu correo electrónico.");
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                console.error("❌ Error al enviar el correo:", error.message);
                alert("Error: " + error.message);
                return;
            }
            alert("✅ Enlace de recuperación enviado. Revisa tu correo.");
        } catch (err) {
            console.error("❌ Error inesperado:", err.message);
            alert("Error inesperado: " + err.message);
        }
    });
});
