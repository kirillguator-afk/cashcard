
import { state } from '../state.js';

export class CrashGame {
    constructor() {
        this.multiplier = 1.0;
        this.bet = 10;
        this.isPlaying = false;
        this.isCrashed = false;
        this.interval = null;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4" onclick="router.navigate('games')">
                    <i class="fas fa-arrow-left"></i>
                    <span class="font-bold">Крэш</span>
                </div>

                <div class="relative h-64 bg-black/40 rounded-3xl overflow-hidden flex flex-col items-center justify-center border border-white/5">
                    <div id="multiplier-display" class="text-6xl font-black transition-all duration-100">1.00x</div>
                    <div id="status-text" class="text-xs text-white/40 mt-2 uppercase tracking-widest">Ожидание ставки</div>
                    <canvas id="crash-chart" class="absolute inset-0 -z-10 w-full h-full"></canvas>
                </div>

                <div class="tg-secondary-bg p-4 rounded-3xl space-y-4">
                    <div class="flex justify-between items-center text-sm">
                        <span>Сумма ставки</span>
                        <span class="text-white/40">Мин: 1 ₽</span>
                    </div>
                    <div class="flex gap-2">
                        <input type="number" id="bet-input" value="${this.bet}" class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex-grow font-mono">
                        <button id="btn-half" class="bg-white/5 px-4 rounded-xl">1/2</button>
                        <button id="btn-double" class="bg-white/5 px-4 rounded-xl">x2</button>
                    </div>
                    <button id="action-btn" class="w-full bg-blue-600 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">
                        СТАВКА
                    </button>
                </div>
            </div>
        `;

        this.initControls();
    }

    initControls() {
        const btn = document.getElementById('action-btn');
        const input = document.getElementById('bet-input');
        
        btn.onclick = () => {
            if (!this.isPlaying) {
                this.startRound(parseFloat(input.value));
            } else {
                this.cashOut();
            }
        };

        document.getElementById('btn-half').onclick = () => { input.value = Math.max(1, (input.value / 2).toFixed(0)); };
        document.getElementById('btn-double').onclick = () => { input.value = (input.value * 2).toFixed(0); };
    }

    startRound(betAmount) {
        if (betAmount > state.user.balance || betAmount <= 0) {
            alert('Недостаточно средств!');
            return;
        }

        this.bet = betAmount;
        state.updateBalance(-this.bet);
        
        this.isPlaying = true;
        this.isCrashed = false;
        this.multiplier = 1.0;
        
        const btn = document.getElementById('action-btn');
        btn.innerText = 'ЗАБРАТЬ';
        btn.classList.replace('bg-blue-600', 'bg-orange-500');
        
        document.getElementById('status-text').innerText = 'Ракета летит...';

        const crashPoint = this.generateCrashPoint();
        
        this.interval = setInterval(() => {
            this.multiplier += 0.01 * (this.multiplier * 0.5); // Экспоненциальный рост
            document.getElementById('multiplier-display').innerText = this.multiplier.toFixed(2) + 'x';
            
            if (this.multiplier >= crashPoint) {
                this.crash();
            }
        }, 100);
    }

    generateCrashPoint() {
        const e = 2**32;
        const h = Math.floor(Math.random() * e);
        return Math.max(1, (100 * e - h) / (e - h) / 100);
    }

    cashOut() {
        if (!this.isPlaying || this.isCrashed) return;
        
        const win = this.bet * this.multiplier;
        state.updateBalance(win);
        
        this.endGame(`ВЫИГРЫШ: ${win.toFixed(2)} ₽`, 'text-green-500');
    }

    crash() {
        this.isCrashed = true;
        this.endGame(`CRASH @ ${this.multiplier.toFixed(2)}x`, 'text-red-500');
    }

    endGame(msg, colorClass) {
        clearInterval(this.interval);
        this.isPlaying = false;
        
        const display = document.getElementById('multiplier-display');
        display.classList.add(colorClass);
        
        const btn = document.getElementById('action-btn');
        btn.innerText = 'СТАВКА';
        btn.classList.remove('bg-orange-500');
        btn.classList.add('bg-blue-600');
        
        document.getElementById('status-text').innerText = msg;
        
        setTimeout(() => {
            display.classList.remove(colorClass);
            display.innerText = '1.00x';
        }, 3000);
    }
}
