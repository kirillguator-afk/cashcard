
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class MinesGame {
    constructor() {
        this.gridSize = 25;
        this.minesCount = 3;
        this.mines = [];
        this.revealed = [];
        this.bet = 100;
        this.isPlaying = false;
        this.isGameOver = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-slide-up">
                <div class="flex items-center gap-3 mb-4" onclick="router.navigate('home')">
                    <i class="fas fa-chevron-left"></i>
                    <span class="font-black uppercase tracking-widest text-sm">Mines</span>
                </div>

                <div class="grid grid-cols-5 gap-2 aspect-square w-full max-w-sm mx-auto bg-white/5 p-3 rounded-[2rem] border border-white/5">
                    ${Array(25).fill(0).map((_, i) => `
                        <div id="tile-${i}" onclick="window.currentGame.reveal(${i})" 
                             class="bg-white/10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 cursor-pointer shadow-lg">
                             <div class="w-2 h-2 bg-white/10 rounded-full"></div>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="text-[10px] font-black text-white/30 uppercase tracking-widest">Множитель</div>
                            <div id="mines-multiplier" class="text-2xl font-black text-blue-500">x1.00</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-black text-white/30 uppercase tracking-widest">Выигрыш</div>
                            <div id="mines-profit" class="text-2xl font-black text-green-500">₽ 0.00</div>
                        </div>
                    </div>

                    <div class="space-y-3" id="mines-controls">
                        <div class="flex gap-2">
                            <div class="flex-grow bg-black/40 p-4 rounded-2xl border border-white/5">
                                <label class="text-[10px] font-black text-white/20 block uppercase mb-1">Ставка</label>
                                <input type="number" id="mines-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                            </div>
                            <div class="bg-black/40 p-4 rounded-2xl border border-white/5 w-24">
                                <label class="text-[10px] font-black text-white/20 block uppercase mb-1">Мины</label>
                                <select id="mines-count" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                                    ${[3, 5, 10, 15, 20].map(n => `<option value="${n}" class="bg-slate-900">${n}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <button id="mines-action" class="w-full bg-blue-600 py-5 rounded-2xl font-black shadow-xl shadow-blue-600/20 uppercase tracking-widest transition-all">Играть</button>
                    </div>
                </div>
            </div>
        `;
        window.currentGame = this;
        this.initEvents();
    }

    initEvents() {
        document.getElementById('mines-action').onclick = () => {
            triggerHaptic('medium');
            if (!this.isPlaying) this.start();
            else this.cashout();
        };
    }

    start() {
        const betInput = document.getElementById('mines-bet');
        const countInput = document.getElementById('mines-count');
        this.bet = parseFloat(betInput.value);
        this.minesCount = parseInt(countInput.value);

        if (this.bet > state.user.balance || this.bet <= 0) {
            alert('Недостаточно средств');
            return;
        }

        state.updateBalance(-this.bet);
        this.isPlaying = true;
        this.isGameOver = false;
        this.revealed = [];
        this.generateMines();

        // UI Update
        document.getElementById('mines-action').innerText = 'ЗАБРАТЬ';
        document.getElementById('mines-action').classList.replace('bg-blue-600', 'bg-green-600');
        betInput.disabled = true;
        countInput.disabled = true;

        // Clear tiles
        for (let i = 0; i < 25; i++) {
            const tile = document.getElementById(`tile-${i}`);
            tile.className = "bg-white/10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 cursor-pointer shadow-lg";
            tile.innerHTML = `<div class="w-2 h-2 bg-white/10 rounded-full"></div>`;
        }
    }

    generateMines() {
        this.mines = [];
        while (this.mines.length < this.minesCount) {
            const r = Math.floor(Math.random() * 25);
            if (!this.mines.includes(r)) this.mines.push(r);
        }
    }

    calculateMultiplier() {
        // Комбинаторная формула выигрыша
        const n = 25;
        const m = this.minesCount;
        const x = this.revealed.length;
        
        const combinations = (n, k) => {
            if (k === 0) return 1;
            let res = 1;
            for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
            return res;
        };

        const mult = (combinations(n, x) / combinations(n - m, x)) * 0.97; // 3% House Edge
        return Math.max(1, mult).toFixed(2);
    }

    reveal(idx) {
        if (!this.isPlaying || this.revealed.includes(idx)) return;
        
        triggerHaptic('light');
        const tile = document.getElementById(`tile-${idx}`);
        
        if (this.mines.includes(idx)) {
            this.gameOver(false);
            tile.innerHTML = `<i class="fas fa-bomb text-red-500 animate-bounce"></i>`;
            tile.classList.add('bg-red-500/20', 'border', 'border-red-500/50');
        } else {
            this.revealed.push(idx);
            tile.innerHTML = `<i class="fas fa-gem text-blue-400 animate-pulse"></i>`;
            tile.classList.add('bg-blue-500/20', 'border', 'border-blue-500/50', 'card-active');
            
            const mult = this.calculateMultiplier();
            document.getElementById('mines-multiplier').innerText = `x${mult}`;
            document.getElementById('mines-profit').innerText = `₽ ${(this.bet * mult).toFixed(2)}`;
            
            if (this.revealed.length === (25 - this.minesCount)) this.cashout();
        }
    }

    cashout() {
        if (!this.isPlaying) return;
        const mult = this.calculateMultiplier();
        const win = this.bet * mult;
        state.updateBalance(win);
        triggerHaptic('heavy');
        this.gameOver(true);
    }

    gameOver(isWin) {
        this.isPlaying = false;
        this.isGameOver = true;
        const btn = document.getElementById('mines-action');
        btn.innerText = 'ИГРАТЬ';
        btn.classList.replace('bg-green-600', 'bg-blue-600');
        document.getElementById('mines-bet').disabled = false;
        document.getElementById('mines-count').disabled = false;

        // Reveal all mines
        this.mines.forEach(m => {
            const tile = document.getElementById(`tile-${m}`);
            if (!this.revealed.includes(m)) {
                tile.innerHTML = `<i class="fas fa-bomb text-white/20"></i>`;
            }
        });

        if (isWin) {
            state.addXp(50);
        }
    }
}
