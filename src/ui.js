
import { state } from './state.js';
import { API } from './api.js';
import { triggerHaptic, formatValue } from './utils.js';

export const UI = {
    renderGameCard(game) {
        return `
            <div onclick="router.navigate('${game.route}')" 
                 class="relative group active:scale-95 transition-all duration-300">
                <div class="absolute inset-0 ${game.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div class="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 overflow-hidden">
                    <div class="${game.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform">
                        <i class="fas ${game.icon} text-2xl text-white"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-sm font-black uppercase tracking-widest">${game.name}</div>
                        <div class="text-[9px] font-bold opacity-30 mt-1 uppercase">${game.multiplayer ? 'PVP' : 'Solo'}</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderHome(container) {
        triggerHaptic('light');
        const games = [
            { name: 'Mines', route: 'game-mines', icon: 'fa-bomb', color: 'bg-orange-500', multiplayer: false },
            { name: 'Crash', route: 'game-crash', icon: 'fa-rocket', color: 'bg-red-500', multiplayer: false },
            { name: 'Blackjack', route: 'game-blackjack', icon: 'fa-suit-spade', color: 'bg-blue-600', multiplayer: false },
            { name: 'Дурак', route: 'lobby-durak', icon: 'fa-clone', color: 'bg-purple-600', multiplayer: true }
        ];

        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up">
                <section class="relative p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 shadow-2xl">
                    <div class="relative z-10">
                        <h1 class="text-4xl font-black mb-2 tracking-tighter">NEXUS<br>ARENA</h1>
                        <p class="text-white/60 text-xs mb-8 max-w-[200px]">Испытай удачу в лучших играх Telegram.</p>
                        <button onclick="router.navigate('game-mines')" class="bg-white text-blue-700 px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase">Быстрая игра</button>
                    </div>
                    <i class="fas fa-gem absolute -right-4 -bottom-4 text-[10rem] text-white/5"></i>
                </section>

                <div class="grid grid-cols-2 gap-4">
                    ${games.map(g => UI.renderGameCard(g)).join('')}
                </div>
                <div class="h-24"></div>
            </div>
        `;
    },

    async renderLobby(container) {
        container.innerHTML = `
            <div class="p-6 space-y-4 animate-slide-up">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-black uppercase tracking-tighter">ЛОББИ</h2>
                    <button class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-plus text-white"></i>
                    </button>
                </div>
                <div id="lobby-content" class="space-y-3">
                    ${[1, 2, 3].map(() => `
                        <div class="h-24 w-full skeleton rounded-[2rem] border border-white/5"></div>
                    `).join('')}
                </div>
            </div>
        `;

        const rooms = await API.getRooms();
        const content = document.getElementById('lobby-content');
        content.innerHTML = rooms.map(room => `
            <div class="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black">${room.creator[0]}</div>
                    <div>
                        <div class="font-black text-sm">${room.creator}</div>
                        <div class="text-yellow-500 font-bold text-xs">₽ ${room.bet}</div>
                    </div>
                </div>
                <button onclick="router.navigate('game-durak')" class="bg-white text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase">Войти</button>
            </div>
        `).join('') || '<div class="text-center py-20 opacity-20 font-black">НЕТ СТОЛОВ</div>';
    },

    renderProfile(container) {
        const { stats, username } = state.user;
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <div class="text-center pt-8">
                    <div class="w-32 h-32 skeleton rounded-[3rem] mx-auto border-4 border-white/10 mb-6 flex items-center justify-center text-4xl font-black">
                         <div class="bg-gradient-to-tr from-blue-600 to-indigo-600 w-full h-full rounded-[3rem] flex items-center justify-center">
                            ${username[0].toUpperCase()}
                         </div>
                    </div>
                    <h2 class="text-3xl font-black uppercase tracking-tighter">${username}</h2>
                </div>

                <div class="bg-white/5 border border-white/5 p-8 rounded-[3rem] shadow-xl">
                    <div class="flex justify-between items-end mb-4">
                        <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">Уровень</span>
                        <span class="text-[10px] font-black font-mono">Lvl ${stats.level}</span>
                    </div>
                    <div class="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                        <div class="h-full bg-blue-500 rounded-full transition-all" style="width: ${(stats.xp / stats.nextLevelXp) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    },

    renderWallet: (c) => { /* ... wallet code ... */ }
};
