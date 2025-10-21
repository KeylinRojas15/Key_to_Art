// Mostrar/ocultar botón scroll
window.onscroll = () => {
    const btn = document.getElementById("scrollTopBtn");
    if (btn) {  // Evita errores si la página no tiene el botón
        btn.style.display = (document.documentElement.scrollTop > 100) ? "block" : "none";
    }
};

// Subir al inicio
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("scrollTopBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
