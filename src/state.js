
export const state = {
    user: {
        id: 0,
        username: 'Guest',
        balance: 1000.00,
        stats: {
            wins: 12,
            losses: 5,
            totalGames: 17,
            level: 3,
            xp: 450,
            nextLevelXp: 1000
        }
    },
    rooms: [
        { id: 101, creator: 'Ivan_Crypto', bet: 100, players: 1, maxPlayers: 2, game: 'durak', status: 'waiting' },
        { id: 102, creator: 'DegenKing', bet: 500, players: 1, maxPlayers: 2, game: 'durak', status: 'waiting' }
    ],
    
    listeners: [],
    subscribe(fn) { this.listeners.push(fn); },
    
    updateBalance(amount) {
        this.user.balance = parseFloat((this.user.balance + amount).toFixed(2));
        this.save();
        this.notify();
    },

    addXp(amount) {
        this.user.stats.xp += amount;
        if (this.user.stats.xp >= this.user.stats.nextLevelXp) {
            this.user.stats.level++;
            this.user.stats.xp -= this.user.stats.nextLevelXp;
        }
        this.save();
        this.notify();
    },
    
    notify() { this.listeners.forEach(fn => fn(this.user)); },
    
    save() { 
        localStorage.setItem('nexus_user_data', JSON.stringify(this.user));
        localStorage.setItem('nexus_rooms', JSON.stringify(this.rooms));
    },
    
    load() {
        const savedUser = localStorage.getItem('nexus_user_data');
        if (savedUser) this.user = JSON.parse(savedUser);
        
        const savedRooms = localStorage.getItem('nexus_rooms');
        if (savedRooms) this.rooms = JSON.parse(savedRooms);
        
        this.notify();
    }
};
