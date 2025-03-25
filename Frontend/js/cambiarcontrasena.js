import { supabase } from "./supabase.js";  // Asegúrate de que la importación sea correcta

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("change-password-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');

        if (!accessToken) {
            alert("Token de acceso no válido");
            return;
        }

        try {
            const { error } = await supabase.auth.api.updateUser(accessToken, { password: newPassword });

            if (error) {
                alert("Error al cambiar la contraseña: " + error.message);
                return;
            }

            alert("Contraseña cambiada con éxito");
            window.location.href = "login.html";  // Redirige a la página de inicio de sesión
        } catch (err) {
            console.error("Error inesperado:", err);
            alert("Error inesperado: " + err.message);
        }
    });
});
