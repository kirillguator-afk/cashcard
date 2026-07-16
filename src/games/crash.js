
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class CrashGame {
    constructor() {
        this.multiplier = 1.0;
        this.bet = 100;
        this.isPlaying = false;
        this.isCrashed = false;
        this.interval = null;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up">
                <div class="flex items-center gap-3 mb-4" onclick="router.navigate('home')">
                    <i class="fas fa-chevron-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-widest text-sm">CRASH ROCKET</span>
                </div>

                <div class="relative h-72 bg-black/40 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                    <div id="multiplier-display" class="text-7xl font-black tracking-tighter">1.00x</div>
                    <div id="status-text" class="text-[10px] text-white/30 mt-4 uppercase tracking-[0.3em] font-black">Ожидание взлета</div>
                    <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none"></div>
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <label class="text-[9px] font-black text-white/20 block uppercase mb-1">Ставка</label>
                            <input type="number" id="crash-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="crash-half" class="bg-white/5 rounded-xl text-[10px] font-black border border-white/5">1/2</button>
                            <button id="crash-double" class="bg-white/5 rounded-xl text-[10px] font-black border border-white/5">x2</button>
                        </div>
                    </div>
                    <button id="crash-action" class="w-full bg-blue-600 py-6 rounded-[2rem] font-black shadow-xl shadow-blue-600/30 uppercase tracking-[0.2em] active:scale-95 transition-all text-sm">ПОЕХАЛИ!</button>
                </div>
            </div>
        `;

        this.initControls();
    }

    initControls() {
        const btn = document.getElementById('crash-action');
        const input = document.getElementById('crash-bet');
        
        btn.onclick = () => {
            triggerHaptic('medium');
            if (!this.isPlaying) this.startRound(parseFloat(input.value));
            else this.cashOut();
        };

        document.getElementById('crash-half').onclick = () => { input.value = Math.max(1, (input.value / 2).toFixed(0)); };
        document.getElementById('crash-double').onclick = () => { input.value = (input.value * 2).toFixed(0); };
    }

    startRound(betAmount) {
        if (betAmount > state.user.balance || betAmount <= 0) {
            alert('Недостаточно средств!');
            return;
        }

        this.bet = betAmount;
        state.updateBalance(-this.bet);
        state.incrementGameCount('crash');
        
        this.isPlaying = true;
        this.isCrashed = false;
        this.multiplier = 1.0;
        
        const btn = document.getElementById('crash-action');
        btn.innerText = 'ЗАБРАТЬ';
        btn.classList.replace('bg-blue-600', 'bg-orange-500');
        
        document.getElementById('status-text').innerText = 'РАКЕТА В ПУТИ...';
        document.getElementById('crash-bet').disabled = true;

        const crashPoint = Math.max(1, (100 / (Math.random() * 99 + 1)) * 0.97);
        
        this.interval = setInterval(() => {
            this.multiplier += 0.01 * (this.multiplier * 0.4); 
            document.getElementById('multiplier-display').innerText = this.multiplier.toFixed(2) + 'x';
            
            if (this.multiplier >= crashPoint) this.crash();
            if (this.multiplier > 2) triggerHaptic('light');
        }, 100);
    }

    cashOut() {
        if (!this.isPlaying || this.isCrashed) return;
        const win = this.bet * this.multiplier;
        state.updateBalance(win, true);
        triggerHaptic('heavy');
        this.endGame(`ВЫИГРЫШ: ₽ ${formatValue(win)}`, 'text-green-500');
    }

    crash() {
        this.isCrashed = true;
        triggerHaptic('medium');
        this.endGame(`CRASH @ ${this.multiplier.toFixed(2)}x`, 'text-red-500');
    }

    endGame(msg, colorClass) {
        clearInterval(this.interval);
        this.isPlaying = false;
        const display = document.getElementById('multiplier-display');
        display.className = `text-7xl font-black tracking-tighter ${colorClass} animate-pulse`;
        
        const btn = document.getElementById('crash-action');
        btn.innerText = 'ПОЕХАЛИ!';
        btn.classList.replace('bg-orange-500', 'bg-blue-600');
        
        document.getElementById('status-text').innerText = msg;
        document.getElementById('crash-bet').disabled = false;
        
        setTimeout(() => {
            if (window.location.hash === '#game-crash') {
                display.className = 'text-7xl font-black tracking-tighter';
                display.innerText = '1.00x';
                document.getElementById('status-text').innerText = 'Ожидание взлета';
            }
        }, 3000);
    }
}
