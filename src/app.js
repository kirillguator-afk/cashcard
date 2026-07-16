
import { state } from './state.js';
import { UI } from './ui.js';
import { MinesGame } from './games/mines.js';
import { CrashGame } from './games/crash.js';
import { BlackjackGame } from './games/blackjack.js';
import { DurakGame } from './games/durak.js';
import { triggerHaptic } from './utils.js';

const tg = window.Telegram.WebApp;

class Router {
    constructor() {
        this.routes = {
            home: UI.renderHome,
            'game-mines': () => new MinesGame().render(),
            'game-crash': () => new CrashGame().render(),
            'game-blackjack': () => new BlackjackGame().render(),
            'lobby-durak': UI.renderLobby,
            'game-durak': () => new DurakGame().render(),
            wallet: UI.renderWallet,
            profile: UI.renderProfile
        };
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    navigate(path) {
        triggerHaptic('light');
        window.location.hash = path;
    }

    handleRoute() {
        const path = window.location.hash.slice(1) || 'home';
        const renderer = this.routes[path] || this.routes.home;
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = '';
        
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-nav') === path);
        });

        renderer(appContainer);
    }
}

window.router = new Router();
tg.ready();
tg.expand();

// Настройка стилей TG
tg.headerColor = '#0f172a';
tg.backgroundColor = '#0f172a';

state.subscribe((user) => {
    const balanceEl = document.getElementById('balance-display');
    if (balanceEl) balanceEl.innerText = user.balance.toFixed(2);
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.innerText = user.username;
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
        if (user.photo_url) {
            avatarEl.innerHTML = `<img src="${user.photo_url}" class="w-full h-full object-cover rounded-2xl">`;
        } else {
            avatarEl.innerText = user.username[0].toUpperCase();
        }
    }
});

// Синхронизация данных с Telegram
if (tg.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    state.user.username = u.username || u.first_name;
    state.user.id = u.id;
    state.user.photo_url = u.photo_url || null; // TG может не отдавать photo_url без бот-токена
}

state.load();
router.handleRoute();
