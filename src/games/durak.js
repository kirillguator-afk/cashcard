
import { state } from '../state.js';

export class DurakGame {
    constructor() {
        this.hand = [
            { suit: '♥', val: '6' }, { suit: '♠', val: 'A' }, 
            { suit: '♦', val: '10' }, { suit: '♣', val: '7' },
            { suit: '♥', val: 'K' }, { suit: '♥', val: 'J' }
        ];
        this.trump = { suit: '♥', val: '6' };
        this.isMyTurn = true;
    }

    render() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="h-full flex flex-col bg-[#064e3b] overflow-hidden relative">
                <!-- Table Texture Overlay -->
                <div class="absolute inset-0 opacity-20 pointer-events-none" 
                     style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>

                <!-- Top Info -->
                <div class="relative z-10 p-4 flex justify-between items-center bg-black/20 backdrop-blur-md">
                    <button onclick="router.navigate('lobby-durak')" class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="flex flex-col items-center">
                        <div class="text-[10px] font-black opacity-50 uppercase tracking-widest">Козырь</div>
                        <div class="text-xl leading-none text-white shadow-sm">${this.trump.suit}</div>
                    </div>
                    <div class="w-10"></div>
                </div>

                <!-- Opponent -->
                <div class="pt-8 flex justify-center">
                    <div class="flex -space-x-6 scale-75 opacity-60">
                        ${[1,2,3,4,5].map(() => `
                            <div class="w-16 h-24 bg-gradient-to-br from-indigo-900 to-black rounded-xl border border-white/20 shadow-2xl"></div>
                        `).join('')}
                    </div>
                </div>

                <!-- Play Area -->
                <div class="flex-grow flex flex-col items-center justify-center p-4">
                    <div class="w-full max-w-xs aspect-square border-4 border-white/5 rounded-full flex items-center justify-center relative bg-black/10 shadow-inner">
                        <div id="table-center" class="grid grid-cols-2 gap-4">
                             <!-- Cards on table go here -->
                        </div>
                        
                        <!-- Deck -->
                        <div class="absolute -right-4 top-1/2 -translate-y-1/2">
                            <div class="relative w-12 h-20">
                                <div class="absolute inset-0 bg-white rounded-lg rotate-90 border-2 border-gray-200 flex items-center justify-center">
                                    <span class="text-red-600 font-bold rotate-[-90deg]">${this.trump.suit}</span>
                                </div>
                                <div class="absolute inset-0 bg-indigo-900 rounded-lg translate-y-[-4px] border border-white/20 shadow-lg flex items-center justify-center">
                                    <span class="text-[8px] font-black opacity-30 uppercase">24</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="px-6 py-4 flex gap-3">
                    <button class="flex-grow bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">Взять</button>
                    <button class="flex-grow bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all">Бито</button>
                </div>

                <!-- Hand -->
                <div class="bg-black/20 backdrop-blur-xl p-6 rounded-t-[3rem] border-t border-white/10">
                    <div class="flex justify-center -space-x-4 overflow-x-auto pb-4">
                        ${this.hand.map((c, i) => this.renderCard(c, i)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCard(card, index) {
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
            <div onclick="this.style.transform='translateY(-100px) opacity-0'; setTimeout(()=>this.remove(), 300)" 
                 class="card-item w-20 h-32 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-200 transform hover:-translate-y-8 transition-all duration-300 active:scale-110 cursor-pointer">
                <div class="text-2xl font-black ${isRed ? 'text-red-500' : 'text-black'}">${card.val}</div>
                <div class="text-3xl ${isRed ? 'text-red-500' : 'text-black'}">${card.suit}</div>
            </div>
        `;
    }
}
