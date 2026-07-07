// app.js
let currentChatId = null;
let selectedChoice = null;
let userTypingInterval = null;
let botTypingElement = null;

// Элементы DOM
const viewChatList = document.getElementById('view-chatlist');
const viewChatRoom = document.getElementById('view-chatroom');
const viewProfile = document.getElementById('view-profile');
const chatListContainer = document.getElementById('chat-list-container');
const messagesContainer = document.getElementById('messages-container');
const choicesPanel = document.getElementById('choices-panel');
const messageInput = document.getElementById('message-input');
const btnSend = document.getElementById('btn-send');

// Навигация
document.getElementById('btn-back').onclick = () => switchView(viewChatList);
document.getElementById('btn-back-profile').onclick = () => switchView(viewChatRoom);
document.getElementById('chat-header-info').onclick = () => openProfile(currentChatId);

function switchView(viewElement) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    viewElement.classList.add('active');
    if (viewElement === viewChatList) renderChatList();
}

function renderChatList() {
    chatListContainer.innerHTML = '';
    bd.chats.forEach(chat => {
        const user = bd.users[chat.userId];
        if (!user) return;
        const messages = chat.messages || [];
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
        let lastMsgText = lastMsg ? (lastMsg.type === 'text' ? lastMsg.content : `[${lastMsg.type}]`) : "Нет сообщений";

        const div = document.createElement('div');
        div.className = 'chat-item';
        div.innerHTML = `
            <img src="${user.avatar}" class="chat-avatar" alt="avatar">
            <div class="chat-info">
                <div class="chat-name">${user.name}</div>
                <div class="chat-last-message">${lastMsgText}</div>
            </div>
            ${chat.unreadCount > 0 ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
        `;
        div.onclick = () => openChat(chat.chatId);
        chatListContainer.appendChild(div);
    });
}

function openChat(chatId) {
    currentChatId = chatId;
    const chat = bd.chats.find(c => c.chatId === chatId);
    const user = bd.users[chat.userId];
    chat.unreadCount = 0;
    document.getElementById('header-avatar').src = user.avatar;
    document.getElementById('header-name').innerText = user.name;
    document.getElementById('header-status').innerText = 'online';
    renderMessages(chat.messages);
    renderChoices();
    resetInput();
    switchView(viewChatRoom);
}

function openProfile(chatId) {
    const chat = bd.chats.find(c => c.chatId === chatId);
    const user = bd.users[chat.userId];
    document.getElementById('profile-avatar').src = user.avatar;
    document.getElementById('profile-name').innerText = user.name;
    document.getElementById('profile-tag').innerText = user.tag;
    switchView(viewProfile);
}

function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => appendMessageDOM(msg));
}

function appendMessageDOM(msg) {
    const div = document.createElement('div');
    div.className = `msg ${msg.sender}`;

    const isMedia = ['video', 'circle', 'image'].includes(msg.type);
    if (isMedia) {
        div.style.background = 'transparent';
        div.style.padding = '0';
        div.style.boxShadow = 'none';
    }

    if (msg.type === 'text') {
        div.innerText = msg.content;
    } 
    else if (msg.type === 'spoiler') {
        div.innerHTML = `<span class="spoiler" onclick="this.classList.toggle('revealed')">${msg.content}</span>`;
    } 
    else if (msg.type === 'circle') {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-circle-wrapper';
        
        const video = document.createElement('video');
        video.className = 'msg-circle-video';
        video.src = msg.content;
        video.playsInline = true;

        const progressBar = document.createElement('div');
        progressBar.className = 'circle-progress-bar';

        const overlay = document.createElement('div');
        overlay.className = 'play-overlay';
        overlay.innerText = '▶';

        wrapper.appendChild(video);
        wrapper.appendChild(progressBar);
        wrapper.appendChild(overlay);

        wrapper.onclick = (e) => {
            const rect = wrapper.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Если кликнули в нижние 25% кружка — это перемотка
            if (clickY > rect.height * 0.75) {
                const pos = clickX / rect.width;
                video.currentTime = pos * video.duration;
                if (video.paused) {
                    video.play();
                    overlay.style.opacity = '0';
                }
            } else {
                // Иначе — старт/пауза и увеличение со смещением
                wrapper.classList.toggle('zoomed');
                if (video.paused) {
                    video.play();
                    overlay.style.opacity = '0';
                } else {
                    video.pause();
                    overlay.style.opacity = '1';
                }
            }
        };

        video.ontimeupdate = () => {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
        };

        video.onended = () => {
            overlay.style.opacity = '1';
            progressBar.style.width = '0%';
            wrapper.classList.remove('zoomed');
        };

        div.appendChild(wrapper);
    }
    else if (isMedia) {
        // Обычные видео и изображения
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-video-wrapper';
        
        const media = document.createElement(msg.type === 'image' ? 'img' : 'video');
        media.src = msg.content;
        media.className = msg.type === 'video' ? 'msg-video' : '';
        if (msg.type !== 'image') media.playsinline = true;
        
        wrapper.appendChild(media);
        if (msg.type !== 'image') {
            wrapper.innerHTML += `<div class="play-overlay">▶</div>`;
        }

        wrapper.onclick = () => openMediaViewer(msg);
        div.appendChild(wrapper);
    } 
    else if (msg.type === 'voice') {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-voice-player';
        wrapper.innerHTML = `
            <button class="voice-play-btn">▶</button>
            <div class="voice-waveform"><div class="waveform-bars"></div></div>
            <span class="voice-time">0:00</span>
        `;
        
        const audio = new Audio(msg.content);
        const barsContainer = wrapper.querySelector('.waveform-bars');
        const waveform = wrapper.querySelector('.voice-waveform');

        for(let i = 0; i < 25; i++) {
            const span = document.createElement('span');
            span.style.height = `${Math.floor(Math.random() * 50) + 20}%`;
            barsContainer.appendChild(span);
        }

        waveform.onclick = (e) => {
            const rect = waveform.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        };

        audio.ontimeupdate = () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            const spans = barsContainer.querySelectorAll('span');
            const activeIndex = Math.floor((progress / 100) * spans.length);
            spans.forEach((span, index) => {
                span.style.backgroundColor = index < activeIndex ? '#FFFFFF' : '#444';
            });
            const m = Math.floor(audio.currentTime / 60);
            const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
            wrapper.querySelector('.voice-time').innerText = `${m}:${s}`;
        };

        wrapper.querySelector('.voice-play-btn').onclick = () => {
            audio.paused ? audio.play() : audio.pause();
            wrapper.querySelector('.voice-play-btn').innerText = audio.paused ? '▶' : '⏸';
        };
        div.appendChild(wrapper);
    }

    messagesContainer.appendChild(div);
    scrollToBottom();
}

function openMediaViewer(msg) {
    const viewer = document.getElementById('media-viewer');
    const img = document.getElementById('viewer-img');
    const vid = document.getElementById('viewer-video');
    
    if (msg.type === 'image') {
        img.src = msg.content; img.style.display = 'block';
        vid.style.display = 'none';
    } else {
        vid.src = msg.content; vid.style.display = 'block';
        vid.play();
        img.style.display = 'none';
    }
    viewer.style.display = 'flex';
}

function selectChoice(choice, btnElement) {
    document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    selectedChoice = choice;
    btnSend.classList.remove('ready');
    btnSend.disabled = true;
    messageInput.value = '';
    clearInterval(userTypingInterval);
    let i = 0;
    userTypingInterval = setInterval(() => {
        messageInput.value += choice.text.charAt(i++);
        if (i >= choice.text.length) { clearInterval(userTypingInterval); btnSend.classList.add('ready'); btnSend.disabled = false; }
    }, 30);
}

function showBotAction(type) {
    if (botTypingElement) botTypingElement.remove();
    let text = type === 'voice' ? 'записывает голосовое' : type === 'circle' ? 'записывает видео' : type === 'video' ? 'отправляет видео' : type === 'image' ? 'отправляет фото' : 'печатает';
    document.getElementById('header-status').innerText = text + '...';
    botTypingElement = document.createElement('div');
    botTypingElement.className = 'bot-typing-bubble';
    botTypingElement.innerHTML = `<span class="bot-action-text">${text}</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
    messagesContainer.appendChild(botTypingElement);
    scrollToBottom();
}

function hideBotAction() {
    if (botTypingElement) botTypingElement.remove();
    document.getElementById('header-status').innerText = 'online';
}

btnSend.onclick = () => {
    if (!selectedChoice) return;
    const chat = bd.chats.find(c => c.chatId === currentChatId);
    chat.messages.push({ sender: 'outgoing', type: 'text', content: selectedChoice.text });
    appendMessageDOM({ sender: 'outgoing', type: 'text', content: selectedChoice.text });
    const nextStepId = selectedChoice.nextStep;
    chatProgress[currentChatId] = nextStepId;
    choicesPanel.innerHTML = '';
    messageInput.value = '';
    const nextStepData = storyScript[nextStepId];
    if (nextStepData && nextStepData.reply) {
        showBotAction(nextStepData.reply.type);
        setTimeout(() => {
            hideBotAction();
            chat.messages.push({ sender: 'incoming', type: nextStepData.reply.type, content: nextStepData.reply.content });
            appendMessageDOM({ sender: 'incoming', type: nextStepData.reply.type, content: nextStepData.reply.content });
            renderChoices();
        }, nextStepData.delay || 1500);
    } else {
        renderChoices();
    }
};

function renderChoices() {
    choicesPanel.innerHTML = '';
    
    // Проверяем, выбран ли чат и есть ли он в объекте прогресса
    if (currentChatId === null || !chatProgress || !chatProgress[currentChatId]) {
        console.warn("Предупреждение: Нет сохраненного прогресса для чата ID:", currentChatId);
        return; 
    }

    const currentStepId = chatProgress[currentChatId];
    const step = storyScript[currentStepId];
    
    if (step && step.choices) {
        step.choices.forEach(c => {
            const b = document.createElement('button');
            b.className = 'choice-btn';
            b.innerText = c.text;
            b.onclick = () => selectChoice(c, b);
            choicesPanel.appendChild(b);
        });
    }
}

function resetInput() { messageInput.value = ''; btnSend.disabled = true; }
function scrollToBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }

renderChatList();