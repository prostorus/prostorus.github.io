// --- КОНФИГУРАЦИЯ ---
const swiper = document.getElementById('swiper');
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let currentSlideIndex = 0;
let isAnimating = false;
let startY = 0;

// --- ИНИЦИАЛИЗАЦИЯ ---
updateBackground();

// --- УПРАВЛЕНИЕ СВАЙПАМИ ---
document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    handleSwipe(startY, endY);
}, {passive: false});

// Для тестирования с колесиком мыши
document.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    if (e.deltaY > 0) nextSlide();
    else prevSlide();
});

function handleSwipe(start, end) {
    if (isAnimating) return;
    const threshold = 50; 
    if (start - end > threshold) {
        nextSlide();
    } else if (end - start > threshold) {
        prevSlide();
    }
}

function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        switchSlide(currentSlideIndex + 1);
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        switchSlide(currentSlideIndex - 1);
    }
}

function restart() {
    switchSlide(0);
}

// --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
function switchSlide(index) {
    if (isAnimating) return;
    isAnimating = true;

    // Удаляем старые состояния
    slides[currentSlideIndex].classList.remove('active');
    
    // Определяем направление и чистим классы
    if (index > currentSlideIndex) {
        // Листаем вперед
        slides[currentSlideIndex].classList.add('prev');
    } else {
        // Листаем назад
        slides[index].classList.remove('prev');
        slides[currentSlideIndex].classList.remove('prev');
    }

    // Финальная чистка для уверенности
    slides.forEach((s, i) => {
        if (i > index) s.classList.remove('active', 'prev');
    });

    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');

    updateBackground();
    triggerEffects();

    // Блокировка на время анимации
    setTimeout(() => {
        isAnimating = false;
    }, 700);
}

function updateBackground() {
    const bg = slides[currentSlideIndex].getAttribute('data-bg');
    if (bg) document.body.style.backgroundColor = bg;
}

// --- ЭФФЕКТЫ ---
function triggerEffects() {
    const currentSlide = slides[currentSlideIndex];

    // 1. Конфетти (Разные типы)
    if (currentSlide.classList.contains('confetti-track')) {
        spawnConfetti(['#ff3b3b', '#ffffff']);
    }
    if (currentSlide.classList.contains('confetti-album')) {
        spawnConfetti(['#FFA500', '#ffffff']);
    }
    if (currentSlide.classList.contains('confetti-stat')) {
        spawnConfetti(['#FFD700', '#1DB954']);
    }
    if (currentSlide.classList.contains('confetti-tg')) {
        spawnConfetti(['#1E90FF', '#ffffff']);
    }

    // 2. Титры (Вертикальный подъем)
    const crawl = document.getElementById('crawl-text');
    if (crawl) {
        crawl.classList.remove('running');
        if (currentSlide.classList.contains('effect-starwars')) {
            void crawl.offsetWidth; // Force reflow
            crawl.classList.add('running');
        }
    }

    // 3. Салюты
    const canvas = document.getElementById('fireworksCanvas');
    if (currentSlide.classList.contains('effect-fireworks')) {
        canvas.style.display = 'block';
        startFireworks();
    } else {
        canvas.style.display = 'none';
        stopFireworks();
    }
}

function spawnConfetti(colors) {
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors
        });
    }, 300);
}


// --- REAL FIREWORKS ENGINE ---
let fwInterval;
let ctx;
let fwCanvas;
let particles = [];

function startFireworks() {
    fwCanvas = document.getElementById('fireworksCanvas');
    if (!fwCanvas) return;
    ctx = fwCanvas.getContext('2d');
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    particles = [];

    if (!fwInterval) {
        animateFireworks();
        fwInterval = setInterval(createRocket, 800);
    }
}

function stopFireworks() {
    clearInterval(fwInterval);
    fwInterval = null;
    particles = [];
}

function createRocket() {
    const x = Math.random() * fwCanvas.width;
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    createExplosion(x, fwCanvas.height * 0.2 + Math.random() * (fwCanvas.height * 0.4), color);
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle(x, y, color));
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 2;
        this.dx = Math.cos(angle) * velocity;
        this.dy = Math.sin(angle) * velocity;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity;
        this.alpha -= this.decay;
        this.dx *= 0.98;
        this.dy *= 0.98;
    }
}

function animateFireworks() {
    const cvs = document.getElementById('fireworksCanvas');
    if (!cvs || cvs.style.display === 'none') return;
    
    requestAnimationFrame(animateFireworks);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
    ctx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.alpha > 0) {
            p.update();
            p.draw();
        } else {
            particles.splice(i, 1);
        }
    }
}

window.addEventListener('resize', () => {
    if (fwCanvas) {
        fwCanvas.width = window.innerWidth;
        fwCanvas.height = window.innerHeight;
    }
});