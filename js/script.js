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


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем YouTube видео
    loadYouTubeVideo();
    
    // Загружаем все релизы по умолчанию
    loadReleases();
    
    // ... остальной код инициализации ...
});