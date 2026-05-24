(function () {
  const { el } = window.DOMSafe || {
    el: (tag, o = {}) => {
      const n = document.createElement(tag);
      if (o.className) n.className = o.className;
      if (o.text != null) n.textContent = String(o.text);
      return n;
    },
  };

  const STORAGE_PREFIX = 'xss-shield-quiz-';

  function storageKey(quizId) {
    return STORAGE_PREFIX + quizId;
  }

  function loadSaved(quizId) {
    try {
      const raw = localStorage.getItem(storageKey(quizId));
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveResult(quizId, payload) {
    try {
      localStorage.setItem(storageKey(quizId), JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Quiz: не удалось сохранить результат', e);
      return false;
    }
  }

  function buildHeader(bank) {
    const progressWrap = el('div', {
      className: 'mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden',
    });
    progressWrap.appendChild(
      el('div', { className: 'quiz-progress h-full bg-red-500 transition-all duration-300' })
    );

    const header = el('div', { className: 'mb-6 quiz-header' });
    header.append(
      el('p', {
        className: 'text-xs uppercase tracking-[0.25em] text-red-500 mb-2',
        text: 'Проверка знаний',
      }),
      el('h3', { className: 'text-2xl md:text-3xl font-black text-white', text: bank.title }),
      el('p', { className: 'text-gray-400 mt-2', text: bank.subtitle }),
      progressWrap
    );
    return header;
  }

  function renderQuiz(container, bank) {
    const quizId = container.dataset.quiz;
    if (!quizId) return;

    let step = 0;
    let score = 0;

    container.className =
      'quiz-widget card-glass rounded-3xl p-6 md:p-8 border border-red-500/20 my-12';
    container.replaceChildren();

    const header = buildHeader(bank);
    const body = el('div', { className: 'quiz-body' });
    container.append(header, body);

    function progressBar() {
      return container.querySelector('.quiz-progress');
    }

    function updateProgress() {
      const bar = progressBar();
      if (bar) bar.style.width = `${(step / bank.questions.length) * 100}%`;
    }

    function showResult(correct, total, fromCache) {
      const pct = Math.round((correct / total) * 100);
      const passed = pct >= bank.passScore;
      updateProgress();
      const bar = progressBar();
      if (bar) bar.style.width = '100%';

      if (!fromCache) {
        saveResult(quizId, {
          passed,
          score: correct,
          total,
          pct,
          date: Date.now(),
        });
      }

      const wrap = el('div', { className: 'text-center py-6' });
      wrap.append(
        el('div', { className: 'text-5xl mb-4', text: passed ? '🛡️' : '⚠️' }),
        el('h4', {
          className: `text-2xl font-black mb-2 ${passed ? 'text-green-400' : 'text-yellow-400'}`,
          text: passed ? 'Тест пройден!' : 'Нужно повторить материал',
        }),
        el('p', { className: 'text-3xl font-black text-white mb-2', text: `${correct} / ${total}` }),
        el('p', {
          className: 'text-gray-400 mb-6',
          text: `${pct}% (порог ${bank.passScore}%)`,
        })
      );

      const actions = el('div', { className: 'flex flex-wrap justify-center gap-3' });
      const retryBtn = el('button', {
        className:
          'quiz-retry px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition',
        text: 'Пройти снова',
      });
      retryBtn.type = 'button';
      retryBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem(storageKey(quizId));
        } catch (_) { /* ignore */ }
        renderQuiz(container, bank);
      });
      actions.appendChild(retryBtn);
      wrap.appendChild(actions);
      body.replaceChildren(wrap);
    }

    function showQuestion() {
      updateProgress();
      const q = bank.questions[step];

      const opts = el('div', { className: 'quiz-options flex flex-col gap-3' });
      const feedback = el('p', {
        className: 'quiz-feedback mt-4 text-sm hidden',
      });
      const nextBtn = el('button', {
        className:
          'quiz-next mt-6 px-6 py-3 rounded-xl bg-red-500/40 text-gray-500 cursor-not-allowed font-semibold transition',
        text: 'Далее',
      });
      nextBtn.type = 'button';
      nextBtn.disabled = true;

      let picked = null;

      q.options.forEach((text, i) => {
        const btn = el('button', {
          className:
            'quiz-option text-left px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-gray-200 hover:border-red-500/40 hover:bg-red-500/10 transition',
          text,
        });
        btn.type = 'button';
        btn.addEventListener('click', () => {
          if (picked !== null) return;
          picked = i;
          const correct = i === q.correct;
          if (correct) score++;

          opts.querySelectorAll('.quiz-option').forEach((b, idx) => {
            b.disabled = true;
            b.classList.add('opacity-70', 'cursor-default');
            if (idx === q.correct) {
              b.classList.add('border-green-500/50', 'bg-green-500/15', 'text-green-300');
            } else if (idx === i && !correct) {
              b.classList.add('border-red-500/50', 'bg-red-500/15');
            }
          });

          feedback.classList.remove('hidden');
          feedback.className = `quiz-feedback mt-4 text-sm p-4 rounded-xl border ${
            correct
              ? 'border-green-500/30 bg-green-500/10 text-green-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`;
          feedback.textContent = (correct ? '✓ Верно. ' : '✗ Неверно. ') + q.explain;

          nextBtn.disabled = false;
          nextBtn.className =
            'quiz-next mt-6 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 font-semibold transition glow-red';
          nextBtn.textContent =
            step < bank.questions.length - 1 ? 'Следующий вопрос' : 'Показать результат';
        });
        opts.appendChild(btn);
      });

      nextBtn.addEventListener('click', () => {
        step++;
        if (step < bank.questions.length) showQuestion();
        else showResult(score, bank.questions.length, false);
      });

      body.replaceChildren(
        el('p', {
          className: 'text-gray-500 text-sm mb-2',
          text: `Вопрос ${step + 1} из ${bank.questions.length}`,
        }),
        el('p', {
          className: 'text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed',
          text: q.q,
        }),
        opts,
        feedback,
        nextBtn
      );
    }

    const saved = loadSaved(quizId);
    if (saved && typeof saved.score === 'number' && saved.total) {
      showResult(saved.score, saved.total, true);
      return;
    }

    showQuestion();
  }

  function init() {
    if (!window.XSS_QUIZ_BANKS) return;

    document.querySelectorAll('[data-quiz]').forEach((node) => {
      const key = node.dataset.quiz;
      const bank = window.XSS_QUIZ_BANKS[key];
      if (bank) renderQuiz(node, bank);
      else console.warn('Quiz: неизвестный банк', key);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
