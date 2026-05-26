(function () {
  const SIDEBAR_PATH = '../assets/sidebar.html';

  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('sidebar-close');

    if (!sidebar || !toggle) return;

    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

    function setToggleVisible(visible) {
      toggle.classList.toggle('sidebar-toggle--hidden', !visible);
      toggle.setAttribute('aria-expanded', visible ? 'false' : 'true');
    }

    function lockPageScroll() {
      document.documentElement.classList.add('sidebar-open');
      document.body.classList.add('sidebar-open');
    }

    function unlockPageScroll() {
      document.documentElement.classList.remove('sidebar-open');
      document.body.classList.remove('sidebar-open');
    }

    function onTouchMoveWhileOpen(e) {
      if (!document.body.classList.contains('sidebar-open')) return;
      if (sidebar.contains(e.target)) return;
      e.preventDefault();
    }

    function openSidebar() {
      sidebar.classList.remove('-translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
      if (!isDesktop()) {
        lockPageScroll();
        setToggleVisible(false);
        document.addEventListener('touchmove', onTouchMoveWhileOpen, { passive: false });
      }
    }

    function closeSidebar() {
      if (isDesktop()) return;
      sidebar.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
      unlockPageScroll();
      setToggleVisible(true);
      document.removeEventListener('touchmove', onTouchMoveWhileOpen);
    }

    function applyLayout() {
      if (isDesktop()) {
        sidebar.classList.remove('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        unlockPageScroll();
        document.removeEventListener('touchmove', onTouchMoveWhileOpen);
        toggle.classList.add('md:hidden');
        toggle.classList.remove('sidebar-toggle--hidden');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        unlockPageScroll();
        document.removeEventListener('touchmove', onTouchMoveWhileOpen);
        toggle.classList.remove('md:hidden');
        setToggleVisible(true);
      }
    }

    toggle.addEventListener('click', () => {
      if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
      } else if (!isDesktop()) {
        closeSidebar();
      }
    });

    if (overlay) overlay.addEventListener('click', closeSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });

    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (!isDesktop()) closeSidebar();
      });
    });

    window.addEventListener('resize', applyLayout);
    applyLayout();

    const current = window.location.pathname.split('/').pop() || 'overview.html';
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href === current || href.endsWith('/' + current))) {
        link.classList.add('bg-red-500/15', 'text-red-400', 'font-semibold', 'border', 'border-red-500/20');
      }
    });
  }

  const container = document.getElementById('sidebar-container');
  if (!container) return;

  fetch(SIDEBAR_PATH)
    .then((r) => r.text())
    .then((html) => {
      const mount = window.DOMSafe?.mountTrustedHtml;
      if (mount) {
        mount(container, html);
      } else {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        container.replaceChildren(...doc.body.childNodes);
      }
      initSidebar();
    })
    .catch((err) => console.error('Sidebar load error:', err));
})();
