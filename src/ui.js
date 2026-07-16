
import { state } from './state.js';
import { API } from './api.js';
import { triggerHaptic, formatValue } from './utils.js';

export const UI = {
    renderGameCard(game) {
        return `
            <div onclick="router.navigate('${game.route}')" class="relative group active:scale-95 transition-all duration-300">
                <div class="absolute inset-0 ${game.color} blur-2xl opacity-10"></div>
                <div class="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 overflow-hidden">
                    <div class="${game.color} w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                        <i class="fas ${game.icon} text-xl text-white shadow-sm"></i>
                    </div>
                    <div class="text-center">
                        <div class="text-[10px] font-black uppercase tracking-widest">${game.name}</div>
                        <div class="text-[7px] font-bold opacity-30 mt-1 uppercase">${game.multiplayer ? 'PVP' : 'Solo'}</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderHome(container) {
        const games = [
            { name: 'Mines', route: 'game-mines', icon: 'fa-bomb', color: 'bg-orange-500' },
            { name: 'Crash', route: 'game-crash', icon: 'fa-rocket', color: 'bg-red-500' },
            { name: 'Dice', route: 'game-dice', icon: 'fa-dice', color: 'bg-blue-500' },
            { name: 'Blackjack', route: 'game-blackjack', icon: 'fa-suit-spade', color: 'bg-emerald-600' }
        ];

        container.innerHTML = `
            <div class="p-6 space-y-8 animate-slide-up pb-24">
                <section class="relative p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 shadow-2xl">
                    <div class="relative z-10">
                        <span class="text-[10px] bg-black/20 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Система бонусов активна</span>
                        <h1 class="text-4xl font-black mt-4 mb-2 tracking-tighter">+70% К<br>ДЕПОЗИТУ</h1>
                        <p class="text-white/60 text-[10px] mb-8 max-w-[180px] leading-relaxed">Выполняй квесты и получай бонусы на пополнение.</p>
                        <button onclick="router.navigate('profile')" class="bg-white text-blue-700 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Квесты</button>
                    </div>
                    <i class="fas fa-fire absolute -right-6 -bottom-6 text-[12rem] text-white/5 -rotate-12"></i>
                </section>

                <div class="grid grid-cols-2 gap-4">
                    ${games.map(g => UI.renderGameCard(g)).join('')}
                </div>
            </div>
        `;
    },

    renderWallet(container) {
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up pb-32">
                <div class="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] text-center relative overflow-hidden">
                    <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Ваш баланс</div>
                    <div class="text-5xl font-black tracking-tighter">₽ ${formatValue(state.user.balance)}</div>
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-6">
                    <h3 class="text-xs font-black uppercase tracking-widest text-center opacity-40">Пополнение (Demo)</h3>
                    <div class="bg-black/40 p-5 rounded-2xl border border-white/5">
                        <label class="text-[9px] font-black opacity-30 uppercase block mb-2">Сумма пополнения</label>
                        <div class="flex items-center gap-3">
                            <span class="text-xl font-black text-yellow-500">₽</span>
                            <input type="number" id="dep-amount" value="1500" class="w-full bg-transparent border-none text-2xl font-black focus:outline-none">
                        </div>
                    </div>
                    <button id="do-deposit" class="w-full bg-green-600 py-5 rounded-[1.5rem] font-black shadow-xl shadow-green-600/20 uppercase tracking-widest active:scale-95 transition-all">Пополнить баланс</button>
                    <p class="text-[8px] text-center opacity-40 uppercase font-bold tracking-tighter">При пополнении спишется комиссия 10%</p>
                </div>
            </div>
        `;

        document.getElementById('do-deposit').onclick = () => {
            const amount = parseFloat(document.getElementById('dep-amount').value);
            if (amount < 100) return alert('Мин. сумма 100 ₽');
            
            const res = state.applyDeposit(amount);
            triggerHaptic('heavy');
            alert(`Успешно!\nЗачислено: ${res.netAmount.toFixed(2)} ₽\nБонус (Lock): ${res.bonusValue.toFixed(2)} ₽\nКомиссия: ${res.fee.toFixed(2)} ₽`);
        };
    },

    renderProfile(container) { /* Код профиля из предыдущего шага */ }
};
