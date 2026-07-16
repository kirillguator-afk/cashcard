
export const state = {
    user: {
        id: 0,
        username: 'Guest',
        photo_url: null,
        balance: 1000.00,
        wager: {
            current: 0,
            target: 0,
            bonusLocked: 0
        },
        stats: {
            wins: 0,
            losses: 0,
            totalGames: 0,
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            gamesCount: { mines: 0, crash: 0, blackjack: 0, durak: 0 }
        },
        quests: [
            { id: 'q1', title: 'Исследователь Недр', desc: 'Сыграть 15 игр в Mines', target: 15, current: 0, reward: '+30%', minDep: 1500, unlocked: false },
            { id: 'q2', title: 'Разрушитель Графиков', desc: 'Сыграть 30 игр в Crash', target: 30, current: 0, reward: '+40%', minDep: 3000, unlocked: false },
            { id: 'q3', title: 'Легенда Азарта', desc: 'Достичь 10 уровня', target: 10, current: 1, reward: '+50%', minDep: 5000, unlocked: false },
            { id: 'q4', title: 'Властелин Nexus', desc: 'Сделать оборот 50 000 ₽', target: 50000, current: 0, reward: '+70%', minDep: 10000, unlocked: false }
        ]
    },
    rooms: [],
    listeners: [],
    
    subscribe(fn) { this.listeners.push(fn); },
    
    // Финансовая операция: Ставка/Выигрыш
    updateBalance(amount, isWin = false) {
        if (!isWin && amount < 0) {
            // Если это ставка, добавляем в вейджер
            this.user.wager.current += Math.abs(amount);
            // Если вейджер выполнен, переводим заблокированный бонус на основной баланс
            if (this.user.wager.target > 0 && this.user.wager.current >= this.user.wager.target) {
                this.user.balance += this.user.wager.bonusLocked;
                this.user.wager.bonusLocked = 0;
                this.user.wager.target = 0;
                this.user.wager.current = 0;
            }
        }
        
        this.user.balance = parseFloat((this.user.balance + amount).toFixed(2));
        
        if (isWin && amount > 0) {
            this.user.stats.wins++;
            this.checkTurnoverQuest(amount);
        } else if (!isWin && amount < 0) {
            this.user.stats.losses++;
        }
        
        this.save();
        this.notify();
    },

    incrementGameCount(gameId) {
        this.user.stats.gamesCount[gameId] = (this.user.stats.gamesCount[gameId] || 0) + 1;
        this.user.stats.totalGames++;
        this.checkGameQuests(gameId);
        this.addXp(25);
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

    checkTurnoverQuest(amount) {
        const q4 = this.user.quests.find(q => q.id === 'q4');
        q4.current += amount;
        if (q4.current >= q4.target) q4.unlocked = true;
    },

    addXp(amount) {
        this.user.stats.xp += amount;
        if (this.user.stats.xp >= this.user.stats.nextLevelXp) {
            this.user.stats.level++;
            this.user.stats.xp -= this.user.stats.nextLevelXp;
            this.user.stats.nextLevelXp = Math.floor(this.user.stats.nextLevelXp * 1.2);
            
            const q3 = this.user.quests.find(q => q.id === 'q3');
            q3.current = this.user.stats.level;
            if (q3.current >= q3.target) q3.unlocked = true;
        }
    },
    
    notify() { this.listeners.forEach(fn => fn(this.user)); },
    
    save() {
        if (this.user.id !== 0) {
            localStorage.setItem(`nexus_data_${this.user.id}`, JSON.stringify(this.user));
        }
    },
    
    load(tgUser) {
        if (!tgUser) return;
        this.user.id = tgUser.id;
        this.user.username = tgUser.username || tgUser.first_name;
        this.user.photo_url = tgUser.photo_url || null;

        const saved = localStorage.getItem(`nexus_data_${this.user.id}`);
        if (saved) {
            const data = JSON.parse(saved);
            // Мерджим только прогресс, сохраняя актуальные данные из TG
            this.user.balance = data.balance;
            this.user.stats = data.stats;
            this.user.quests = data.quests;
            this.user.wager = data.wager || { current: 0, target: 0, bonusLocked: 0 };
        } else {
            // Инициализация нового аккаунта (нулевая статистика)
            console.log("Nexus Prime: Инициализация нового аккаунта...");
        }
        this.notify();
    }
};
