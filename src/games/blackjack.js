
import { state } from '../state.js';
import { triggerHaptic, formatValue } from '../utils.js';

export class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.bet = 100;
        this.isPlaying = false;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="h-full flex flex-col bg-[#0f172a] p-6 space-y-8 animate-slide-up">
                <div class="flex items-center gap-3" onclick="router.navigate('home')">
                    <i class="fas fa-chevron-left text-blue-500"></i>
                    <span class="font-black uppercase tracking-widest text-sm">Blackjack</span>
                </div>

                <div class="flex-grow flex flex-col justify-around bg-white/5 rounded-[3rem] border border-white/5 p-4 shadow-inner">
                    <div class="text-center space-y-4">
                        <div class="text-[10px] font-black uppercase opacity-20 tracking-widest">Дилер</div>
                        <div id="dealer-cards" class="flex justify-center gap-2 min-h-[110px]"></div>
                        <div id="dealer-score" class="text-xs font-black text-blue-500"></div>
                    </div>

                    <div class="h-px bg-white/5 mx-10"></div>

                    <div class="text-center space-y-4">
                        <div id="player-score" class="text-xs font-black text-blue-500"></div>
                        <div id="player-cards" class="flex justify-center gap-2 min-h-[110px]"></div>
                        <div class="text-[10px] font-black uppercase opacity-20 tracking-widest">Вы</div>
                    </div>
                </div>

                <div id="bj-controls" class="space-y-4">
                    <div id="betting-ui" class="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4">
                         <input type="number" id="bj-bet-input" value="${this.bet}" class="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-black text-xl focus:outline-none">
                         <button id="start-bj" class="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Раздать карты</button>
                    </div>
                    <div id="action-ui" class="hidden grid grid-cols-2 gap-4">
                        <button id="hit-btn" class="bg-blue-600 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Еще</button>
                        <button id="stand-btn" class="bg-orange-500 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Стоп</button>
                    </div>
                </div>
            </div>
        `;
        this.initEvents();
    }

    createDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        for (let s of suits) for (let v of values) this.deck.push({suit: s, value: v});
        this.deck = this.deck.sort(() => Math.random() - 0.5);
    }

    getScore(hand) {
        let score = 0, aces = 0;
        for (let card of hand) {
            if (card.value === 'A') { aces++; score += 11; }
            else if (['J', 'Q', 'K'].includes(card.value)) score += 10;
            else score += parseInt(card.value);
        }
        while (score > 21 && aces > 0) { score -= 10; aces--; }
        return score;
    }

    renderCard(card, hidden = false) {
        if (hidden) return `<div class="w-16 h-24 bg-gradient-to-br from-indigo-900 to-black rounded-xl border border-white/20 shadow-2xl"></div>`;
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
            <div class="w-16 h-24 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-200 animate-slide-up">
                <div class="text-xl font-black ${isRed ? 'text-red-500' : 'text-black'}">${card.value}</div>
                <div class="text-2xl ${isRed ? 'text-red-500' : 'text-black'}">${card.suit}</div>
            </div>
        `;
    }

    initEvents() {
        document.getElementById('start-bj').onclick = () => this.start();
        document.getElementById('hit-btn').onclick = () => this.hit();
        document.getElementById('stand-btn').onclick = () => this.stand();
    }

    start() {
        const betAmount = parseFloat(document.getElementById('bj-bet-input').value);
        if (betAmount > state.user.balance || betAmount <= 0) return alert('Недостаточно средств');
        
        triggerHaptic('medium');
        this.bet = betAmount;
        state.updateBalance(-this.bet);
        state.incrementGameCount('blackjack');
        
        this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        
        document.getElementById('betting-ui').classList.add('hidden');
        document.getElementById('action-ui').classList.remove('hidden');
        this.updateUI();
    }

    updateUI(showDealer = false) {
        document.getElementById('player-cards').innerHTML = this.playerHand.map(c => this.renderCard(c)).join('');
        document.getElementById('dealer-cards').innerHTML = this.dealerHand.map((c, i) => this.renderCard(c, !showDealer && i === 1)).join('');
        document.getElementById('player-score').innerText = this.getScore(this.playerHand) + ' Очков';
        document.getElementById('dealer-score').innerText = showDealer ? this.getScore(this.dealerHand) + ' Очков' : 'Счет скрыт';
    }

    hit() {
        triggerHaptic('light');
        this.playerHand.push(this.deck.pop());
        this.updateUI();
        if (this.getScore(this.playerHand) > 21) this.end('Перебор! Дилер победил', 0);
    }

    async stand() {
        triggerHaptic('medium');
        let dealerScore = this.getScore(this.dealerHand);
        while (dealerScore < 17) {
            this.dealerHand.push(this.deck.pop());
            dealerScore = this.getScore(this.dealerHand);
            this.updateUI(true);
            await new Promise(r => setTimeout(r, 600));
        }
        
        const playerScore = this.getScore(this.playerHand);
        if (dealerScore > 21 || playerScore > dealerScore) this.end('Вы победили!', this.bet * 2);
        else if (playerScore < dealerScore) this.end('Дилер победил!', 0);
        else this.end('Ничья!', this.bet);
    }

    end(msg, winAmount) {
        this.updateUI(true);
        state.updateBalance(winAmount, winAmount > 0);
        triggerHaptic(winAmount > 0 ? 'heavy' : 'medium');
        setTimeout(() => {
            alert(msg);
            this.render();
        }, 500);
    }
}
