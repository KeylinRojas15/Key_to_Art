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


