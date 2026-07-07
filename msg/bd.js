// bd.js
const bd = {
    // Пользователи для профилей
	users: {
        1: { id: 1, name: "Просто Рус", tag: "@prosorus", avatar: "assets/profiles/prostorus.jpg" }, // Запятая здесь обязательна!
        2: { id: 2, name: "Новый Герой", tag: "@new_hero", avatar: "assets/avatar2.jpg" }
    },
    
	// Начальное состояние чатов
		chats: [
        {
            chatId: 1,
            userId: 1, // Ссылка на пользователя выше
            unreadCount: 1,
			// Шаблонные сообщения для старта
            messages: [
                { id: 101, sender: "incoming", type: "text", content: "test_messages" }
            ]
        }, // Запятая здесь обязательна!
        {
            chatId: 2,
            userId: 2, // Ссылка на нового пользователя
            unreadCount: 1,
			// Шаблонные сообщения для старта
            messages: [
                { id: 201, sender: "incoming", type: "text", content: "У меня есть для тебя задание." }
            ]
        }
    ]
};