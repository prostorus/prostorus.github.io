// bd.js
const bd = {
    // Пользователи для профилей
	users: {
        1: { id: 1, name: "Просто Рус", tag: "@prosorus", avatar: "assets/profiles/prostorus.jpg" }, // Запятая здесь обязательна!
        2: { id: 2, name: "Макс Ганин", tag: "@ganin_don", avatar: "assets/avatar2.jpg" },
		3: { id: 3, name: "Новый Герой", tag: "@new_hero", avatar: "assets/avatar2.jpg" }
    },
    
	// Начальное состояние чатов
		chats: [
        {
            chatId: 1,
            userId: 1, // Ссылка на пользователя выше
            unreadCount: 1,
			// Шаблонные сообщения для старта
            messages: [
                { id: 1, sender: "incoming", type: "text", content: "test_messages" }
            ]
        }, // Запятая здесь обязательна!
        {
            chatId: 2,
            userId: 2, // Ссылка на нового пользователя
            unreadCount: 1,
			// Шаблонные сообщения для старта
            messages: [
                { id: 2, sender: "incoming", type: "text", content: "Я говноед, лютый!" }
            ]
        },
		{
            chatId: 3,
            userId: 3, // Ссылка на нового пользователя
            unreadCount: 0,
			// Шаблонные сообщения для старта
            messages: [
                { id: 3, sender: "incoming", type: "text", content: "У меня есть для тебя задание." }
            ]
        }
    ]
};