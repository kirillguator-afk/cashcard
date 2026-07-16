
import { state } from './state.js';
import { API } from './api.js';
import { triggerHaptic, formatValue } from './utils.js';

export const UI = {
    renderGameCard(game) {
        return `
            <div onclick="router.navigate('${game.route}')" 
                 class="relative group active:scale-95 transition-all duration-300">
                <div class="absolute inset-0 ${game.color} blur-2xl opacity-10"></div>
                <div class="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 overflow-hidden">
                    <div class="${game.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                        <i class="fas ${game.icon} text-2xl text-white shadow-sm"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-xs font-black uppercase tracking-widest">${game.name}</div>
                        <div class="text-[8px] font-bold opacity-30 mt-1 uppercase">${game.multiplayer ? 'PVP Arena' : 'Solo Instant'}</div>
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
                <section class="relative p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 shadow-2xl">
                    <div class="relative z-10">
                        <span class="text-[10px] bg-black/20 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Бонусная Программа</span>
                        <h1 class="text-4xl font-black mt-4 mb-2 tracking-tighter">+70% К<br>ДЕПОЗИТУ</h1>
                        <p class="text-white/60 text-[10px] mb-8 max-w-[180px] leading-relaxed">Выполняй квесты в профиле и разблокируй максимальные бонусы.</p>
                        <button onclick="router.navigate('profile')" class="bg-white text-blue-700 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-90 transition-all">К Квестам</button>
                    </div>
                    <i class="fas fa-bolt absolute -right-6 -bottom-6 text-[12rem] text-white/5 -rotate-12"></i>
                </section>

                <div class="grid grid-cols-2 gap-4">
                    ${games.map(g => UI.renderGameCard(g)).join('')}
                </div>
                <div class="h-24"></div>
            </div>
        `;
    },

    renderProfile(container) {
        const { stats, username, quests, photo_url, wager } = state.user;
        const xpProgress = (stats.xp / stats.nextLevelXp) * 100;

        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <div class="text-center">
                    <div class="relative inline-block">
                        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 overflow-hidden border-4 border-white/5 shadow-2xl mx-auto flex items-center justify-center text-4xl font-black">
                            ${photo_url ? `<img src="${photo_url}" class="w-full h-full object-cover">` : username[0].toUpperCase()}
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-3 py-1 rounded-xl font-black text-[10px] border-4 border-[#0f172a]">
                            LVL ${stats.level}
                        </div>
                    </div>
                    <h2 class="mt-4 text-2xl font-black uppercase tracking-tighter">${username}</h2>
                </div>

                <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
                    <div class="flex justify-between items-end mb-3">
                        <span class="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Опыт Прогресс</span>
                        <span class="text-[9px] font-black opacity-60">${stats.xp} / ${stats.nextLevelXp} XP</span>
                    </div>
                    <div class="h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" style="width: ${xpProgress}%"></div>
                    </div>
                </div>

                ${wager.target > 0 ? `
                    <div class="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-[2rem] gold-shimmer">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-black text-yellow-500 uppercase">Отыгрыш Бонуса</span>
                            <span class="text-[10px] font-black">${formatValue(wager.current)} / ${formatValue(wager.target)} ₽</span>
                        </div>
                        <div class="h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-500" style="width: ${(wager.current / wager.target) * 100}%"></div>
                        </div>
                        <div class="text-[8px] mt-2 opacity-60 font-medium">Заблокировано: ${formatValue(wager.bonusLocked)} ₽</div>
                    </div>
                ` : ''}

                <div class="space-y-3">
                    <h3 class="text-[10px] font-black uppercase tracking-widest opacity-30 px-2">Бонусные Квесты</h3>
                    ${quests.map(q => `
                        <div class="bg-white/5 border border-white/5 p-5 rounded-[2rem] relative overflow-hidden transition-all ${q.unlocked ? 'border-blue-500/30' : 'opacity-60'}">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="text-xs font-black uppercase tracking-tight">${q.title}</div>
                                    <div class="text-[9px] opacity-40 mt-1 max-w-[150px]">${q.desc}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs font-black text-blue-500">${q.reward}</div>
                                    <div class="text-[8px] opacity-40 font-mono">от ${q.minDep}₽</div>
                                </div>
                            </div>
                            <div class="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-600 transition-all" style="width: ${Math.min(100, (q.current / q.target) * 100)}%"></div>
                            </div>
                            ${q.unlocked ? `<div class="absolute top-2 right-2"><i class="fas fa-check-circle text-green-500 text-xs"></i></div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderWallet(container) {
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <div class="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] text-center relative overflow-hidden shadow-2xl">
                    <div class="relative z-10">
                        <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Общий баланс</div>
                        <div class="text-5xl font-black tracking-tighter">₽ ${formatValue(state.user.balance)}</div>
                    </div>
                    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div class="space-y-4">
                    <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem]">
                        <div class="flex justify-between items-center mb-6">
                            <span class="font-black text-xs uppercase tracking-widest">Пополнение</span>
                            <span class="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[9px] font-black">Комиссия 10%</span>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20">Карта РФ</button>
                            <button class="bg-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">Крипто</button>
                        </div>
                    </div>

                    <div class="bg-white/5 border border-white/5 p-6 rounded-[2.5rem]">
                        <div class="flex justify-between items-center mb-6">
                            <span class="font-black text-xs uppercase tracking-widest">Вывод</span>
                            <span class="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black">Комиссия 10%</span>
                        </div>
                        <button class="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-40">Запросить выплату</button>
                    </div>
                </div>

                <div class="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex gap-4">
                    <i class="fas fa-shield-alt text-blue-500 mt-1"></i>
                    <div class="text-[10px] leading-relaxed font-medium opacity-60">
                        Nexus Casino работает по модели P2P. Все транзакции защищены. Прибыль платформы (20%) заложена в комиссии операций ввода и вывода для обеспечения стабильности системы.
                    </div>
                </div>
            </div>
        `;
    },

    async renderLobby(container) { /* ... существующий код ... */ }
};
