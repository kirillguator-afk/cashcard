
import { state } from './state.js';
import { UI } from './ui.js';
import { CrashGame } from './games/crash.js';
import { BlackjackGame } from './games/blackjack.js';
import { DurakGame } from './games/durak.js';

const tg = window.Telegram.WebApp;

class Router {
    constructor() {
        this.routes = {
            home: UI.renderHome,
            'lobby-durak': (c) => UI.renderLobby(c, 'durak'),
            'game-durak': () => new DurakGame().render(),
            'game-crash': () => new CrashGame().render(),
            'game-blackjack': () => new BlackjackGame().render(),
            wallet: UI.renderWallet,
            profile: UI.renderProfile
        };
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    navigate(path) { 
        window.location.hash = path; 
    }

    handleRoute() {
        const path = window.location.hash.slice(1) || 'home';
        const renderer = this.routes[path] || this.routes.home;
        
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = '';
        
        // Update Bottom Nav Active State
        document.querySelectorAll('[data-nav]').forEach(el => {
            if (el.getAttribute('data-nav') === path) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        renderer(appContainer);
        window.scrollTo(0, 0);
    }
}

window.router = new Router();

// TG Initialization
tg.ready();
tg.expand();
tg.enableClosingConfirmation();
tg.headerColor = '#0f172a';
tg.backgroundColor = '#0f172a';

state.subscribe((user) => {
    const balanceEl = document.getElementById('balance-display');
    if (balanceEl) balanceEl.innerText = user.balance.toFixed(2);
    
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.innerText = user.username;
    
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl && user.username !== 'Guest') {
        avatarEl.innerText = user.username[0].toUpperCase();
    }
});

// Load User Data
if (tg.initDataUnsafe?.user) {
    state.user.username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
    state.user.id = tg.initDataUnsafe.user.id;
}

state.load();
router.handleRoute();
