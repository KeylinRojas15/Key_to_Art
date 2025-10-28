// Carrusel simple: cambiarSlide, mostrarSlide, generación de indicadores y autoplay opcional

document.addEventListener('DOMContentLoaded', function () {
    const carrusel = document.querySelector('.carrusel');
    if (!carrusel) return; // Nada que hacer si no hay carrusel

    const slides = Array.from(carrusel.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    // helper: key to identify logical slide (prefer image src)
    const keyOf = s => {
        const img = s.querySelector('img');
        if (img && img.src) return img.src;
        return s.textContent.trim();
    };

    // Build list of unique logical slides (by image src or content)
    const uniqueKeys = [];
    const keySeen = new Set();
    slides.forEach(s => {
        const k = keyOf(s);
        if (!keySeen.has(k)) {
            keySeen.add(k);
            uniqueKeys.push(k);
        }
    });

    const logicalCount = uniqueKeys.length;

    // find initial active slide (physical index) and logical index
    let physicalIndex = slides.findIndex(s => s.classList.contains('activo'));
    if (physicalIndex === -1) physicalIndex = 0;
    let logicalIndex = Math.max(0, uniqueKeys.indexOf(keyOf(slides[physicalIndex])));

    // Crear contenedor de dots si no existe
    let dotsContainer = carrusel.querySelector('.carrusel-dots');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'carrusel-dots';
        carrusel.appendChild(dotsContainer);
    }

    // Generar los dots según logicalCount
    dotsContainer.innerHTML = '';
    for (let i = 0; i < logicalCount; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.addEventListener('click', () => mostrarSlideLogical(i));
        dotsContainer.appendChild(btn);
    }
    const dots = Array.from(dotsContainer.children);

    function actualizarClases() {
        // marcar la slide física activa
        slides.forEach((s, i) => s.classList.toggle('activo', i === physicalIndex));
        // marcar el dot lógico activo
        dots.forEach((d, i) => d.classList.toggle('active', i === logicalIndex));
    }

    function mostrarSlideLogical(n) {
        // wrap
        if (n < 0) n = logicalCount - 1;
        if (n >= logicalCount) n = 0;
        logicalIndex = n;
        // find physical slide matching logical key (first occurrence)
        const key = uniqueKeys[logicalIndex];
        const target = slides.findIndex(s => keyOf(s) === key);
        if (target !== -1) physicalIndex = target;
        actualizarClases();
    }

    // expose cambiarSlide to move logical index by delta
    window.cambiarSlide = function (delta) {
        mostrarSlideLogical(logicalIndex + delta);
    };

    // Autoplay (opcional)
    let autoplayInterval = 2000;
    let autoplayId = null;

    function startAutoplay() {
        if (autoplayId) return;
        autoplayId = setInterval(() => mostrarSlideLogical(logicalIndex + 1), autoplayInterval);
    }

    function stopAutoplay() {
        if (!autoplayId) return;
        clearInterval(autoplayId);
        autoplayId = null;
    }

    // iniciar
    actualizarClases();
    startAutoplay();

    carrusel.addEventListener('mouseenter', stopAutoplay);
    carrusel.addEventListener('mouseleave', startAutoplay);
});


