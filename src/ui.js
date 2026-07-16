
import { state } from './state.js';
import { API } from './api.js';

export const UI = {
    renderHome(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <section class="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl">
                    <div class="relative z-10">
                        <h1 class="text-2xl font-bold mb-2">Nexus Arena</h1>
                        <p class="text-white/80 text-sm mb-4">Сражайся с реальными игроками на Рубли.</p>
                        <button onclick="router.navigate('lobby-durak')" class="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                            Найти игру
                        </button>
                    </div>
                    <i class="fas fa-users absolute -right-4 -bottom-4 text-8xl text-white/10 -rotate-12"></i>
                </section>

                <div class="grid grid-cols-2 gap-4">
                    ${state.games.map(game => `
                        <div onclick="router.navigate('${game.multiplayer ? 'lobby-' + game.id : 'game-' + game.id}')" 
                             class="tg-secondary-bg p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg">
                            <div class="${game.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
                                <i class="fas ${game.icon} text-xl"></i>
                            </div>
                            <span class="font-bold text-sm">${game.name}</span>
                            ${game.multiplayer ? '<span class="text-[10px] bg-green-500/20 text-green-400 px-2 rounded-full">ONLINE</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async renderLobby(container, gameId) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2" onclick="router.navigate('home')">
                        <i class="fas fa-arrow-left"></i>
                        <h2 class="text-xl font-bold">Лобби Дурака</h2>
                    </div>
                    <button id="open-create-modal" class="bg-blue-600 p-2 rounded-lg text-sm">
                        <i class="fas fa-plus mr-1"></i> Создать
                    </button>
                </div>

                <div id="rooms-list" class="space-y-3">
                    <div class="text-center py-10 opacity-50">Загрузка комнат...</div>
                </div>
            </div>

            <!-- Modal Create Room -->
            <div id="modal-create" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                <div class="tg-secondary-bg w-full rounded-3xl p-6 border border-white/10">
                    <h3 class="text-xl font-bold mb-4">Создать комнату</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs text-white/40 block mb-1">Ставка (₽)</label>
                            <input type="number" id="create-bet" value="100" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                        </div>
                        <div class="flex gap-2">
                            <button id="confirm-create" class="flex-grow bg-green-600 py-3 rounded-xl font-bold">СОЗДАТЬ</button>
                            <button id="close-modal" class="bg-white/10 px-6 py-3 rounded-xl">ОТМЕНА</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Logic for modal
        const modal = document.getElementById('modal-create');
        document.getElementById('open-create-modal').onclick = () => modal.classList.remove('hidden');
        document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
        
        document.getElementById('confirm-create').onclick = async () => {
            const bet = parseFloat(document.getElementById('create-bet').value);
            try {
                await API.createRoom('durak', bet);
                modal.classList.add('hidden');
                alert('Комната создана! Ждите оппонента в боте.');
            } catch (e) {
                alert(e.message);
            }
        };

        // Load rooms
        const rooms = await API.getRooms();
        const list = document.getElementById('rooms-list');
        list.innerHTML = rooms.map(room => `
            <div class="tg-secondary-bg p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                    <div class="font-bold">Стол #${room.id} <span class="text-blue-400">vs ${room.creator}</span></div>
                    <div class="text-xs text-white/40">Ставка: <span class="text-yellow-500">₽ ${room.bet}</span> • Игроков: ${room.players}/${room.maxPlayers}</div>
                </div>
                <button onclick="router.navigate('game-durak')" class="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
                    ИГРАТЬ
                </button>
            </div>
        `).join('') || '<div class="text-center py-10 opacity-50">Нет активных комнат</div>';
    },

    renderWallet: (c) => { /* ... старый код ... */ },
    renderProfile: (c) => { /* ... старый код ... */ }
};
