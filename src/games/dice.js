
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class DiceGame {
    constructor() {
        this.bet = 100;
        this.chance = 50;
        this.isPlaying = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up">
                <div class="flex items-center gap-3" onclick="router.navigate('home')">
                    <i class="fas fa-chevron-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-widest text-sm">DICE</span>
                </div>

                <div class="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
                    <div id="dice-result" class="text-6xl font-black mb-2">50.00</div>
                    <div class="text-[10px] uppercase font-black opacity-30 tracking-[0.3em]">Результат броска</div>
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-white/5">
                        <div id="dice-progress" class="h-full bg-blue-500 transition-all duration-500" style="width: 50%"></div>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-8">
                    <div class="space-y-4">
                        <div class="flex justify-between text-[10px] font-black uppercase opacity-40">
                            <span>Шанс: <span id="chance-val">50</span>%</span>
                            <span>Коэф: <span id="mult-val">1.94</span>x</span>
                        </div>
                        <input type="range" id="dice-chance" min="1" max="95" value="50" class="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-blue-600">
                    </div>

                    <div class="space-y-4">
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <input type="number" id="dice-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                            <div class="flex gap-2">
                                <button onclick="document.getElementById('dice-bet').value /= 2" class="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black">/2</button>
                                <button onclick="document.getElementById('dice-bet').value *= 2" class="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black">x2</button>
                            </div>
                        </div>
                        <button id="dice-roll" class="w-full bg-blue-600 py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-600/30 uppercase tracking-widest transition-all active:scale-95">Бросить кубик</button>
                    </div>
                </div>
            </div>
        `;
        this.init();
    }

    init() {
        const chanceInput = document.getElementById('dice-chance');
        const rollBtn = document.getElementById('dice-roll');

        chanceInput.oninput = (e) => {
            const val = e.target.value;
            document.getElementById('chance-val').innerText = val;
            const mult = (97 / val).toFixed(2);
            document.getElementById('mult-val').innerText = mult;
            document.getElementById('dice-progress').style.width = val + '%';
            triggerHaptic('light');
        };

        rollBtn.onclick = () => this.roll();
    }

    roll() {
        if (this.isPlaying) return;
        const bet = parseFloat(document.getElementById('dice-bet').value);
        const chance = parseInt(document.getElementById('dice-chance').value);
        
        if (bet > state.user.balance || bet <= 0) return alert('Недостаточно средств');

        this.isPlaying = true;
        state.updateBalance(-bet);
        state.incrementGameCount('dice');
        triggerHaptic('medium');

        const result = (Math.random() * 100).toFixed(2);
        const resEl = document.getElementById('dice-result');
        const mult = (97 / chance);

        resEl.classList.add('animate-pulse', 'opacity-50');
        
        setTimeout(() => {
            resEl.innerText = result;
            resEl.classList.remove('animate-pulse', 'opacity-50');
            
            if (parseFloat(result) <= chance) {
                const win = bet * mult;
                state.updateBalance(win, true);
                resEl.className = "text-6xl font-black mb-2 text-green-500 animate-bounce";
                triggerHaptic('heavy');
            } else {
                resEl.className = "text-6xl font-black mb-2 text-red-500";
            }
            this.isPlaying = false;
        }, 300);
    }
}
