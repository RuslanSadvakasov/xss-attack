window.XSS_QUIZ_BANKS = {
  types: {
    title: 'Типы XSS-атак',
    subtitle: 'Reflected, Stored, DOM — проверьте понимание классификации',
    passScore: 70,
    questions: [
      {
        q: 'Что характерно для Reflected XSS?',
        options: [
          'Скрипт сохраняется в БД и показывается всем пользователям',
          'Вредоносный ввод сразу отражается в ответе (часто через URL)',
          'Уязвимость только в localStorage без сервера',
        ],
        correct: 1,
        explain: 'Reflected XSS — «отражённая» атака: payload приходит в запросе и сразу попадает в HTML ответа.',
      },
      {
        q: 'Почему Stored XSS считается особенно опасным?',
        options: [
          'Жертва должна вручную вставить код в консоль',
          'Код хранится на сервере и выполняется у многих пользователей автоматически',
          'Работает только без HTTPS',
        ],
        correct: 1,
        explain: 'Stored (persistent) XSS заражает страницу один раз — все посетители получают payload.',
      },
      {
        q: 'DOM-based XSS отличается тем, что…',
        options: [
          'Сервер всегда экранирует вывод в HTML',
          'Цепочка от ввода до выполнения происходит в JavaScript браузера',
          'Используется только SQL-инъекция',
        ],
        correct: 1,
        explain: 'В DOM XSS опасный sink (innerHTML, document.write) на клиенте без участия сервера в отражении.',
      },
      {
        q: 'Типичный вектор для Reflected XSS:',
        options: [
          'Комментарий на форуме, сохранённый в БД',
          'Ссылка с параметром ?search=&lt;script&gt;… в URL',
          'Только заголовок HTTP Host',
        ],
        correct: 1,
        explain: 'Классика — параметры GET/POST, которые сервер вставляет в страницу без encoding.',
      },
      {
        q: 'Server XSS в современной классификации OWASP — это:',
        options: [
          'Только атаки на Node.js',
          'Reflected и Stored, где уязвимость в серверном рендере',
          'Любой XSS через WebSocket',
        ],
        correct: 1,
        explain: 'Server XSS объединяет отражённые и хранимые сценарии с серверной генерацией HTML.',
      },
      {
        q: 'Где чаще всего возникает DOM-based XSS?',
        options: [
          'В SQL-запросах к базе данных',
          'В клиентском JS при чтении location.hash, query или postMessage',
          'Только в email-рассылках сервера',
        ],
        correct: 1,
        explain: 'DOM XSS — цепочка «источник в браузере → опасный sink» без отражения сервером в HTML.',
      },
      {
        q: 'M XSS (mutation XSS) связан с:',
        options: [
          'Ошибками парсера HTML, когда «безопасная» строка после парсинга становится скриптом',
          'Только с мобильными приложениями',
          'Шифрованием cookie',
        ],
        correct: 0,
        explain: 'mXSS — особый класс: санитизация/encoding может быть обойдена из-за особенностей парсера.',
      },
      {
        q: 'Blind XSS — это когда:',
        options: [
          'Жертва не видит alert, а payload срабатывает в другом контексте (например, админ-панель)',
          'Атака работает только без JavaScript',
          'Сервер не возвращает HTTP-ответ',
        ],
        correct: 0,
        explain: 'Blind XSS часто встречается в тикетах, логах и админках — отложенное срабатывание.',
      },
      {
        q: 'Что общего у всех типов XSS?',
        options: [
          'Обязательна утечка пароля из БД',
          'Недоверенные данные попадают в контекст, где браузер может выполнить код',
          'Атака возможна только через POST',
        ],
        correct: 1,
        explain: 'Корень XSS — смешение данных и исполняемого контента, независимо от reflected/stored/DOM.',
      },
    ],
  },

  protection: {
    title: 'Методы защиты от XSS',
    subtitle: 'Encoding, CSP, cookies, DOM API',
    passScore: 70,
    questions: [
      {
        q: 'Главная цель Output Encoding:',
        options: [
          'Ускорить загрузку страницы',
          'Чтобы браузер показывал данные как текст, а не выполнял как код',
          'Заменить HTTPS на HTTP',
        ],
        correct: 1,
        explain: 'Экранирование по контексту (HTML, атрибут, JS, URL) разрывает связь «данные → код».',
      },
      {
        q: 'Флаг HttpOnly у cookie означает:',
        options: [
          'Cookie доступна только через document.cookie',
          'JavaScript не может прочитать эту cookie',
          'Cookie передаётся только по HTTP/1.0',
        ],
        correct: 1,
        explain: 'HttpOnly снижает ущерб от XSS: кража сессии через JS становится сложнее.',
      },
      {
        q: 'CSP (Content-Security-Policy) в первую очередь:',
        options: [
          'Шифрует пароли в БД',
          'Ограничивает источники и способы выполнения скриптов в браузере',
          'Заменяет валидацию на сервере',
        ],
        correct: 1,
        explain: 'CSP — защита в глубину: даже при XSS inline-скрипт может быть заблокирован.',
      },
      {
        q: 'Безопасная альтернатива innerHTML для текста пользователя:',
        options: ['eval()', 'textContent', 'document.write()'],
        correct: 1,
        explain: 'textContent вставляет строку как текст, без парсинга HTML.',
      },
      {
        q: 'Когда уместна санитизация (DOMPurify), а не только encoding?',
        options: [
          'Когда пользователю разрешён ограниченный HTML (редактор, комментарии)',
          'Никогда, encoding всегда лучше',
          'Только для CSS-файлов',
        ],
        correct: 0,
        explain: 'Sanitization удаляет опасные теги, сохраняя разрешённое форматирование.',
      },
      {
        q: 'Trusted Types защищает прежде всего от:',
        options: ['SQL injection', 'DOM XSS через опасные sinks', 'DDoS'],
        correct: 1,
        explain: 'Trusted Types требует «доверенные» объекты перед innerHTML и подобными API.',
      },
      {
        q: 'Input Validation отличается от Output Encoding тем, что:',
        options: [
          'Валидация решает, принимать ли данные; encoding делает безопасный вывод',
          'Валидация заменяет CSP',
          'Encoding выполняется только на сервере БД',
        ],
        correct: 0,
        explain: 'Валидация — whitelist/reject на входе; encoding — защита на выходе по контексту.',
      },
      {
        q: 'Флаг SameSite у cookie помогает прежде всего против:',
        options: [
          'SQL injection',
          'Отправки cookie в кросс-сайтовых запросах (CSRF и часть утечек)',
          'Медленной загрузки CSS',
        ],
        correct: 1,
        explain: 'SameSite ограничивает, когда браузер прикрепляет cookie к запросам с других сайтов.',
      },
      {
        q: 'Почему нельзя использовать один encoding для HTML, JS и URL?',
        options: [
          'Потому что браузеры не поддерживают Unicode',
          'У каждого контекста вывода свои опасные символы и правила экранирования',
          'Encoding нужен только для изображений',
        ],
        correct: 1,
        explain: 'OWASP: HTML entity, JS escape, URL encoding — разные наборы правил.',
      },
      {
        q: 'CSP директива script-src \'self\' без unsafe-inline означает:',
        options: [
          'Inline-скрипты на странице по умолчанию блокируются',
          'Все скрипты с CDN разрешены автоматически',
          'Cookie становятся HttpOnly',
        ],
        correct: 0,
        explain: 'Строгий script-src режет onclick и &lt;script&gt; в HTML — страховка при XSS.',
      },
      {
        q: 'document.write() с пользовательской строкой — это:',
        options: [
          'Безопасный sink, рекомендованный OWASP',
          'Опасный sink: строка парсится как HTML',
          'Способ включить HttpOnly',
        ],
        correct: 1,
        explain: 'document.write может внедрить разметку и скрипты — избегайте с недоверенным вводом.',
      },
    ],
  },

  vectors: {
    title: 'Векторы и практика',
    subtitle: 'Синтез: атака + защита',
    passScore: 60,
    questions: [
      {
        q: 'Почему alert(1) в пентесте — не цель атаки?',
        options: [
          'Потому что alert запрещён в HTML5',
          'Это лишь доказательство выполнения кода; реальный ущерб шире',
          'Alert работает только в IE6',
        ],
        correct: 1,
        explain: 'После выполнения JS возможны кража данных, действия от имени пользователя, фишинг.',
      },
      {
        q: 'Комбинация мер «защита в глубину» — это:',
        options: [
          'Только один WAF на границе',
          'Валидация + encoding + safe API + CSP + HttpOnly',
          'Отключение JavaScript у всех пользователей',
        ],
        correct: 1,
        explain: 'Ни одна мера не даёт 100%; OWASP рекомендует несколько уровней.',
      },
      {
        q: 'Опасный DOM sink — это:',
        options: [
          'Место, куда данные могут интерпретироваться как код (innerHTML, eval)',
          'Любой CSS-класс',
          'Только тег &lt;title&gt;',
        ],
        correct: 0,
        explain: 'Sink — «сток» данных; опасные sinks выполняют или парсят HTML/JS.',
      },
      {
        q: 'Типичная цель XSS после выполнения кода:',
        options: [
          'Ускорить индексацию в поисковиках',
          'Кража сессии, подмена UI, действия от имени пользователя',
          'Обновление версии PHP на сервере',
        ],
        correct: 1,
        explain: 'Реальный ущерб — session hijacking, keylogging, фишинг, CSRF-подобные запросы.',
      },
      {
        q: 'Вектор &lt;img src=x onerror=…&gt; использует:',
        options: [
          'Обработчик события в HTML вместо тега &lt;script&gt;',
          'Только SQL на сервере',
          'CSP report-only',
        ],
        correct: 0,
        explain: 'Event handlers (onerror, onclick) — классический обход фильтров script.',
      },
      {
        q: 'javascript: в href ссылки опасен, потому что:',
        options: [
          'Браузер может выполнить URL как скрипт при переходе/клике',
          'Ссылка всегда ведёт на HTTPS',
          'Это стандарт JSON API',
        ],
        correct: 0,
        explain: 'Псевдо-протокол javascript: — вектор в атрибутах a[href], iframe[src] и т.д.',
      },
      {
        q: 'WAF (Web Application Firewall) при XSS:',
        options: [
          'Заменяет encoding и safe DOM API',
          'Может отфильтровать часть payload, но не устраняет уязвимость в коде',
          'Делает HttpOnly ненужным',
        ],
        correct: 1,
        explain: 'WAF — дополнительный слой; обходы (encoding, теги без script) всё ещё возможны.',
      },
      {
        q: 'После XSS кража localStorage опасна, если там хранят:',
        options: [
          'Только цвет темы интерфейса',
          'JWT, API-ключи или другие секреты',
          'Публичные ссылки на документацию',
        ],
        correct: 1,
        explain: 'localStorage доступен любому JS на странице — не храните там токены сессии.',
      },
      {
        q: 'В kill chain XSS этап «отражение» означает:',
        options: [
          'Только зеркалирование экрана жертвы',
          'Payload попадает в HTML/DOM страницы доверенного сайта',
          'Отправку spam по SMTP',
        ],
        correct: 1,
        explain: 'Отражение — момент, когда ввод становится частью страницы, которую выполняет браузер.',
      },
      {
        q: 'setTimeout("…" + userInput, 100) опасен, потому что:',
        options: [
          'Первый аргумент-строка выполняется как код (аналог eval)',
          'Таймер работает только в IE',
          'Блокирует CSP автоматически',
        ],
        correct: 0,
        explain: 'setInterval/setTimeout со строкой — sink; передавайте функцию, не конкатенируйте строки.',
      },
      {
        q: 'Защита от кражи cookie через XSS — в первую очередь:',
        options: [
          'Увеличить размер cookie',
          'HttpOnly (и Secure, SameSite) для сессионных cookie',
          'Отключить CSS на сайте',
        ],
        correct: 1,
        explain: 'HttpOnly не даёт document.cookie прочитать сессию; CSP и encoding дополняют.',
      },
    ],
  },
};
