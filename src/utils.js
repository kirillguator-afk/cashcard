
export const triggerHaptic = (type = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
};

export const formatValue = (val) => {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(val);
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
