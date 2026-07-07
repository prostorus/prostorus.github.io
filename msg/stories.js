// stories.js
// Текущий прогресс по каждому чату
let chatProgress = {
    1: "back", // Чат ID 1 находится на шаге "step_1"
	2: "max_start"
};

const storyScript = {
    "back": {
        choices: [
            { text: "test_voicemessages", nextStep: "test_voicemessages" },
            { text: "test_circlemessages", nextStep: "test_circlemessages" },
            { text: "test_videofile", nextStep: "test_videofile" },
			{ text: "test_imagefile", nextStep: "test_imagefile" }
        ]
    },
    "test_videofile": {
        // Ответ бота
        reply: { type: "video", content: "assets/circle.mp4" },
        delay: 1500, // Задержка перед ответом в миллисекундах
        // Новые варианты ответов после реплая
        choices: [
            { text: "назад", nextStep: "back" },
        ]
    },
    "test_voicemessages": {
        reply: { type: "voice", content: "assets/circle.mp4" },
        delay: 1000,
        choices: [
            { text: "назад", nextStep: "back" }
        ]
    },
    "test_circlemessages": {
        reply: { type: "circle", content: "assets/circle.mp4" }, // Бот шлет кружок
        delay: 2000,
        choices: [
            { text: "назад", nextStep: "back" }
        ]
    },
	"test_imagefile": {
        reply: { type: "image", content: "assets/profiles/prostorus.jpg" }, // Бот шлет кружок
        delay: 2000,
        choices: [
            { text: "назад", nextStep: "back" }
        ]
    },
	// === СЮЖЕТ ДЛЯ ЧАТА №2 (Новый Герой) ===
    // Ключи шагов должны быть уникальными, чтобы они не пересекались с первым чатом!
    "max_start": {
        choices: [
            { text: "Я тебе не верю. Докажи!", nextStep: "hero_task_info" },
        ]
    },
    "hero_task_info": {
        // Бот пришлет спойлер с секретным текстом
        reply: { type: "circle", content: "assets/ganin.mp4" },
        delay: 1200,
        choices: [
        ]
    }
	
};

/* Примеры других типов сообщений для bd.js или stories.js:
    { type: "voice", content: "assets/audio.mp3" } // 2. Голосовое
    { type: "circle", content: "assets/circle.mp4" } // 3. Кружок
    { type: "image", content: "assets/media.jpg" } // 4. Картинка
    { type: "video", content: "assets/video.mp4" } // 5. Видеофайл
    { type: "spoiler", content: "Секретный код: 8492" } // 6. Скрытый текст
*/