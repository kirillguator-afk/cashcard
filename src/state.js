
export const state = {
    user: {
        id: 0,
        username: 'Guest',
        balance: 1000.00,
    },
    activeRoom: null,
    rooms: [],
    games: [
        { id: 'durak', name: 'Дурак PVP', icon: 'fa-clone', color: 'bg-purple-600', multiplayer: true },
        { id: 'crash', name: 'Crash', icon: 'fa-chart-line', color: 'bg-red-500', multiplayer: false },
        { id: 'blackjack', name: 'Blackjack', icon: 'fa-suit-spade', color: 'bg-blue-600', multiplayer: false },
    ],
    
    listeners: [],
    subscribe(fn) { this.listeners.push(fn); },
    
    updateBalance(amount) {
        this.user.balance = parseFloat((this.user.balance + amount).toFixed(2));
        this.save();
        this.notify();
    },
    
    notify() { this.listeners.forEach(fn => fn(this.user)); },
    save() { localStorage.setItem('nexus_user_data', JSON.stringify(this.user)); },
    load() {
        const saved = localStorage.getItem('nexus_user_data');
        if (saved) this.user = JSON.parse(saved);
        this.notify();
    }
};
