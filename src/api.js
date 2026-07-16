
import { state } from './state.js';

export const API = {
    async getRooms() {
        // Имитация задержки сети
        await new Promise(r => setTimeout(r, 500));
        return state.rooms;
    },

    async createRoom(gameType, bet) {
        if (state.user.balance < bet) throw new Error('Недостаточно средств');
        
        const newRoom = {
            id: Math.floor(1000 + Math.random() * 9000),
            creator: state.user.username,
            bet: bet,
            players: 1,
            maxPlayers: 2,
            game: gameType,
            status: 'waiting',
            createdAt: new Date().toISOString()
        };

        state.rooms.unshift(newRoom);
        state.updateBalance(-bet);
        state.save();

        // Отправка боту для рассылки всем игрокам
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify({
                action: 'new_room',
                room: newRoom
            }));
        }
        
        return { success: true, room: newRoom };
    },

    async joinRoom(roomId) {
        const room = state.rooms.find(r => r.id === roomId);
        if (!room) throw new Error('Комната не найдена');
        if (state.user.balance < room.bet) throw new Error('Недостаточно средств для входа');
        
        // В реальности здесь проверка на сервере
        return { success: true };
    }
};
