
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class MinesGame {
    constructor() {
        this.minesCount = 3;
        this.mines = [];
        this.revealed = [];
        this.bet = 100;
        this.isPlaying = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-pop">
                <div class="flex items-center gap-3" onclick="router.navigate('home')">
                    <i class="fas fa-arrow-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-tighter">Nexus Mines</span>
                </div>

                <div class="grid grid-cols-5 gap-2 aspect-square w-full max-w-sm mx-auto bg-white/5 p-4 rounded-[3rem] border border-white/5 shadow-2xl">
                    ${Array(25).fill(0).map((_, i) => `
                        <div id="tile-${i}" onclick="window.currentGame.reveal(${i})" 
                             class="bg-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg border border-white/5">
                             <div class="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] space-y-6 shadow-xl">
                    <div class="flex justify-between items-center bg-black/40 p-5 rounded-[2rem] border border-white/5">
                        <div>
                            <div class="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Current Multiplier</div>
                            <div id="mines-multiplier" class="text-2xl font-black text-blue-500 tracking-tighter">x1.00</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Potential Profit</div>
                            <div id="mines-profit" class="text-2xl font-black text-green-500 tracking-tighter">₽ 0.00</div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-black/40 p-4 rounded-2xl border border-white/5">
                                <label class="text-[8px] font-black text-white/20 block uppercase mb-1 tracking-widest">Bet</label>
                                <input type="number" id="mines-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-lg focus:outline-none">
                            </div>
                            <div class="bg-black/40 p-4 rounded-2xl border border-white/5">
                                <label class="text-[8px] font-black text-white/20 block uppercase mb-1 tracking-widest">Mines</label>
                                <select id="mines-count" class="bg-transparent border-none w-full font-black text-lg focus:outline-none">
                                    ${[3, 5, 10, 15, 20].map(n => `<option value="${n}" class="bg-[#0f172a]">${n}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <button id="mines-action" class="w-full bg-blue-600 py-6 rounded-[2rem] font-black shadow-xl shadow-blue-600/30 uppercase tracking-widest transition-all active:scale-95">Start Game</button>
                    </div>
                </div>
            </div>
        `;
        window.currentGame = this;
        this.init();
    }

    init() {
        document.getElementById('mines-action').onclick = () => {
            if (!this.isPlaying) this.start();
            else this.cashout();
        };
    }

    start() {
        const bet = parseFloat(document.getElementById('mines-bet').value);
        if (bet > state.user.balance || bet <= 0) return alert('Low balance');

        state.updateBalance(-bet);
        state.incrementGameCount('mines');
        this.bet = bet;
        this.minesCount = parseInt(document.getElementById('mines-count').value);
        this.isPlaying = true;
        this.revealed = [];
        this.generateMines();

        document.getElementById('mines-action').innerText = 'CASHOUT';
        document.getElementById('mines-action').classList.replace('bg-blue-600', 'bg-green-600');
        document.getElementById('mines-bet').disabled = true;
        document.getElementById('mines-count').disabled = true;

        for (let i = 0; i < 25; i++) {
            const tile = document.getElementById(`tile-${i}`);
            tile.className = "bg-white/5 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg border border-white/5";
            tile.innerHTML = `<div class="w-1.5 h-1.5 bg-white/10 rounded-full"></div>`;
        }
        triggerHaptic('medium');
    }

    generateMines() {
        this.mines = [];
        while (this.mines.length < this.minesCount) {
            const r = Math.floor(Math.random() * 25);
            if (!this.mines.includes(r)) this.mines.push(r);
        }
    }

    reveal(idx) {
        if (!this.isPlaying || this.revealed.includes(idx)) return;
        const tile = document.getElementById(`tile-${idx}`);
        
        if (this.mines.includes(idx)) {
            this.gameOver(false);
            tile.innerHTML = `<i class="fas fa-bomb text-red-500 animate-pop"></i>`;
            tile.classList.add('bg-red-500/20', 'border-red-500/50');
            triggerHaptic('heavy');
        } else {
            this.revealed.push(idx);
            tile.innerHTML = `<i class="fas fa-gem text-blue-400 animate-pop text-2xl shadow-glow"></i>`;
            tile.classList.add('tile-revealed', 'card-active');
            
            const mult = this.calculateMultiplier();
            document.getElementById('mines-multiplier').innerText = `x${mult}`;
            document.getElementById('mines-profit').innerText = `₽ ${(this.bet * mult).toFixed(2)}`;
            triggerHaptic('light');
            
            if (this.revealed.length === (25 - this.minesCount)) this.cashout();
        }
    }

    calculateMultiplier() {
        const n = 25, m = this.minesCount, x = this.revealed.length;
        const combinations = (n, k) => {
            if (k === 0) return 1;
            let res = 1;
            for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
            return res;
        };
        return ((combinations(n, x) / combinations(n - m, x)) * 0.96).toFixed(2);
    }

    cashout() {
        const mult = this.calculateMultiplier();
        const win = this.bet * mult;
        state.updateBalance(win, true);
        triggerHaptic('heavy');
        this.gameOver(true);
    }

    gameOver(isWin) {
        this.isPlaying = false;
        const btn = document.getElementById('mines-action');
        btn.innerText = 'START GAME';
        btn.classList.replace('bg-green-600', 'bg-blue-600');
        document.getElementById('mines-bet').disabled = false;
        document.getElementById('mines-count').disabled = false;

        this.mines.forEach(m => {
            const tile = document.getElementById(`tile-${m}`);
            if (!this.revealed.includes(m)) {
                tile.innerHTML = `<i class="fas fa-bomb text-white/20"></i>`;
            }
        });
    }
}
