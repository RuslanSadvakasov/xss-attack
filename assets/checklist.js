/**
 * Скачивание чек-листа XSS (данные в checklist-data.js)
 */
(function () {
  const data = window.XSS_CHECKLIST;
  if (!data?.items?.length) return;

  function buildPlainText() {
    const lines = [
      data.title,
      data.subtitle || '',
      '',
      ...data.items.map((item) => `[${item.id}]. ${item.text}`),
      '',
      'Источник: XSS Shield / OWASP XSS Prevention',
      `© ${new Date().getFullYear()} — учебный материал`,
    ];
    return lines.join('\n');
  }

  function downloadTxt() {
    const blob = new Blob([buildPlainText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xss-shield-checklist.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function mountToolbar(root) {
    if (!root) return;
    const wrap = document.createElement('div');
    wrap.className =
      'checklist-toolbar flex flex-wrap gap-3 justify-center sm:justify-start items-center';

    const btnDownload = document.createElement('button');
    btnDownload.type = 'button';
    btnDownload.className =
      'px-5 py-3 rounded-xl border border-green-500/40 bg-green-500/10 text-green-300 text-sm font-semibold hover:bg-green-500/20 transition';
    btnDownload.textContent = '⬇️ Скачать .txt';
    btnDownload.addEventListener('click', downloadTxt);

    wrap.append(btnDownload);
    root.replaceChildren(wrap);
  }

  function mountPreviewList(root) {
    if (!root) return;
    const ul = document.createElement('ul');
    ul.className = 'checklist-preview space-y-2 text-gray-300 text-sm leading-relaxed';
    data.items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex gap-2';
      const num = document.createElement('span');
      num.className = 'text-red-400 font-mono shrink-0';
      num.textContent = String(item.id) + '.';
      const text = document.createElement('span');
      text.textContent = item.text;
      li.append(num, text);
      ul.append(li);
    });
    root.replaceChildren(ul);
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountToolbar(document.getElementById('checklist-actions'));
    mountPreviewList(document.getElementById('checklist-preview'));
  });

  window.XSSChecklist = { downloadTxt };
})();
