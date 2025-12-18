// DOM элементы
const bioBtn = document.getElementById('bioBtn');
const bioModal = document.getElementById('bioModal');
const closeBio = document.getElementById('closeBio');
const viewUpcomingBtn = document.getElementById('viewUpcomingBtn');
const upcomingRelease = document.getElementById('upcomingRelease');
const upcomingModal = document.getElementById('upcomingModal');
const closeUpcoming = document.getElementById('closeUpcoming');
const releaseModal = document.getElementById('releaseModal');
const closeRelease = document.getElementById('closeRelease');
const releaseModalTitle = document.getElementById('releaseModalTitle');
const releaseModalContent = document.getElementById('releaseModalContent');
const releasesContainer = document.getElementById('releasesContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const switcherButtons = document.querySelectorAll('.switcher-btn');
const youtubeVideoContainer = document.getElementById('youtubeVideo');

// Счетчики для фильтров
const filterCounts = {
    all: document.querySelector('[data-filter="all"] .filter-count'),
    album: document.querySelector('[data-filter="album"] .filter-count'),
    single: document.querySelector('[data-filter="single"] .filter-count'),
    ep: document.querySelector('[data-filter="ep"] .filter-count')
};

// Фильтры
let currentFilter = 'all';
let currentReleaseType = 'all';

// Открытие/закрытие модальных окон
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обработчики событий для биографии
bioBtn.addEventListener('click', () => openModal(bioModal));
closeBio.addEventListener('click', () => closeModal(bioModal));
bioModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(bioModal);
});

// Обработчики событий для будущего релиза
viewUpcomingBtn.addEventListener('click', () => openModal(upcomingModal));
upcomingRelease.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) {
        openModal(upcomingModal);
    }
});
closeUpcoming.addEventListener('click', () => closeModal(upcomingModal));
upcomingModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(upcomingModal);
});

// Функция для загрузки YouTube видео
function loadYouTubeVideo() {
    if (releasesData.youtubeVideoId) {
        const videoId = releasesData.youtubeVideoId;
        youtubeVideoContainer.innerHTML = `
            <iframe src="https://youtu.be/-BWPThUwuaQ${videoId}" 
                    title="YouTube video player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
    }
}

// Функция для обновления счетчиков в фильтрах
function updateFilterCounts() {
    const filteredReleases = getFilteredReleases();
    
    // Обновляем общий счетчик
    filterCounts.all.textContent = `(${filteredReleases.length})`;
    
    // Счетчики по типам релизов
    filterCounts.album.textContent = `(${filteredReleases.filter(r => r.type === 'album').length})`;
    filterCounts.single.textContent = `(${filteredReleases.filter(r => r.type === 'single').length})`;
    filterCounts.ep.textContent = `(${filteredReleases.filter(r => r.type === 'ep').length})`;
}

// Функция для фильтрации релизов
function getFilteredReleases() {
    let filtered = releasesData.releases;
    
    // Фильтр по типу выпуска (platform/telegram)
    if (currentReleaseType !== 'all') {
        filtered = filtered.filter(release => release.releaseType === currentReleaseType);
    }
    
    // Фильтр по типу релиза (album/single/ep)
    if (currentFilter !== 'all') {
        filtered = filtered.filter(release => release.type === currentFilter);
    }
    
    return filtered;
}

// Функция для создания элемента списка релиза
function createReleaseItem(release) {
    const item = document.createElement('div');
    item.className = 'release-item';
    item.dataset.id = release.id;
    item.dataset.type = release.type;
    item.dataset.releaseType = release.releaseType;
    
    // Используем короткое описание для карточки
    const shortDescription = release.shortDescription || release.description.substring(0, 150) + '...';
    
    item.innerHTML = `
        <div class="release-item-image">
            <img src="${release.cover}" alt="${release.title}" loading="lazy">
            <div class="release-item-type">${releaseTypes[release.type]}</div>
            <div class="release-item-platform">${releaseTypeNames[release.releaseType]}</div>
        </div>
        <div class="release-item-content">
            <div class="release-item-header">
                <h3 class="release-item-title">${release.title}</h3>
                <span class="release-item-year">${release.year}</span>
            </div>
            <div class="release-item-meta">
                <span><i class="fas fa-music"></i> ${release.tracks} трек${release.tracks > 1 ? 'ов' : ''}</span>
                <span><i class="fas fa-clock"></i> ${release.duration}</span>
            </div>
            <p class="release-item-description">${shortDescription}</p>
            <div class="release-item-actions">
                <button class="btn btn-primary view-details">
                    <i class="fas fa-info-circle"></i> Подробнее
                </button>
            </div>
        </div>
    `;
    
    // Обработчик для кнопки "Подробнее"
    item.querySelector('.view-details').addEventListener('click', () => openReleaseModal(release));
    
    // Обработчик для клика на весь элемент
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.view-details') && !e.target.closest('.listen-btn')) {
            openReleaseModal(release);
        }
    });
    
    return item;
}

// Функция для открытия модального окна релиза
function openReleaseModal(release) {
    releaseModalTitle.textContent = `${releaseTypes[release.type]} "${release.title}"`;
    
    // Создаем HTML для треков списком
    let tracksHTML = '';
    if (release.tracksList && release.tracksList.length > 0) {
        tracksHTML = `
            <div class="tracks-list-container">
                <h4>Треклист:</h4>
                <ul class="tracks-list">
                    ${release.tracksList.map(track => `
                        <li class="track-item">
                            <div class="track-info">
                                <span class="track-number">${track.number}.</span>
                                <span class="track-title">${track.title}</span>
                            </div>
                            ${track.listenUrl ? `
                                <a href="${track.listenUrl}" target="_blank" class="listen-btn">
                                    <i class="fas fa-headphones"></i> Слушать
                                </a>
                            ` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Создаем HTML для сниппетов
    let snippetsHTML = '';
    if (release.snippets && release.snippets.length > 0) {
        snippetsHTML = `
            <h4>Фрагменты:</h4>
            <div class="snippets-container">
                ${release.snippets.map(snippet => {
                    if (snippet.type === 'audio') {
                        return `
                            <div class="snippet">
                                <h5>${snippet.title}</h5>
                                <audio controls>
                                    <source src="${snippet.src}" type="audio/mpeg">
                                    Ваш браузер не поддерживает аудио элемент.
                                </audio>
                            </div>
                        `;
                    } else if (snippet.type === 'video') {
                        return `
                            <div class="snippet">
                                <h5>${snippet.title}</h5>
                                <video controls ${snippet.poster ? `poster="${snippet.poster}"` : ''}>
                                    <source src="${snippet.src}" type="video/mp4">
                                    Ваш браузер не поддерживает видео элемент.
                                </video>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }
    
    releaseModalContent.innerHTML = `
        <div class="release-details">
            <div class="release-cover">
                <img src="${release.cover}" alt="${release.title}">
            </div>
            <div class="release-info">
                <div class="release-meta">
                    <span><i class="far fa-calendar"></i> ${release.year} год</span>
                    <span><i class="fas fa-music"></i> ${release.tracks} трек${release.tracks > 1 ? 'ов' : ''}</span>
                    <span><i class="fas fa-clock"></i> ${release.duration}</span>
                    <span><i class="fas fa-share-alt"></i> ${releaseTypeNames[release.releaseType]}</span>
                </div>
                <p>${release.description}</p>
                
                ${tracksHTML}
                ${snippetsHTML}
            </div>
        </div>
    `;
    
    openModal(releaseModal);
}

// Функция для отображения релизов
function loadReleases() {
    const filteredReleases = getFilteredReleases();
    updateFilterCounts();
    releasesContainer.innerHTML = '';
    
    if (filteredReleases.length === 0) {
        releasesContainer.innerHTML = `
            <div class="no-releases">
                <i class="fas fa-music"></i>
                <h3>Релизы не найдены</h3>
                <p>Попробуйте изменить фильтры</p>
            </div>
        `;
        return;
    }
    
    filteredReleases.forEach(release => {
        const item = createReleaseItem(release);
        releasesContainer.appendChild(item);
    });
}

// Обработчики для фильтров
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Удаляем активный класс у всех кнопок
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        button.classList.add('active');
        
        // Обновляем фильтр
        currentFilter = button.dataset.filter;
        
        // Загружаем релизы
        loadReleases();
    });
});

// Обработчики для переключателя типа релизов
switcherButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Удаляем активный класс у всех кнопок
        switcherButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        button.classList.add('active');
        
        // Обновляем тип релизов
        currentReleaseType = button.dataset.type;
        
        // Загружаем релизы
        loadReleases();
    });
});

// Закрытие модального окна релиза
closeRelease.addEventListener('click', () => closeModal(releaseModal));
releaseModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(releaseModal);
});

// Закрытие модальных окон по нажатию ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal(bioModal);
        closeModal(upcomingModal);
        closeModal(releaseModal);
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем YouTube видео
    loadYouTubeVideo();
    
    // Загружаем все релизы по умолчанию
    loadReleases();
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ... существующий код ...

// Добавляем новые элементы для итогов 2025
const yearSummaryBtn = document.getElementById('yearSummaryBtn');
const yearSummaryModal = document.getElementById('yearSummaryModal');
const closeYearSummary = document.getElementById('closeYearSummary');
const yearSummaryContent = document.getElementById('yearSummaryContent');

// Обработчики событий для итогов 2025
yearSummaryBtn.addEventListener('click', () => openYearSummaryModal());
closeYearSummary.addEventListener('click', () => closeModal(yearSummaryModal));
yearSummaryModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(yearSummaryModal);
});

// Функция для открытия модального окна итогов 2025
function openYearSummaryModal() {
    createYearSummaryContent();
    openModal(yearSummaryModal);
}

// Функция для создания контента итогов 2025
function createYearSummaryContent() {
    const stats = year2025Data.stats;
    const achievements = year2025Data.achievements;
    const plans2026 = year2025Data.plans2026;
    const gratitude = year2025Data.gratitude;
    const monthlyGrowth = year2025Data.monthlyGrowth;
    
    // Находим максимальное значение для масштабирования графика
    const maxStreams = Math.max(...monthlyGrowth.map(m => m.streams));
    
    yearSummaryContent.innerHTML = `
        <div class="year-stats-grid">
            <div class="year-stat-card">
                <div class="year-stat-number">${formatNumber(stats.totalStreams)}</div>
                <div class="year-stat-label">Всего прослушиваний</div>
            </div>
            <div class="year-stat-card">
                <div class="year-stat-number">${formatNumber(stats.telegramViews)}</div>
                <div class="year-stat-label">Просмотров в Telegram</div>
            </div>
            <div class="year-stat-card">
                <div class="year-stat-number">${formatNumber(stats.telegramReactions)}</div>
                <div class="year-stat-label">Реакций в Telegram</div>
            </div>
            <div class="year-stat-card">
                <div class="year-stat-number">${formatNumber(stats.newFollowers)}</div>
                <div class="year-stat-label">Новых подписчиков</div>
            </div>
        </div>

        <div class="achievements-list">
            <h4>Достижения 2025</h4>
            ${achievements.map(achievement => `
                <div class="achievement-item">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-details">${achievement.details}</div>
                </div>
            `).join('')}
        </div>

        <div class="growth-chart">
            <h4>Рост аудитории в 2025</h4>
            <div class="chart-container">
                <div class="months-grid">
                    ${monthlyGrowth.map(month => {
                        const barHeight = (month.streams / maxStreams) * 100;
                        return `
                            <div class="month-item">
                                <div class="month-label">${month.month}</div>
                                <div class="month-bar" style="height: ${barHeight}px; background: linear-gradient(to top, var(--accent-color), var(--highlight-color));">
                                    <div class="month-value">${formatNumber(month.streams)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="plans-list">
            <h4>Планы на 2026</h4>
            ${plans2026.map(plan => `
                <div class="plan-item">
                    <i class="fas fa-star"></i>
                    <span>${plan}</span>
                </div>
            `).join('')}
        </div>

        <div class="gratitude-list">
            <h4>Благодарности</h4>
            <p style="margin-bottom: 20px; color: var(--text-light);">Спасибо всем, кто был рядом и помогал проекту расти:</p>
            ${gratitude.map(person => `
                <div class="gratitude-item">
                    <div class="gratitude-name">${person.name}</div>
                    <div class="gratitude-reason">${person.reason}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Функция для создания снежинок (для новогодней темы)
function createSnowflakes() {
    const snowContainer = document.getElementById('snowContainer');
    if (!snowContainer) return;
    
    // Создаем 50 снежинок
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snow-particle';
        
        // Случайные параметры
        const size = Math.random() * 5 + 3;
        const startX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startX}vw`;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${delay}s`;
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        
        snowContainer.appendChild(snowflake);
    }
}

// ... остальной существующий код ...

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем YouTube видео
    loadYouTubeVideo();
    
    // Загружаем все релизы по умолчанию
    loadReleases();
    
    // Создаем снежинки (работает только в новогодней теме)
    createSnowflakes();
    
    // ... остальной код инициализации ...
});