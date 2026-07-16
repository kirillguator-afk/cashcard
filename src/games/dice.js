
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class DiceGame {
    constructor() {
        this.bet = 100;
        this.isPlaying = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-pop">
                <div class="flex items-center gap-3" onclick="router.navigate('home')">
                    <i class="fas fa-arrow-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-tighter">Nexus Dice</span>
                </div>

                <div class="bg-[#0f172a] border border-white/5 p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden">
                    <div id="dice-result" class="text-7xl font-black tracking-tighter mb-2">50.00</div>
                    <div id="dice-status" class="text-[10px] uppercase font-black opacity-20 tracking-[0.4em]">Roll the dice</div>
                    
                    <div class="absolute inset-x-12 bottom-8 h-1.5 bg-white/5 rounded-full">
                        <div id="dice-marker" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] transition-all duration-500" style="left: 50%"></div>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] space-y-8 shadow-xl">
                    <div class="space-y-6">
                        <div class="flex justify-between items-end px-2">
                            <div>
                                <div class="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Win Chance</div>
                                <div class="text-xl font-black"><span id="chance-val">50</span>%</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Multiplier</div>
                                <div class="text-xl font-black text-blue-500"><span id="mult-val">1.94</span>x</div>
                            </div>
                        </div>
                        <input type="range" id="dice-chance" min="2" max="95" value="50" class="w-full">
                    </div>

                    <div class="space-y-4">
                        <div class="bg-black/40 p-5 rounded-[1.8rem] border border-white/5 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-[8px] font-black opacity-20 uppercase tracking-widest">Bet Amount</span>
                                <input type="number" id="dice-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                            </div>
                            <div class="flex gap-2">
                                <button onclick="document.getElementById('dice-bet').value /= 2; triggerHaptic('light')" class="w-10 h-10 bg-white/5 rounded-xl text-[10px] font-black active:scale-90 transition-all">½</button>
                                <button onclick="document.getElementById('dice-bet').value *= 2; triggerHaptic('light')" class="w-10 h-10 bg-white/5 rounded-xl text-[10px] font-black active:scale-90 transition-all">2x</button>
                            </div>
                        </div>
                        <button id="dice-roll" class="w-full bg-blue-600 py-6 rounded-[2rem] font-black shadow-xl shadow-blue-600/30 uppercase tracking-widest active:scale-95 transition-all">Roll</button>
                    </div>
                </div>
            </div>
        `;
        this.init();
    }

    init() {
        const chanceInput = document.getElementById('dice-chance');
        chanceInput.oninput = (e) => {
            const val = e.target.value;
            document.getElementById('chance-val').innerText = val;
            document.getElementById('mult-val').innerText = (97 / val).toFixed(2);
            triggerHaptic('light');
        };

        document.getElementById('dice-roll').onclick = () => this.roll();
    }

    roll() {
        if (this.isPlaying) return;
        const bet = parseFloat(document.getElementById('dice-bet').value);
        const chance = parseInt(document.getElementById('dice-chance').value);
        
        if (bet > state.user.balance || bet <= 0) return alert('Low balance');

        this.isPlaying = true;
        state.updateBalance(-bet);
        state.incrementGameCount('dice');
        triggerHaptic('medium');

        const result = (Math.random() * 100).toFixed(2);
        const resEl = document.getElementById('dice-result');
        const statusEl = document.getElementById('dice-status');
        const marker = document.getElementById('dice-marker');

        resEl.classList.add('opacity-30');
        statusEl.innerText = 'Rolling...';
        
        setTimeout(() => {
            resEl.innerText = result;
            resEl.classList.remove('opacity-30');
            marker.style.left = result + '%';
            
            if (parseFloat(result) <= chance) {
                const win = bet * (97 / chance);
                state.updateBalance(win, true);
                resEl.className = "text-7xl font-black tracking-tighter mb-2 text-green-500 animate-pop";
                statusEl.innerText = 'WINNER';
                triggerHaptic('heavy');
            } else {
                resEl.className = "text-7xl font-black tracking-tighter mb-2 text-red-500";
                statusEl.innerText = 'LOST';
            }
            this.isPlaying = false;
        }, 500);
    }
}
