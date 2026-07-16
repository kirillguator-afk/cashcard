
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
            games: UI.renderGames,
            wallet: UI.renderWallet,
            profile: UI.renderProfile,
            'lobby-durak': (c) => UI.renderLobby(c, 'durak'),
            'game-durak': () => new DurakGame().render(),
            'game-crash': () => new CrashGame().render(),
            'game-blackjack': () => new BlackjackGame().render()
        };
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    navigate(path) { window.location.hash = path; }

    handleRoute() {
        const path = window.location.hash.slice(1) || 'home';
        const renderer = this.routes[path] || this.routes.home;
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = '';
        renderer(appContainer);
    }
}

window.router = new Router();
tg.ready();
tg.expand();

state.subscribe((user) => {
    document.getElementById('balance-display').innerText = user.balance.toFixed(2);
    document.getElementById('user-name').innerText = user.username;
});

if (tg.initDataUnsafe?.user) {
    state.user.username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
    state.user.id = tg.initDataUnsafe.user.id;
}

state.load();
router.handleRoute();
