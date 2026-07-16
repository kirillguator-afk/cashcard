
export const state = {
    user: {
        id: 0,
        username: 'Guest',
        balance: 1000.00,
        bonusBalance: 0.00,
        photo_url: null,
        stats: {
            wins: 12,
            losses: 5,
            totalGames: 17,
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            gamesCount: {
                mines: 0,
                crash: 0,
                blackjack: 0,
                durak: 0
            }
        },
        quests: [
            { id: 'q1', title: 'Новичок Mines', desc: 'Сыграть 10 игр в Mines', target: 10, current: 0, reward: '+30% к депу', minDep: 1500, unlocked: false },
            { id: 'q2', title: 'Пилот Crash', desc: 'Сыграть 20 игр в Crash', target: 20, current: 0, reward: '+40% к депу', minDep: 3000, unlocked: false },
            { id: 'q3', title: 'Мастер Азарта', desc: 'Достичь 5 уровня', target: 5, current: 1, reward: '+50% к депу', minDep: 5000, unlocked: false },
            { id: 'q4', title: 'Хайроллер', desc: 'Выиграть 5000 ₽ суммарно', target: 5000, current: 0, reward: '+70% к депу', minDep: 10000, unlocked: false }
        ]
    },
    rooms: [],
    listeners: [],
    
    subscribe(fn) { this.listeners.push(fn); },
    
    updateBalance(amount, isWin = false) {
        this.user.balance = parseFloat((this.user.balance + amount).toFixed(2));
        if (isWin) this.checkWinQuests(amount);
        this.save();
        this.notify();
    },

    incrementGameCount(gameId) {
        this.user.stats.gamesCount[gameId]++;
        this.user.stats.totalGames++;
        this.checkGameQuests(gameId);
        this.addXp(20);
        this.save();
        this.notify();
    },

    checkGameQuests(gameId) {
        this.user.quests.forEach(q => {
            if (q.id === 'q1' && gameId === 'mines') q.current = this.user.stats.gamesCount.mines;
            if (q.id === 'q2' && gameId === 'crash') q.current = this.user.stats.gamesCount.crash;
            if (q.current >= q.target) q.unlocked = true;
        });
    },

    checkWinQuests(amount) {
        const q4 = this.user.quests.find(q => q.id === 'q4');
        if (amount > 0) {
            q4.current += amount;
            if (q4.current >= q4.target) q4.unlocked = true;
        }
    },

    addXp(amount) {
        this.user.stats.xp += amount;
        if (this.user.stats.xp >= this.user.stats.nextLevelXp) {
            this.user.stats.level++;
            this.user.stats.xp -= this.user.stats.nextLevelXp;
            // Проверка квеста на уровень
            const q3 = this.user.quests.find(q => q.id === 'q3');
            q3.current = this.user.stats.level;
            if (q3.current >= q3.target) q3.unlocked = true;
        }
        this.save();
        this.notify();
    },
    
    notify() { this.listeners.forEach(fn => fn(this.user)); },
    save() { localStorage.setItem('nexus_user_data_v2', JSON.stringify(this.user)); },
    load() {
        const saved = localStorage.getItem('nexus_user_data_v2');
        if (saved) this.user = JSON.parse(saved);
        this.notify();
    }
};
