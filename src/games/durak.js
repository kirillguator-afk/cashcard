
import { state } from '../state.js';

export class DurakGame {
    constructor() {
        this.hand = [
            { suit: '♥', val: '6' }, { suit: '♠', val: 'A' }, 
            { suit: '♦', val: '10' }, { suit: '♣', val: '7' },
            { suit: '♥', val: 'K' }, { suit: '♥', val: 'J' }
        ];
        this.trump = { suit: '♥', val: '6' };
        this.table = [];
        this.isMyTurn = true;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="flex flex-col h-full overflow-hidden">
                <!-- Top Bar -->
                <div class="flex justify-between items-center mb-4">
                    <i class="fas fa-times text-xl" onclick="router.navigate('lobby-durak')"></i>
                    <div class="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Твой ход
                    </div>
                    <div class="text-yellow-500 font-bold">Козырь: ${this.trump.suit}</div>
                </div>

                <!-- Opponent -->
                <div class="flex justify-center mb-8">
                    <div class="flex -space-x-4 opacity-70 scale-90">
                        ${[1,2,3,4,5,6].map(() => `<div class="w-10 h-14 bg-indigo-900 rounded-md border border-white/20 shadow-xl"></div>`).join('')}
                    </div>
                </div>

                <!-- Table -->
                <div class="flex-grow flex items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] relative">
                    <div id="table-cards" class="grid grid-cols-3 gap-2 p-4">
                        <!-- Cards on table -->
                    </div>
                    
                    <!-- Deck -->
                    <div class="absolute right-[-20px] top-1/2 -translate-y-1/2 rotate-90">
                         <div class="w-12 h-18 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                            <span class="text-[10px] text-white/40">24</span>
                         </div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flex justify-center gap-4 my-4">
                    <button class="bg-orange-500/20 text-orange-400 px-6 py-2 rounded-xl border border-orange-500/30 font-bold text-sm">БИТО</button>
                    <button class="bg-blue-600 px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20">ВЗЯТЬ</button>
                </div>

                <!-- My Hand -->
                <div class="pb-4">
                    <div id="my-hand" class="flex justify-center -space-x-4 overflow-x-auto px-6 py-4">
                        ${this.hand.map((card, i) => this.renderCard(card, i)).join('')}
                    </div>
                </div>
            </div>
        `;

        this.initGameLogic();
    }

    renderCard(card, index) {
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
            <div onclick="this.remove();" class="card-item w-16 h-24 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100 transform hover:-translate-y-6 transition-all duration-300 active:scale-110">
                <div class="text-xl font-black ${isRed ? 'text-red-500' : 'text-black'}">${card.val}</div>
                <div class="text-2xl ${isRed ? 'text-red-500' : 'text-black'}">${card.suit}</div>
            </div>
        `;
    }

    initGameLogic() {
        // Здесь будет WebSocket соединение или Long Polling через бота
        console.log("Game Session Started");
    }
}
