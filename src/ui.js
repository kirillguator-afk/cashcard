
import { state } from './state.js';
import { API } from './api.js';

export const UI = {
    // Вспомогательный метод для рендеринга карточки игры
    renderGameCard(game) {
        return `
            <div onclick="router.navigate('${game.multiplayer ? 'lobby-' + game.id : 'game-' + game.id}')" 
                 class="relative group active:scale-95 transition-all duration-300">
                <div class="absolute inset-0 ${game.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div class="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 overflow-hidden">
                    <div class="${game.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform">
                        <i class="fas ${game.icon} text-2xl text-white"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-sm font-black uppercase tracking-widest">${game.name}</div>
                        <div class="text-[9px] font-bold opacity-30 mt-1 uppercase">
                            ${game.multiplayer ? '<span class="text-green-400">Multiplayer</span>' : 'Solo Game'}
                        </div>
                    </div>
                    ${game.multiplayer ? '<div class="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>' : ''}
                </div>
            </div>
        `;
    },

    renderHome(container) {
        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up">
                <!-- Hero Section -->
                <section class="relative p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 shadow-2xl">
                    <div class="relative z-10">
                        <div class="flex items-center gap-2 mb-4">
                            <span class="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Season 1</span>
                            <span class="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Live Events</span>
                        </div>
                        <h1 class="text-4xl font-black mb-2 leading-none tracking-tighter">ВРЕМЯ<br>ПОБЕЖДАТЬ</h1>
                        <p class="text-white/60 text-xs mb-8 max-w-[200px] leading-relaxed font-medium">Присоединяйся к тысячам игроков в самой честной PVP арене Telegram.</p>
                        <button onclick="router.navigate('lobby-durak')" class="bg-white text-indigo-700 px-10 py-4 rounded-[1.5rem] font-black text-sm shadow-xl active:scale-90 transition-all uppercase tracking-widest">
                            В бой
                        </button>
                    </div>
                    <i class="fas fa-crown absolute -right-6 -bottom-6 text-[12rem] text-white/5 -rotate-12"></i>
                </section>

                <!-- Categories -->
                <div class="grid grid-cols-2 gap-5">
                    ${state.games.map(g => UI.renderGameCard(g)).join('')}
                </div>

                <!-- Quick Stats Bar -->
                <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex justify-around">
                    <div class="text-center">
                        <div class="text-lg font-black">${state.user.stats.wins}</div>
                        <div class="text-[9px] font-black opacity-30 uppercase tracking-widest">Победы</div>
                    </div>
                    <div class="w-px bg-white/10"></div>
                    <div class="text-center">
                        <div class="text-lg font-black">${state.user.stats.level}</div>
                        <div class="text-[9px] font-black opacity-30 uppercase tracking-widest">Уровень</div>
                    </div>
                    <div class="w-px bg-white/10"></div>
                    <div class="text-center">
                        <div class="text-lg font-black">${state.rooms.length}</div>
                        <div class="text-[9px] font-black opacity-30 uppercase tracking-widest">Столы</div>
                    </div>
                </div>
                <div class="h-24"></div>
            </div>
        `;
    },

    async renderLobby(container, gameId) {
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <div class="flex justify-between items-end">
                    <div>
                        <div class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">PVP Arena</div>
                        <h2 class="text-3xl font-black uppercase tracking-tighter">Столы</h2>
                    </div>
                    <button id="open-create-modal" class="bg-blue-600 w-14 h-14 rounded-2xl shadow-lg shadow-blue-600/30 active:scale-90 transition-all flex items-center justify-center">
                        <i class="fas fa-plus text-xl text-white"></i>
                    </button>
                </div>

                <div id="rooms-list" class="grid gap-4">
                    <!-- Dynamic Rooms -->
                </div>
            </div>

            <!-- Modal with improved UX -->
            <div id="modal-create" class="hidden fixed inset-0 z-[200] flex items-end justify-center p-4 bg-[#0f172a]/90 backdrop-blur-xl transition-all">
                <div class="bg-white/5 border border-white/10 w-full max-w-md rounded-[3rem] p-8 shadow-2xl mb-4">
                    <div class="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                    <h3 class="text-2xl font-black mb-8 text-center uppercase tracking-widest">Новый стол</h3>
                    
                    <div class="space-y-6">
                        <div class="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                            <label class="text-[10px] font-black text-white/30 block mb-3 uppercase tracking-widest">Ваша ставка</label>
                            <div class="flex items-center justify-between">
                                <span class="text-3xl font-black text-yellow-500">₽</span>
                                <input type="number" id="create-bet" value="100" class="w-full bg-transparent border-none text-right text-4xl font-black focus:outline-none placeholder-white/10">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-2">
                            ${[50, 100, 500, 1000].map(val => `
                                <button onclick="document.getElementById('create-bet').value = ${val}" class="bg-white/5 py-2 rounded-xl text-[10px] font-black border border-white/5 active:bg-blue-600">${val}</button>
                            `).join('')}
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button id="confirm-create" class="flex-grow bg-blue-600 py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-600/30 active:scale-95 transition-all uppercase tracking-widest">Создать</button>
                            <button id="close-modal" class="bg-white/5 px-8 py-5 rounded-[1.5rem] font-black active:scale-95 transition-all uppercase tracking-widest text-[10px] opacity-40">Отмена</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const list = document.getElementById('rooms-list');
        const rooms = await API.getRooms();
        
        list.innerHTML = rooms.map(room => `
            <div class="bg-white/5 border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between hover:bg-white/10 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center font-black text-lg border border-white/10">
                        ${room.creator[0].toUpperCase()}
                    </div>
                    <div>
                        <div class="font-black text-sm tracking-tight">${room.creator}</div>
                        <div class="flex items-center gap-3 mt-1">
                            <span class="text-yellow-500 font-bold text-xs">₽ ${room.bet}</span>
                            <span class="text-[10px] font-black opacity-30 uppercase tracking-tighter">${room.players}/${room.maxPlayers} чел</span>
                        </div>
                    </div>
                </div>
                <button onclick="router.navigate('game-durak')" class="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all shadow-xl shadow-white/5">
                    Играть
                </button>
            </div>
        `).join('') || '<div class="text-center py-20 opacity-20 font-black tracking-widest">НЕТ АКТИВНЫХ СТОЛОВ</div>';

        const modal = document.getElementById('modal-create');
        document.getElementById('open-create-modal').onclick = () => modal.classList.remove('hidden');
        document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
        document.getElementById('confirm-create').onclick = async () => {
            const bet = parseFloat(document.getElementById('create-bet').value);
            try {
                await API.createRoom('durak', bet);
                modal.classList.add('hidden');
                this.renderLobby(container, gameId);
            } catch (e) { alert(e.message); }
        };
    },

    renderProfile(container) {
        const { stats, username, id } = state.user;
        const xpProgress = (stats.xp / stats.nextLevelXp) * 100;

        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up pb-32">
                <div class="text-center">
                    <div class="relative inline-block">
                        <div class="w-32 h-32 rounded-[3rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-5xl font-black shadow-2xl mx-auto border-4 border-white/10 rotate-3">
                            ${username[0].toUpperCase()}
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-4 py-1 rounded-2xl font-black text-sm border-4 border-[#0f172a] shadow-lg">
                            Lvl ${stats.level}
                        </div>
                    </div>
                    <h2 class="mt-8 text-3xl font-black tracking-tighter uppercase">${username}</h2>
                    <p class="text-white/20 text-[10px] font-mono tracking-[0.3em] mt-2 uppercase">Player ID: ${id}</p>
                </div>

                <div class="bg-white/5 border border-white/5 p-8 rounded-[3rem] shadow-xl">
                    <div class="flex justify-between items-end mb-4">
                        <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Progress</span>
                        <span class="text-[10px] font-black font-mono opacity-60">${stats.xp} / ${stats.nextLevelXp} XP</span>
                    </div>
                    <div class="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                        <div class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_#3b82f6]" style="width: ${xpProgress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-center">
                        <div class="text-3xl font-black text-green-500 mb-1">${stats.wins}</div>
                        <div class="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">Победы</div>
                    </div>
                    <div class="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-center">
                        <div class="text-3xl font-black text-red-500 mb-1">${stats.losses}</div>
                        <div class="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">Поражения</div>
                    </div>
                </div>

                <button class="w-full bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between active:bg-white/10 transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <span class="font-black text-sm uppercase tracking-widest">Статистика</span>
                    </div>
                    <i class="fas fa-chevron-right text-white/20"></i>
                </button>
            </div>
        `;
    },

    renderWallet(container) {
        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up pb-32">
                <div class="relative overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-600 p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(245,158,11,0.3)] text-center transform -rotate-1">
                    <div class="relative z-10">
                        <div class="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Available Balance</div>
                        <div class="text-6xl font-black text-black tracking-tighter">₽ ${state.user.balance.toFixed(2)}</div>
                    </div>
                    <div class="absolute -left-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-[80px]"></div>
                </div>

                <div class="grid grid-cols-2 gap-5">
                    <button class="bg-blue-600 p-8 rounded-[3rem] flex flex-col items-center gap-4 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                            <i class="fas fa-plus"></i>
                        </div>
                        <span class="font-black text-[10px] uppercase tracking-widest">Deposit</span>
                    </button>
                    <button class="bg-white/5 p-8 rounded-[3rem] flex flex-col items-center gap-4 border border-white/5 active:scale-95 transition-all">
                        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                            <i class="fas fa-paper-plane"></i>
                        </div>
                        <span class="font-black text-[10px] uppercase tracking-widest">Withdraw</span>
                    </button>
                </div>

                <div class="bg-white/5 border border-white/5 rounded-[3rem] overflow-hidden">
                    <div class="p-6 border-b border-white/5 font-black text-xs uppercase tracking-widest opacity-40">История транзакций</div>
                    <div class="p-12 text-center">
                        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-receipt opacity-20 text-2xl"></i>
                        </div>
                        <p class="text-[10px] font-black opacity-20 uppercase tracking-widest">Пусто</p>
                    </div>
                </div>
            </div>
        `;
    }
};
