
import { state } from './state.js';
import { API } from './api.js';

export const UI = {
    renderHome(container) {
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <section class="relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl">
                    <div class="relative z-10">
                        <span class="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-tighter mb-2 inline-block">Nexus Premium</span>
                        <h1 class="text-3xl font-black mb-1 leading-none">NEXUS<br>CASINO</h1>
                        <p class="text-white/70 text-xs mb-6 max-w-[180px]">Испытай удачу в играх с реальными соперниками</p>
                        <button onclick="router.navigate('lobby-durak')" class="bg-white text-indigo-700 px-8 py-3 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-wider">
                            Играть PVP
                        </button>
                    </div>
                    <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <i class="fas fa-dice absolute -right-4 top-4 text-9xl text-white/10 rotate-12"></i>
                </section>

                <div class="grid grid-cols-2 gap-4">
                    ${state.games.map(game => `
                        <div onclick="router.navigate('${game.multiplayer ? 'lobby-' + game.id : 'game-' + game.id}')" 
                             class="tg-secondary-bg p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl hover:border-blue-500/30">
                            <div class="${game.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                <i class="fas ${game.icon} text-2xl text-white shadow-sm"></i>
                            </div>
                            <div class="text-center">
                                <span class="font-black text-sm block">${game.name.toUpperCase()}</span>
                                ${game.multiplayer ? '<span class="text-[9px] text-green-400 animate-pulse font-bold">• ONLINE</span>' : '<span class="text-[9px] text-white/30 font-bold">SOLO</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async renderLobby(container, gameId) {
        container.innerHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center bg-black/20 p-4 rounded-3xl">
                    <div class="flex items-center gap-3" onclick="router.navigate('home')">
                        <div class="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                        <h2 class="text-xl font-black">ЛОББИ</h2>
                    </div>
                    <button id="open-create-modal" class="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all">
                        + СОЗДАТЬ
                    </button>
                </div>

                <div id="rooms-list" class="space-y-3">
                    <!-- Rooms loaded via API -->
                </div>
            </div>

            <div id="modal-create" class="hidden fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
                <div class="tg-secondary-bg w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl transform transition-all">
                    <div class="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6"></div>
                    <h3 class="text-2xl font-black mb-6 text-center">НОВАЯ ИГРА</h3>
                    <div class="space-y-6">
                        <div class="bg-black/20 p-4 rounded-2xl border border-white/5">
                            <label class="text-[10px] text-white/40 block mb-2 uppercase font-bold tracking-widest">Ставка (Рубли)</label>
                            <div class="flex items-center gap-4">
                                <span class="text-yellow-500 font-bold text-xl">₽</span>
                                <input type="number" id="create-bet" value="100" class="w-full bg-transparent border-none text-2xl font-mono focus:outline-none">
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <button id="confirm-create" class="flex-grow bg-blue-600 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all">СОЗДАТЬ</button>
                            <button id="close-modal" class="bg-white/5 px-6 py-4 rounded-2xl font-bold">ОТМЕНА</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const list = document.getElementById('rooms-list');
        const rooms = await API.getRooms();
        
        list.innerHTML = rooms.map(room => `
            <div class="tg-secondary-bg p-5 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-lg">
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner">
                            ${room.creator[0].toUpperCase()}
                        </div>
                        <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1e293b] rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <div class="font-black text-sm">${room.creator}</div>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md text-[10px] font-bold">₽ ${room.bet}</div>
                            <span class="text-[10px] text-white/30 font-medium">${room.players}/${room.maxPlayers} чел</span>
                        </div>
                    </div>
                </div>
                <button onclick="router.navigate('game-durak')" class="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black active:scale-90 transition-all shadow-lg">
                    ВОЙТИ
                </button>
            </div>
        `).join('') || '<div class="text-center py-20 opacity-20 font-black">НЕТ АКТИВНЫХ СТОЛОВ</div>';

        const modal = document.getElementById('modal-create');
        document.getElementById('open-create-modal').onclick = () => modal.classList.remove('hidden');
        document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
        document.getElementById('confirm-create').onclick = async () => {
            const bet = parseFloat(document.getElementById('create-bet').value);
            try {
                await API.createRoom('durak', bet);
                modal.classList.add('hidden');
                UI.renderLobby(container, gameId); // Refresh
            } catch (e) { alert(e.message); }
        };
    },

    renderProfile(container) {
        const { stats, username, id } = state.user;
        const xpProgress = (stats.xp / stats.nextLevelXp) * 100;

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="text-center pt-4">
                    <div class="relative inline-block">
                        <div class="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-5xl font-black shadow-2xl mx-auto border-4 border-white/10">
                            ${username[0].toUpperCase()}
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-yellow-500 text-black w-10 h-10 rounded-2xl flex items-center justify-center font-black border-4 border-[#0f172a]">
                            ${stats.level}
                        </div>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight">${username.toUpperCase()}</h2>
                    <p class="text-white/40 text-xs font-mono uppercase">ID: ${id}</p>
                </div>

                <div class="tg-secondary-bg p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Опыт уровня</span>
                        <span class="text-[10px] font-mono">${stats.xp} / ${stats.nextLevelXp}</span>
                    </div>
                    <div class="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" style="width: ${xpProgress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="tg-secondary-bg p-5 rounded-[2rem] border border-white/5 text-center">
                        <div class="text-2xl font-black text-green-500">${stats.wins}</div>
                        <div class="text-[9px] text-white/30 uppercase font-black tracking-widest">Победы</div>
                    </div>
                    <div class="tg-secondary-bg p-5 rounded-[2rem] border border-white/5 text-center">
                        <div class="text-2xl font-black text-red-500">${stats.losses}</div>
                        <div class="text-[9px] text-white/30 uppercase font-black tracking-widest">Поражения</div>
                    </div>
                </div>

                <div class="tg-secondary-bg p-4 rounded-[2rem] border border-white/5">
                    <button class="w-full flex items-center justify-between p-3">
                        <div class="flex items-center gap-4">
                            <i class="fas fa-history text-blue-500"></i>
                            <span class="font-bold text-sm">История игр</span>
                        </div>
                        <i class="fas fa-chevron-right text-white/10"></i>
                    </button>
                    <div class="h-px bg-white/5 mx-4"></div>
                    <button class="w-full flex items-center justify-between p-3">
                        <div class="flex items-center gap-4">
                            <i class="fas fa-cog text-gray-400"></i>
                            <span class="font-bold text-sm">Настройки</span>
                        </div>
                        <i class="fas fa-chevron-right text-white/10"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderWallet(container) {
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-[2.5rem] shadow-2xl text-center">
                    <div class="relative z-10">
                        <div class="text-black/60 text-xs font-black uppercase tracking-widest mb-2">Ваш баланс</div>
                        <div class="text-5xl font-black text-black tracking-tighter">₽ ${state.user.balance.toFixed(2)}</div>
                    </div>
                    <div class="absolute -left-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button class="bg-blue-600 p-6 rounded-[2rem] flex flex-col items-center gap-3 shadow-xl active:scale-95 transition-all">
                        <i class="fas fa-arrow-down text-xl"></i>
                        <span class="font-black text-xs uppercase">Пополнить</span>
                    </button>
                    <button class="bg-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 border border-white/10 active:scale-95 transition-all">
                        <i class="fas fa-arrow-up text-xl"></i>
                        <span class="font-black text-xs uppercase">Вывести</span>
                    </button>
                </div>
            </div>
        `;
    }
};
