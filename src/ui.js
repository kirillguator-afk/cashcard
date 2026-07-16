
import { state } from './state.js';
import { API } from './api.js';
import { triggerHaptic, formatValue } from './utils.js';

export const UI = {
    renderGameCard(game) {
        return `
            <div onclick="router.navigate('${game.route}')" 
                 class="relative group active:scale-95 transition-all duration-300">
                <div class="absolute inset-0 ${game.color} blur-2xl opacity-20"></div>
                <div class="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 overflow-hidden">
                    <div class="${game.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
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
        const games = [
            { name: 'Mines', route: 'game-mines', icon: 'fa-bomb', color: 'bg-orange-500' },
            { name: 'Crash', route: 'game-crash', icon: 'fa-rocket', color: 'bg-red-500' },
            { name: 'Blackjack', route: 'game-blackjack', icon: 'fa-suit-spade', color: 'bg-blue-600' },
            { name: 'Дурак', route: 'lobby-durak', icon: 'fa-clone', color: 'bg-purple-600', multiplayer: true }
        ];

        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up">
                <section class="relative p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 shadow-2xl">
                    <div class="relative z-10">
                        <h1 class="text-4xl font-black mb-2 tracking-tighter">NEXUS<br>ARENA</h1>
                        <p class="text-white/60 text-xs mb-8 max-w-[200px]">20% кэшбек на первый депозит.</p>
                        <button onclick="router.navigate('wallet')" class="bg-white text-blue-700 px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase">Пополнить</button>
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

    renderProfile(container) {
        const { stats, username, quests, photo_url } = state.user;
        const xpProgress = (stats.xp / stats.nextLevelXp) * 100;

        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <!-- TG Avatar & Name -->
                <div class="text-center">
                    <div class="relative inline-block">
                        <div class="w-28 h-28 rounded-[2.5rem] bg-indigo-600 overflow-hidden border-4 border-white/10 shadow-2xl mx-auto">
                            ${photo_url ? `<img src="${photo_url}" class="w-full h-full object-cover">` : 
                                `<div class="w-full h-full flex items-center justify-center text-4xl font-black">${username[0].toUpperCase()}</div>`}
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-3 py-1 rounded-xl font-black text-xs border-4 border-[#0f172a]">
                            LVL ${stats.level}
                        </div>
                    </div>
                    <h2 class="mt-4 text-2xl font-black uppercase tracking-tighter">${username}</h2>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <div class="text-lg font-black">${stats.totalGames}</div>
                        <div class="text-[8px] opacity-30 uppercase font-bold">Игр</div>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <div class="text-lg font-black text-green-500">${stats.wins}</div>
                        <div class="text-[8px] opacity-30 uppercase font-bold">Побед</div>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <div class="text-lg font-black text-red-500">${stats.losses}</div>
                        <div class="text-[8px] opacity-30 uppercase font-bold">Лузов</div>
                    </div>
                </div>

                <!-- Quests Section -->
                <div class="space-y-4">
                    <h3 class="text-sm font-black uppercase tracking-widest opacity-50">Активные бонусы</h3>
                    ${quests.map(q => `
                        <div class="bg-white/5 border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group transition-all ${q.unlocked ? 'border-yellow-500/50' : 'opacity-80'}">
                            <div class="flex justify-between items-start mb-3 relative z-10">
                                <div>
                                    <div class="text-xs font-black uppercase">${q.title}</div>
                                    <div class="text-[10px] opacity-40 mt-1">${q.desc}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs font-black text-yellow-500">${q.reward}</div>
                                    <div class="text-[9px] opacity-40">от ${q.minDep} ₽</div>
                                </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
                                <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${Math.min(100, (q.current / q.target) * 100)}%"></div>
                            </div>
                            
                            ${q.unlocked ? `
                                <div class="absolute inset-0 bg-yellow-500/10 gold-shimmer pointer-events-none opacity-20"></div>
                                <div class="mt-3 flex justify-end relative z-10">
                                    <span class="text-[8px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-black animate-pulse">ГОТОВО К АКТИВАЦИИ</span>
                                </div>
                            ` : `
                                <div class="mt-3 text-[8px] opacity-40 text-right font-mono">ПРОГРЕСС: ${q.current}/${q.target}</div>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderWallet(container) {
        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up">
                <div class="bg-gradient-to-br from-yellow-500 to-orange-600 p-10 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden">
                    <div class="relative z-10">
                        <div class="text-black/40 text-[10px] font-black uppercase tracking-widest mb-2">Ваш баланс</div>
                        <div class="text-5xl font-black text-black tracking-tighter">₽ ${formatValue(state.user.balance)}</div>
                    </div>
                    <i class="fas fa-wallet absolute -right-4 -bottom-4 text-8xl text-black/10"></i>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-40">Пополнение</div>
                        <div class="space-y-2">
                            <div class="text-xs font-bold">Комиссия: 10%</div>
                            <button class="w-full bg-blue-600 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-600/20">Купить ₽</button>
                        </div>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-40">Вывод</div>
                        <div class="space-y-2">
                            <div class="text-xs font-bold">Комиссия: 10%</div>
                            <button class="w-full bg-white/10 py-3 rounded-xl font-black text-[10px] uppercase border border-white/10">Вывести</button>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2.5rem]">
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-info-circle text-blue-500"></i>
                        <p class="text-[10px] font-medium leading-relaxed opacity-70">
                            Все бонусы зачисляются при пополнении, если выполнен соответствующий квест в профиле. 
                            Разблокированные бонусы требуют отыгрыша (Вейджер x10).
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderLobby(container) { /* ... старый код ... */ }
};
