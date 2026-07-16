
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.isPlaying = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="h-full flex flex-col p-6 space-y-6 animate-pop">
                <div class="flex items-center gap-3" onclick="router.navigate('home')">
                    <i class="fas fa-arrow-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-tighter">Nexus Blackjack</span>
                </div>

                <div class="flex-grow flex flex-col justify-around bg-white/5 rounded-[4rem] border border-white/5 p-6 shadow-inner relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                    
                    <div class="text-center space-y-4">
                        <div class="text-[10px] font-black uppercase opacity-20 tracking-widest">Dealer</div>
                        <div id="dealer-cards" class="flex justify-center -space-x-8 min-h-[120px]"></div>
                    </div>

                    <div class="flex items-center gap-4">
                        <div class="h-px bg-white/10 flex-grow"></div>
                        <div id="game-status" class="text-[10px] font-black uppercase opacity-30 tracking-widest">VS</div>
                        <div class="h-px bg-white/10 flex-grow"></div>
                    </div>

                    <div class="text-center space-y-4">
                        <div id="player-cards" class="flex justify-center -space-x-8 min-h-[120px]"></div>
                        <div class="text-[10px] font-black uppercase opacity-20 tracking-widest">Your Hand</div>
                    </div>
                </div>

                <div id="bj-controls" class="space-y-4">
                    <div id="betting-ui" class="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] space-y-6">
                         <div class="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <label class="text-[8px] font-black text-white/20 block uppercase mb-1 tracking-widest">Bet</label>
                            <input type="number" id="bj-bet" value="100" class="bg-transparent border-none w-full font-black text-xl focus:outline-none">
                         </div>
                         <button id="start-bj" class="w-full bg-blue-600 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">Deal Cards</button>
                    </div>
                    <div id="action-ui" class="hidden grid grid-cols-2 gap-4">
                        <button id="hit-btn" class="bg-blue-600 py-6 rounded-[2rem] font-black uppercase shadow-xl transition-all active:scale-95">Hit</button>
                        <button id="stand-btn" class="bg-orange-600 py-6 rounded-[2rem] font-black uppercase shadow-xl transition-all active:scale-95">Stand</button>
                    </div>
                </div>
            </div>
        `;
        this.init();
    }

    createDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const vals = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        for (let s of suits) for (let v of vals) this.deck.push({suit: s, val: v});
        this.deck = this.deck.sort(() => Math.random() - 0.5);
    }

    getScore(hand) {
        let s = 0, a = 0;
        for (let c of hand) {
            if (c.val === 'A') { a++; s += 11; }
            else if (['J', 'Q', 'K'].includes(c.val)) s += 10;
            else s += parseInt(c.val);
        }
        while (s > 21 && a > 0) { s -= 10; a--; }
        return s;
    }

    renderCard(card, hidden = false) {
        if (hidden) return `<div class="w-20 h-32 bg-gradient-to-br from-indigo-900 to-black rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center animate-pop"><i class="fas fa-bolt text-white/10 text-2xl"></i></div>`;
        const red = card.suit === '♥' || card.suit === '♦';
        return `
            <div class="w-20 h-32 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100 transform hover:-translate-y-2 transition-all animate-pop">
                <div class="text-xl font-black ${red ? 'text-red-500' : 'text-black'}">${card.val}</div>
                <div class="text-3xl ${red ? 'text-red-500' : 'text-black'}">${card.suit}</div>
            </div>
        `;
    }

    init() {
        document.getElementById('start-bj').onclick = () => this.start();
        document.getElementById('hit-btn').onclick = () => this.hit();
        document.getElementById('stand-btn').onclick = () => this.stand();
    }

    start() {
        const bet = parseFloat(document.getElementById('bj-bet').value);
        if (bet > state.user.balance || bet <= 0) return alert('Low balance');
        
        state.updateBalance(-bet);
        state.incrementGameCount('blackjack');
        this.bet = bet;
        this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        
        document.getElementById('betting-ui').classList.add('hidden');
        document.getElementById('action-ui').classList.remove('hidden');
        this.updateUI();
        triggerHaptic('medium');
    }

    updateUI(show = false) {
        document.getElementById('player-cards').innerHTML = this.playerHand.map(c => this.renderCard(c)).join('');
        document.getElementById('dealer-cards').innerHTML = this.dealerHand.map((c, i) => this.renderCard(c, !show && i === 1)).join('');
    }

    hit() {
        this.playerHand.push(this.deck.pop());
        this.updateUI();
        triggerHaptic('light');
        if (this.getScore(this.playerHand) > 21) this.end('BUSTED', 0);
    }

    async stand() {
        let ds = this.getScore(this.dealerHand);
        while (ds < 17) {
            this.dealerHand.push(this.deck.pop());
            ds = this.getScore(this.dealerHand);
            this.updateUI(true);
            await new Promise(r => setTimeout(r, 600));
        }
        const ps = this.getScore(this.playerHand);
        if (ds > 21 || ps > ds) this.end('WINNER', this.bet * 2);
        else if (ps < ds) this.end('LOST', 0);
        else this.end('PUSH', this.bet);
    }

    end(msg, win) {
        this.updateUI(true);
        state.updateBalance(win, win > 0);
        document.getElementById('game-status').innerText = msg;
        triggerHaptic(win > 0 ? 'heavy' : 'medium');
        setTimeout(() => {
            if (window.location.hash === '#game-blackjack') this.render();
        }, 3000);
    }
}
