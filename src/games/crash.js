
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class CrashGame {
    constructor() {
        this.multiplier = 1.0;
        this.bet = 100;
        this.isPlaying = false;
        this.interval = null;
        this.points = [];
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="p-6 space-y-6 animate-pop">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3" onclick="router.navigate('home')">
                        <i class="fas fa-arrow-left text-blue-500"></i>
                        <span class="font-black uppercase tracking-tighter">Nexus Crash</span>
                    </div>
                    <div class="flex gap-1">
                        ${[1.54, 2.10, 1.12, 5.43].map(h => `<span class="text-[8px] bg-white/5 px-2 py-1 rounded-md opacity-40 font-mono">${h}x</span>`).join('')}
                    </div>
                </div>

                <div class="relative h-80 bg-[#0a0f1e] rounded-[3rem] overflow-hidden border border-white/5 shadow-inner flex flex-col items-center justify-center">
                    <canvas id="crash-canvas" class="absolute inset-0 w-full h-full opacity-40"></canvas>
                    <div class="relative z-10 text-center">
                        <div id="multiplier-display" class="text-7xl font-black tracking-tighter transition-all duration-75">1.00x</div>
                        <div id="status-text" class="text-[9px] uppercase font-black tracking-[0.4em] opacity-30 mt-2">Ready for launch</div>
                    </div>
                    <div class="absolute bottom-6 left-6 flex items-center gap-2 opacity-20">
                        <i class="fas fa-rocket text-blue-500"></i>
                        <span class="text-[10px] font-mono uppercase">Altitude active</span>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <label class="text-[8px] font-black text-white/20 block uppercase mb-1 tracking-widest">Amount</label>
                            <input type="number" id="crash-bet" value="${this.bet}" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="document.getElementById('crash-bet').value /= 2" class="bg-white/5 rounded-xl text-[10px] font-black border border-white/5 hover:bg-white/10 transition-colors">1/2</button>
                            <button onclick="document.getElementById('crash-bet').value *= 2" class="bg-white/5 rounded-xl text-[10px] font-black border border-white/5 hover:bg-white/10 transition-colors">x2</button>
                        </div>
                    </div>
                    <button id="crash-action" class="w-full bg-blue-600 py-5 rounded-[1.8rem] font-black shadow-xl shadow-blue-600/30 uppercase tracking-[0.2em] active:scale-95 transition-all">Place Bet</button>
                </div>
            </div>
        `;
        this.initCanvas();
        this.initControls();
    }

    initCanvas() {
        this.canvas = document.getElementById('crash-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    drawGraph() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.moveTo(0, this.canvas.height);
        
        const stepX = this.canvas.width / 50;
        const stepY = this.canvas.height / 5;

        for (let i = 0; i < this.points.length; i++) {
            const x = i * stepX;
            const y = this.canvas.height - (Math.pow(this.points[i], 1.5) * stepY) + stepY;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        
        // Gradient fill
        this.ctx.lineTo(this.points.length * stepX, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.fill();
    }

    initControls() {
        const btn = document.getElementById('crash-action');
        btn.onclick = () => {
            if (!this.isPlaying) this.start(parseFloat(document.getElementById('crash-bet').value));
            else this.cashOut();
        };
    }

    start(betAmount) {
        if (betAmount > state.user.balance || betAmount <= 0) return alert('Low balance');
        
        state.updateBalance(-betAmount);
        state.incrementGameCount('crash');
        
        this.isPlaying = true;
        this.multiplier = 1.0;
        this.points = [1.0];
        this.isCrashed = false;

        const btn = document.getElementById('crash-action');
        btn.innerText = 'CASHOUT';
        btn.classList.replace('bg-blue-600', 'bg-orange-500');
        
        const crashPoint = Math.max(1, (100 / (Math.random() * 98 + 1)) * 0.98);
        
        this.interval = setInterval(() => {
            this.multiplier += 0.01 * (this.multiplier * 0.3);
            this.points.push(this.multiplier);
            
            document.getElementById('multiplier-display').innerText = this.multiplier.toFixed(2) + 'x';
            this.drawGraph();

            if (this.multiplier >= crashPoint) this.crash();
            if (this.multiplier > 2) triggerHaptic('light');
        }, 100);
    }

    cashOut() {
        if (!this.isPlaying || this.isCrashed) return;
        const win = parseFloat(document.getElementById('crash-bet').value) * this.multiplier;
        state.updateBalance(win, true);
        triggerHaptic('heavy');
        this.end(`+ ₽ ${win.toFixed(2)}`, 'text-green-500');
    }

    crash() {
        this.isCrashed = true;
        triggerHaptic('medium');
        this.end(`CRASHED @ ${this.multiplier.toFixed(2)}x`, 'text-red-500');
    }

    end(msg, color) {
        clearInterval(this.interval);
        this.isPlaying = false;
        
        const display = document.getElementById('multiplier-display');
        display.className = `text-7xl font-black tracking-tighter transition-all ${color}`;
        document.getElementById('status-text').innerText = msg;
        
        const btn = document.getElementById('crash-action');
        btn.innerText = 'PLACE BET';
        btn.className = 'w-full bg-blue-600 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] transition-all';
        
        setTimeout(() => {
            if (window.location.hash === '#game-crash') {
                this.multiplier = 1.0;
                display.innerText = '1.00x';
                display.className = 'text-7xl font-black tracking-tighter';
                document.getElementById('status-text').innerText = 'Ready for launch';
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }, 4000);
    }
}
