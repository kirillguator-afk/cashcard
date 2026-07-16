
import { state } from './state.js';

// Имитация API запросов (здесь в будущем будет fetch к вашему серверу)
export const API = {
    async getRooms() {
        // В реальности: return fetch('/api/rooms').then(r => r.json());
        // Сейчас: имитируем живые комнаты
        return [
            { id: 101, creator: 'Ivan', bet: 100, players: 1, maxPlayers: 2, game: 'durak' },
            { id: 102, creator: 'Nexus_Bot', bet: 50, players: 1, maxPlayers: 2, game: 'durak' }
        ];
    },

    async createRoom(gameType, bet) {
        if (state.user.balance < bet) throw new Error('Недостаточно средств');
        
        const roomData = {
            type: 'create_room',
            game: gameType,
            bet: bet,
            user_id: state.user.id
        };

        // Отправка данных боту (бот получит это событие)
        window.Telegram.WebApp.sendData(JSON.stringify(roomData));
        
        return { success: true, roomId: Math.floor(Math.random() * 1000) };
    },

    async joinRoom(roomId) {
        console.log('Joining room:', roomId);
        // Логика входа
        return { success: true };
    }
};
