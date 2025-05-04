document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const role = document.getElementById("register-role").value;

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value.trim();

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role })
                });

                const data = await res.json();

                if (res.ok && data.token) {
                    // Guardar el token en localStorage
                    localStorage.setItem("token", data.token);
                    
                    // Decodificar el token y almacenar el rol en localStorage
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    localStorage.setItem("role", payload.role);  // Guardar el rol en localStorage
                    
                    console.log("Token decodificado: ", payload);  // Solo para debugging

                    window.location.href = "index.html";  // Redirigir al index
                } else {
                    alert(data.message || "Login fallido");
                }
            } catch (err) {
                console.error("Error al hacer login", err);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role })
                });

                const data = await res.json();

                if (res.ok && data.message) {
                    alert("Registro exitoso. Ahora puedes iniciar sesión.");
                    document.getElementById("show-login").click();
                } else {
                    alert(data.message || "Registro fallido");
                }
            } catch (err) {
                console.error("Error al registrar", err);
            }
        });
    }

    const loginBtn = document.getElementById("show-login");
    const registerBtn = document.getElementById("show-register");

    if (loginBtn && registerBtn) {
        loginBtn.addEventListener("click", () => {
            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");
        });

        registerBtn.addEventListener("click", () => {
            registerForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
        });
    }
});
