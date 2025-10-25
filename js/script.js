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

//Menu Hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    if (menuToggle && nav) {
        // Función para alternar la visibilidad del menú
        menuToggle.addEventListener('click', function() {
            // Alterna la clase 'open' en el elemento <nav>
            nav.classList.toggle('open');
            
            // Cambiar el icono de hamburguesa (menu) a X (close)
            const icon = menuToggle.querySelector('.material-icons');
            if (nav.classList.contains('open')) {
                icon.textContent = 'close'; // Ícono 'X' de Material Icons
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                icon.textContent = 'menu'; // Ícono de hamburguesa
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Opcional: Cerrar el menú si se hace clic en un enlace (para mejor UX en móvil)
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('open');
                    menuToggle.querySelector('.material-icons').textContent = 'menu';
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});
