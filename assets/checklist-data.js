/** Чек-лист защиты от XSS — XSS Shield */
window.XSS_CHECKLIST = {
  title: 'Чек-лист разработчика: защита от XSS',
  subtitle: 'XSS Shield — чек-лист по материалам раздела Protection',
  source: 'https://owasp.org/www-project-web-security-testing-guide/',
  items: [
    {
      id: 1,
      text: 'Считать любой пользовательский ввод недоверенным до безопасной обработки.',
      category: 'Принципы',
    },
    {
      id: 2,
      text: 'Валидировать формат данных (whitelist): email, число, дата, допустимые символы.',
      category: 'Валидация',
    },
    {
      id: 3,
      text: 'Отклонять некорректные данные на границе, а не «чинить» опасный ввод валидацией.',
      category: 'Валидация',
    },
    {
      id: 4,
      text: 'Экранировать вывод в HTML-контексте (< → &lt;, > → &gt;, & → &amp; и т.д.).',
      category: 'Encoding',
    },
    {
      id: 5,
      text: 'Использовать отдельное кодирование для атрибутов, JavaScript-строк, CSS и URL.',
      category: 'Encoding',
    },
    {
      id: 6,
      text: 'Не вставлять пользовательские данные через innerHTML, insertAdjacentHTML, document.write.',
      category: 'DOM',
    },
    {
      id: 7,
      text: 'Предпочитать textContent, setAttribute, className, value, createTextNode.',
      category: 'DOM',
    },
    {
      id: 8,
      text: 'Не использовать eval(), new Function(), setTimeout/setInterval со строкой из ввода.',
      category: 'DOM',
    },
    {
      id: 9,
      text: 'При необходимости HTML-разметки от пользователя — санитизировать (например DOMPurify).',
      category: 'Санитизация',
    },
    {
      id: 10,
      text: 'Запретить в санитизации script, обработчики событий (onclick), javascript: в href.',
      category: 'Санитизация',
    },
    {
      id: 11,
      text: 'Внедрить Content-Security-Policy: ограничить script-src, избегать unsafe-inline.',
      category: 'CSP',
    },
    {
      id: 12,
      text: 'Для сессионных cookie установить флаг HttpOnly (недоступны из document.cookie).',
      category: 'Cookies',
    },
    {
      id: 13,
      text: 'Использовать Secure для cookie только по HTTPS.',
      category: 'Cookies',
    },
    {
      id: 14,
      text: 'Установить SameSite (Strict/Lax) для снижения риска CSRF и утечек.',
      category: 'Cookies',
    },
    {
      id: 15,
      text: 'Рассмотреть Trusted Types для защиты dangerous sinks в поддерживаемых браузерах.',
      category: 'Браузер',
    },
    {
      id: 16,
      text: 'Провести аудит sinks: где данные пользователя попадают в DOM или шаблоны.',
      category: 'Процесс',
    },
    {
      id: 17,
      text: 'Комбинировать уровни защиты (defense in depth): валидация + encoding + CSP + HttpOnly.',
      category: 'Принципы',
    },
    {
      id: 18,
      text: 'Проверять reflected, stored и DOM XSS при code review и тестировании.',
      category: 'Процесс',
    },
  ],
};
