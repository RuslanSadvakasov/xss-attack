(function () {
  const root = typeof globalThis !== 'undefined' ? globalThis : window;

  function el(tag, { className, text, attrs } = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value != null) node.setAttribute(key, value);
      });
    }
    return node;
  }

  function mountTrustedHtml(container, htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    container.replaceChildren(...doc.body.childNodes);
  }

  root.DOMSafe = { el, mountTrustedHtml };
})();
