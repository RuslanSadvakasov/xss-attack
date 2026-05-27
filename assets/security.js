// Безопасное экранирование HTML
window.escapeHTML = function(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
};

// Безопасное получение параметров из URL
window.getSafeParam = function(param) {
    const value = new URLSearchParams(location.search).get(param);
    return value ? window.escapeHTML(value) : null;
};

// Безопасная вставка текста в DOM
window.safeText = function(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text || '';
};