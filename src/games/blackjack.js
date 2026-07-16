
import { state } from '../state.js';

export class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.bet = 10;
        this.gameState = 'betting'; // betting, playing, ended
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="flex flex-col gap-4 h-full">
                <div class="flex items-center gap-2" onclick="router.navigate('games')">
                    <i class="fas fa-arrow-left"></i>
                    <span class="font-bold">Блэкджек</span>
                </div>

                <div class="flex-grow flex flex-col justify-around py-4">
                    <!-- Dealer -->
                    <div class="text-center">
                        <div class="text-xs text-white/40 mb-2 uppercase tracking-widest">Дилер</div>
                        <div id="dealer-cards" class="flex justify-center gap-2 min-h-[100px]"></div>
                        <div id="dealer-score" class="mt-2 font-bold text-yellow-500"></div>
                    </div>

                    <!-- Player -->
                    <div class="text-center">
                        <div id="player-score" class="mb-2 font-bold text-yellow-500"></div>
                        <div id="player-cards" class="flex justify-center gap-2 min-h-[100px]"></div>
                        <div class="text-xs text-white/40 mt-2 uppercase tracking-widest">Вы</div>
                    </div>
                </div>

                <div id="bj-controls" class="tg-secondary-bg p-4 rounded-3xl">
                    <div id="betting-ui" class="space-y-4">
                         <input type="number" id="bj-bet-input" value="${this.bet}" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono">
                         <button id="start-bj" class="w-full bg-blue-600 py-4 rounded-2xl font-bold">РАЗДАТЬ</button>
                    </div>
                    <div id="action-ui" class="hidden grid grid-cols-2 gap-4">
                        <button id="hit-btn" class="bg-green-600 py-4 rounded-2xl font-bold">ЕЩЕ</button>
                        <button id="stand-btn" class="bg-orange-500 py-4 rounded-2xl font-bold">СТОП</button>
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
        for (let s of suits) {
            for (let v of values) {
                this.deck.push({suit: s, value: v});
            }
        }
        this.deck = this.deck.sort(() => Math.random() - 0.5);
    }

    getScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else if (['J', 'Q', 'K'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    renderCard(card, hidden = false) {
        const color = (card.suit === '♥' || card.suit === '♦') ? 'text-red-500' : 'text-white';
        if (hidden) return `<div class="w-16 h-24 bg-indigo-900 rounded-lg border-2 border-white/20 flex items-center justify-center">?</div>`;
        return `
            <div class="w-16 h-24 bg-white rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center ${color} shadow-lg animate-fade-in">
                <div class="text-lg font-bold">${card.value}</div>
                <div class="text-2xl">${card.suit}</div>
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
        
        this.bet = betAmount;
        state.updateBalance(-this.bet);
        
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
        
        document.getElementById('player-score').innerText = this.getScore(this.playerHand);
        document.getElementById('dealer-score').innerText = showDealer ? this.getScore(this.dealerHand) : '?';
    }

    hit() {
        this.playerHand.push(this.deck.pop());
        this.updateUI();
        if (this.getScore(this.playerHand) > 21) this.end('Dealer wins! (Bust)', 0);
    }

    async stand() {
        let dealerScore = this.getScore(this.dealerHand);
        while (dealerScore < 17) {
            this.dealerHand.push(this.deck.pop());
            dealerScore = this.getScore(this.dealerHand);
            this.updateUI(true);
            await new Promise(r => setTimeout(r, 600));
        }
        
        const playerScore = this.getScore(this.playerHand);
        if (dealerScore > 21 || playerScore > dealerScore) {
            this.end('You win!', this.bet * 2);
        } else if (playerScore < dealerScore) {
            this.end('Dealer wins!', 0);
        } else {
            this.end('Push!', this.bet);
        }
    }

    end(msg, winAmount) {
        this.updateUI(true);
        state.updateBalance(winAmount);
        alert(msg);
        this.render(); // Reset UI
    }
}
