// Carrusel simple: cambiarSlide, mostrarSlide, generación de indicadores y autoplay opcional

document.addEventListener('DOMContentLoaded', function () {
    const carrusel = document.querySelector('.carrusel');
    if (!carrusel) return; // Nada que hacer si no hay carrusel

    const slides = Array.from(carrusel.querySelectorAll('.slide'));
    let indiceActual = slides.findIndex(s => s.classList.contains('activo'));
    if (indiceActual === -1) indiceActual = 0;

    // Crear contenedor de dots si no existe
    let dotsContainer = carrusel.querySelector('.carrusel-dots');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'carrusel-dots';
        carrusel.appendChild(dotsContainer);
    }

    // Asegurar que solo se generen 3 dots para las diapositivas originales
    const slidesOriginales = Array.from(carrusel.querySelectorAll('.slide'));
    const maxDots = 3; // Limitar a 3 dots

    // Limitar la generación de dots a las primeras 3 diapositivas
    slidesOriginales.slice(0, maxDots).forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.addEventListener('click', () => mostrarSlide(idx));
        dotsContainer.appendChild(btn);
    });

    const dots = Array.from(dotsContainer.children); // Actualizar referencia a los dots

    function actualizarClases() {
        slides.forEach((s, i) => s.classList.toggle('activo', i === indiceActual));
        dots.forEach((d, i) => d.classList.toggle('active', i === indiceActual));
    }

    // Mostrar la slide en el índice dado
    function mostrarSlide(n) {
        if (n < 0) n = slides.length - 1;
        if (n >= slides.length) n = 0;
        indiceActual = n;
        actualizarClases();
    }

    // Función expuesta para los botones prev/next en el HTML
    window.cambiarSlide = function (delta) {
        mostrarSlide(indiceActual + delta);
    };

    // Autoplay (opcional) — 5 segundos por slide
    let autoplayInterval = 5000;
    let autoplayId = null;

    function startAutoplay() {
        if (autoplayId) return;
        autoplayId = setInterval(() => mostrarSlide(indiceActual + 1), autoplayInterval);
    }

    function stopAutoplay() {
        if (!autoplayId) return;
        clearInterval(autoplayId);
        autoplayId = null;
    }

    // Iniciar con la slide correcta y autoplay
    actualizarClases();
    startAutoplay();

    // Pausar autoplay al poner el cursor sobre el carrusel
    carrusel.addEventListener('mouseenter', stopAutoplay);
    carrusel.addEventListener('mouseleave', startAutoplay);
});

// --- Carrusel horizontal de categorías (infinite loop) ---
document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('.carruselcircular');
    if (!root) return;

    const viewport = root.querySelector('.circulos');
    const track = root.querySelector('.circulosmoviles');
    const originalItems = Array.from(track.children).map(n => n.cloneNode(true));
    const btnPrev = root.querySelector('.anterior');
    const btnNext = root.querySelector('.siguiente');

    let visibleCount = 4;
    let index = 0; // Apunta al track reconstruido
    let isMoving = false;
    let autoplayId = null;

    function getVisibleCount() {
        const w = viewport.clientWidth;
        if (w >= 900) return 4;
        if (w >= 700) return 3;
        if (w >= 480) return 2;
        return 1;
    }

    function getGap() {
        const style = getComputedStyle(track);
        return parseFloat(style.gap) || 0;
    }

    function rebuildTrack() {
        visibleCount = getVisibleCount();
        track.innerHTML = '';
        const n = originalItems.length;

        // Prepend clones
        for (let i = n - visibleCount; i < n; i++) {
            track.appendChild(originalItems[i].cloneNode(true));
        }

        // Add originals
        for (let i = 0; i < n; i++) {
            track.appendChild(originalItems[i].cloneNode(true));
        }

        // Append clones
        for (let i = 0; i < visibleCount; i++) {
            track.appendChild(originalItems[i].cloneNode(true));
        }

        index = visibleCount; // Apunta al primer original
        adjustSizes();
        setPosition(true);
    }

    function adjustSizes() {
        const all = Array.from(track.children);
        const gap = getGap();
        const vw = viewport.clientWidth;
        const itemWidth = (vw - gap * (visibleCount - 1)) / visibleCount;
        all.forEach(it => it.style.minWidth = `${itemWidth}px`);
    }

    function setPosition(noTransition) {
        const gap = getGap();
        const item = track.children[0];
        const itemW = item.getBoundingClientRect().width;
        const step = itemW + gap;
        track.style.transition = noTransition ? 'none' : 'transform 0.45s ease';
        track.style.transform = `translateX(${-index * step}px)`;
    }

    function moveOne(delta) {
        if (isMoving) return;
        isMoving = true;
        index += delta;
        setPosition(false);
    }

    track.addEventListener('transitionend', () => {
        const origCount = originalItems.length;
        const gap = getGap();
        const itemW = track.children[0].getBoundingClientRect().width;
        const step = itemW + gap;

        if (index < visibleCount) {
            track.style.transition = 'none';
            index += origCount;
            track.style.transform = `translateX(${-index * step}px)`;
        }

        if (index > visibleCount + origCount - 1) {
            track.style.transition = 'none';
            index -= origCount;
            track.style.transform = `translateX(${-index * step}px)`;
        }

        setTimeout(() => isMoving = false, 20);
    });

    // Inicializar
    rebuildTrack();
    window.addEventListener('resize', () => setTimeout(rebuildTrack, 120));

    if (btnPrev) btnPrev.addEventListener('click', () => moveOne(-1));
    if (btnNext) btnNext.addEventListener('click', () => moveOne(1));

    autoplayId = setInterval(() => moveOne(1), 3500);
    root.addEventListener('mouseenter', () => clearInterval(autoplayId));
    root.addEventListener('mouseleave', () => autoplayId = setInterval(() => moveOne(1), 3500));

    // Swipe táctil
    let startX = 0, dx = 0;
    viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoplayId);
    });

    viewport.addEventListener('touchmove', (e) => {
        dx = e.touches[0].clientX - startX;
    });

    viewport.addEventListener('touchend', () => {
        if (Math.abs(dx) > 40) moveOne(dx < 0 ? 1 : -1);
        dx = 0;
        autoplayId = setInterval(() => moveOne(1), 3500);
    });
});
