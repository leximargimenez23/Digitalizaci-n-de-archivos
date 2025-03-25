import { supabase } from "./supabase.js";
import { registerUser, loginUser, logoutUser } from "./supabase.js";

document.addEventListener("DOMContentLoaded", function() {
    // 🔹 Manejo del formulario de registro
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();
            
            if (!email || !password || !confirmPassword) {
                console.error("⚠️ Todos los campos son obligatorios.");
                return;
            }
            
            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden");
                return;
            }
            
            try {
                await registerUser(email, password);
                alert("Registro exitoso. Verifica tu correo electrónico.");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error al registrar:", error.message);
                alert("Error al registrar: " + error.message);
            }
        });
    }

    // 🔹 Manejo del formulario de inicio de sesión
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            
            if (!emailInput || !passwordInput) {
                console.error("❌ Los campos de email o contraseña no se encontraron.");
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!email || !password) {
                console.error("⚠️ Debes llenar ambos campos.");
                return;
            }
            
            try {
                const { user, error } = await loginUser(email, password);
                if (error) {
                    console.error("❌ Error al iniciar sesión:", error.message);
                    return;
                }
                
                console.log("✅ Sesión iniciada:", user);
                window.location.href = "index.html"; // Redirige a la página principal
            } catch (err) {
                console.error("❌ Error inesperado:", err.message);
            }
        });
    }

    // 🔹 Manejo del cierre de sesión
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function() {
            try {
                await logoutUser();
                alert("Sesión cerrada exitosamente");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error al cerrar sesión:", error.message);
                alert("Error al cerrar sesión: " + error.message);
            }
        });
    }
});
