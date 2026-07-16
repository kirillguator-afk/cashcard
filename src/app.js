
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

// Инициализация
tg.ready();
tg.expand();
tg.headerColor = '#0f172a';
tg.backgroundColor = '#0f172a';

// 1. Пытаемся получить данные TG
const tgUser = tg.initDataUnsafe?.user;

// 2. Загружаем стейт (или пустой если пользователя нет)
state.load(tgUser || { id: 'preview', username: 'Guest' });

// 3. Подписка на обновления UI
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

router.handleRoute();
