# STARGAZING — Лабораторні №2–6

**Навчальний вебзастосунок косметологічної клініки**, створений як продовження статичного сайту з лабораторної №1.

**Технології:** React 19 + Vite 7, Node.js 22 + Express 5, PostgreSQL, REST API, OpenAPI 3.0.3, Postman, express-session з PostgreSQL, Render, OpenAI Responses API.

> Цей проєкт — навчальна демонстрація. Це не справжня клініка. Ціни умовні. Надсилання заявки не означає підтвердженого візиту. Не вводь реальні медичні дані.

## 1. Що реалізовано в кожній лабораторній

| Робота | Реалізація | Як перевірити |
|---|---|---|
| №2 React, динамічний контент, БД | Каталог з `GET /api/services`, фільтри категорій, стан React | Змінити категорію; `GET /api/services`; `SELECT * FROM services` |
| №3 Express, API, PostgreSQL, OpenAPI, Postman | Маршрути `/api/services`, `/api/appointments`, `/api/appointments/mine`, документ `/openapi.yaml`, колекція Postman | Postman: GET/POST, 201/422, перевірка запису SQL |
| №4 Форми, localStorage, сесії, валідація й безпека | Форма запису, `localStorage` тільки для фільтра, HttpOnly-cookie + сесії в PostgreSQL, валідація на сервері, Helmet, rate limit | Заповнити форму, перевірити помилковий телефон, DevTools Storage/Cookies, «Мої заявки» |
| №5 Render, ENV, моніторинг | Render Blueprint, `DATABASE_URL` / `SESSION_SECRET` / `METRICS_TOKEN`, `/api/health` і `/api/metrics` | Після власного деплою: URL сервісу, Render Logs/Events, GET health і metrics |
| №6 AI API | `/api/ai/consult` через OpenAI Responses API, React-чат, перевірка запитів | Додати власний `OPENAI_API_KEY`, задати питання, перевірити відповідь |

**Статус:** вихідний код, SQL, API-специфікацію, Postman-колекцію, тести й конфігурацію деплою створено. Перевірено 8 незалежних автоматичних тестів валідації через Node.js; додатково перевірено синтаксис JS/JSX, коректність OpenAPI YAML і JSON Postman. Повну інтеграцію з PostgreSQL, роботу браузера, Postman, Render і OpenAI слід перевірити після встановлення залежностей/внесення власних ключів; тут ці зовнішні сервіси не запускалися.

## 2. Установка на Windows — тільки VS Code та PowerShell

### 2.1. Передумови

1. Установи **Node.js 22 LTS або новіший сумісний**: https://nodejs.org/
2. Установи **PostgreSQL** для Windows: https://www.postgresql.org/download/windows/ (звичайний інсталятор з pgAdmin).
3. Установи/відкрий VS Code і розпакуй цю папку. Вибери **File → Open Folder → Stargazing_Labs_2-6**.
4. Переконайся, що PostgreSQL запущено, і запам’ятай пароль користувача `postgres`, вибраний під час установки. Для Vite 7 потрібно Node.js 22.12+ (або 20.19+), найзручніше — актуальний Node.js 22 LTS.

### 2.2. Створення бази (один раз)

Відкрий **pgAdmin → Servers → PostgreSQL → Databases → postgres → Query Tool**. Виконай, **замінивши пароль**:

```sql
CREATE USER stargazing_user WITH PASSWORD 'MY_STRONG_PASSWORD';
CREATE DATABASE stargazing OWNER stargazing_user;
```

В pgAdmin `CREATE DATABASE` краще виконувати окремим запуском, оскільки ця команда не допускає транзакційного блоку.

### 2.3. Налаштування `.env` (один раз)

У PowerShell, відкритому **в корені проєкту**:

```powershell
Copy-Item .\server\.env.example .\server\.env
notepad .\server\.env
```

У `server/.env` встанови:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://stargazing_user:MY_STRONG_PASSWORD@localhost:5432/stargazing
SESSION_SECRET=replace_this_with_long_random_string_32_chars_minimum
METRICS_TOKEN=replace_this_with_another_long_random_secret
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

**Увага:** якщо пароль PostgreSQL містить `@`, `#`, `:` або `/`, його потрібно URL-кодувати в `DATABASE_URL`; найлегше вибрати довгий буквено-цифровий пароль. Згенерувати випадковий секрет у PowerShell можна командою:

```powershell
-join ((1..48) | ForEach-Object { ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').ToCharArray() | Get-Random })
```

Ніколи не коміть `server/.env` у GitHub — він включений до `.gitignore`.

### 2.4. Запуск

У **корені** проєкту (не в `server`):

```powershell
npm install
npm run db:setup
npm run dev
```

Відкрий:

- **Сайт React:** http://localhost:5173/
- **API services:** http://localhost:4000/api/services
- **Перевірка БД:** http://localhost:4000/api/health
- **OpenAPI:** http://localhost:4000/openapi.yaml

Під час локальної розробки Vite проксіює `/api` на Express (порт 4000). Тому **Live Server для React-проєкту не потрібний**. Запуск зупиняється `Ctrl + C`.

### 2.5. Тести

В окремому PowerShell в корені:

```powershell
npm test
```

Тестуються 8 випадків (без реального підключення до БД): коректна заявка, неправильний телефон, дата в минулому, неіснуюча дата, час поза графіком, відсутня послуга, обмеження довжини AI-питання, коректне AI-питання.

## 3. SQL-перевірка в pgAdmin

```sql
SELECT id, title, category, price_uah FROM services ORDER BY position;
SELECT reference, service_id, preferred_date, preferred_time, status
FROM appointments ORDER BY created_at DESC LIMIT 10;
-- Після першого запиту GET /api/session:
SELECT COUNT(*) FROM session;
```

SQL-скрипти: `server/db/schema.sql` (таблиці) і `server/db/seed.sql` (6 послуг). `npm run db:setup` виконує обидва скрипти. Виклик повторно безпечний для послуг (UPSERT).

## 4. Postman (лабораторна №3)

1. Запусти сервер і PostgreSQL.
2. Відкрий Postman → **Import → Files**.
3. Обери `postman/Stargazing.postman_collection.json`.
4. У Collection Variables перевір `baseUrl = http://localhost:4000`.
5. Послідовно виконай запити 1–6:
   - `GET /api/health` → 200 та `database:connected`.
   - `GET /api/services` → 200 і 6 елементів.
   - `GET /api/session` → 200, cookie сесії.
   - `POST /api/appointments` → 201 і `reference`.
   - `GET /api/appointments/mine` → 200, щойно створена заявка за тієї самої cookie.
   - `POST /api/appointments` з помилковими даними → 422.
6. Для запиту 7 потрібний AI ключ, для 8 — реальний `METRICS_TOKEN` з `server/.env`.

Postman запит №4 самостійно генерує майбутню дату; не потрібно вручну міняти дати в JSON. Postman зберігає cookies для домену localhost (якщо не вимкнено cookie jar).

## 5. localStorage і сесії (лабораторна №4)

- React зберігає **лише обрану категорію послуг** у `localStorage` під ключем `stargazing.category`. Це безпечна несекретна UI-настройка.
- Особисті дані форми **не записуються в localStorage**, а після POST ідуть лише до сервера.
- `express-session` створює HttpOnly-cookie `stargazing.sid`. Сама сесія (`visits`, ID заявок) зберігається в PostgreSQL у таблиці `session`.
- Endpoint `/api/appointments/mine` повертає тільки ID-зв’язані із сесією заявки, без ПІБ і телефона; це **демо-сесія, не повноцінна автентифікація**.
- Сервер перевіряє ім’я, телефон, дату, час, serviceId, довжину коментаря і існування послуги. SQL-запити параметризовані (`$1`...).
- Використано Helmet (HTTP-заголовки), HttpOnly/SameSite, Secure cookies на HTTPS, захист перевіркою Origin, rate limiting, обмеження JSON 20 KB, відсутність API-ключів у React.

**Обмеження:** це навчальна система. Для справжньої клініки потрібні облікові записи, політика приватності й згоди, контроль ролей, повноцінні журнали доступу, резервні копії, захист персональних даних і юридичні процедури.

## 6. Деплой Render (лабораторна №5)

**Не замінюй уже виконану лабораторну №1 на GitHub Pages.** Створи **новий** репозиторій, наприклад `stargazing-fullstack`, для цієї папки.

### 6.1. Завантаження нового репозиторію (PowerShell)

```powershell
git init
git add .
git commit -m "Labs 2-6 React Express PostgreSQL"
git branch -M main
git remote add origin https://github.com/Lanny4/stargazing-fullstack.git
git push -u origin main
```

Спочатку створи порожній **Public** репозиторій `stargazing-fullstack` на GitHub. Якщо Git вимагає ім’я та email, налаштуй `git config --global user.name "..."` і `git config --global user.email "..."`.

### 6.2. PostgreSQL на Render

У Render Dashboard створити PostgreSQL DB, або підключити існуючу хмарну PostgreSQL (ціни й наявність безплатних планів перевір у Render перед підтвердженням). У БД скопіювати **Internal Database URL** (для сервісу в тому самому Render-регіоні) та зберігати його **лише в ENV**, не у GitHub.

### 6.3. Web Service

Render → New → Web Service → GitHub repo `stargazing-fullstack`.

- Runtime: **Node**;
- Branch: **main**;
- Root Directory: **порожнє** (монорепозиторій);
- Build Command: `npm install && npm run build`;
- Start Command: `npm run db:setup && npm start`;
- Health Check: `/api/health`.

**Environment**:

| Назва | Значення |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Database URL своєї Render PostgreSQL |
| `SESSION_SECRET` | новий випадковий секрет, 32+ символів |
| `METRICS_TOKEN` | інший випадковий секрет, 16+ символів |
| `OPENAI_API_KEY` | власний ключ (опційний) |
| `OPENAI_MODEL` | `gpt-5-mini` (якщо доступна для ключа) |

Альтернатива ручному налаштуванню — `render.yaml`, але PostgreSQL і DATABASE_URL усе одно налаштовує користувач.

Після публікації відкрий URL виду `https://<your-service>.onrender.com/` (фактичну адресу видає Render) та `https://<your-service>.onrender.com/api/health`.

### 6.4. Моніторинг

- `GET /api/health` → статус API і підключення до БД (200 або 503);
- `GET /api/metrics` із заголовком `X-Monitor-Token` → кількість запитів, помилки HTTP, середня та p95 затримки останніх 200 запитів, використання RSS-пам’яті, uptime;
- Render Dashboard → Logs і Events показують стан деплою й помилки процесу.

**Важливо:** метрики зберігаються тільки в пам’яті поточного процесу та обнуляються при його перезапуску. Для повноцінного тривалого моніторингу потрібен зовнішній сервіс метрик.

## 7. Інтеграція OpenAI (лабораторна №6)

1. Створи API-ключ у власному OpenAI API-акаунті, якщо маєш доступ: https://platform.openai.com/api-keys (можлива оплата залежно від тарифу).
2. Встав ключ **лише в `server/.env`**: `OPENAI_API_KEY=...`.
3. Перезапусти `npm run dev`.
4. На сайті відкрий секцію **AI-помічник**, постав загальне питання. Frontend викликає `POST /api/ai/consult`, сервер звертається до OpenAI Responses API, відповідь відображається в React.
5. Без ключа API чесно повертає **503** та повідомлення про необхідність налаштування. Це очікувана, а не вигадана AI-відповідь.

**Захист:** ключ ніколи не повинен потрапити в `client/`, GitHub, скриншоти, Postman-колекцію або `VITE_*` змінні. Не надсилай на AI медичні чи ідентифікаційні дані.

## 8. Структура проєкту

```text
Stargazing_Labs_2-6/
├── client/
│   ├── public/assets/           SVG-графіка з лабораторної №1
│   ├── index.html               Кореневий HTML для React
│   ├── src/main.jsx             React: каталог, форми, сесії, AI-чат
│   ├── src/legacy.css           Стилі Stargazing із лабораторної №1
│   ├── src/styles.css           Розширені стилі лабораторних №2–6
│   └── vite.config.js           Vite + проксі /api → Express
├── server/
│   ├── .env.example             Приклад ENV (без справжніх ключів)
│   ├── db/schema.sql            SQL-таблиці
│   ├── db/seed.sql              Шість тестових послуг
│   ├── db/setup.js              Налаштування PostgreSQL
│   ├── src/index.js             Express сервер + REST API
│   ├── src/validation.js        Серверна валідація форм
│   ├── src/metrics.js           Моніторинг
│   ├── openapi.yaml             OpenAPI 3.0.3
│   └── tests/validation.test.js 8 автоматичних перевірок
├── postman/Stargazing.postman_collection.json
├── docs/                        5 інструкцій + план + результати тестів
├── reports/                     5 Word-чернеток (без скриншотів)
├── render.yaml                  Шаблон розгортання на Render
├── package.json                 npm-скрипти та залежності
└── README.md
```

## 9. Що потрібно заскринити для звітів

| Лаб. | Рекомендовані скриншоти |
|---|---|
| №2 | React-каталог, перемикання категорії, `GET /api/services`, дані `services` у pgAdmin |
| №3 | Express-термінал, OpenAPI YAML, Postman GET/POST 201, негативний тест 422, SQL-запис у PostgreSQL |
| №4 | Заповнена форма, успішна заявка, повідомлення валідації, DevTools → Local Storage, Cookies, «Мої заявки» |
| №5 | Render Service/ENV (без видимих значень ключів!), Live URL, Health 200, Logs/Events, Metrics (токен приховати) |
| №6 | Форма питання AI, реальна відповідь, Postman AI запит 200, перевірка відмови без API-ключа 503 |

Для звіту **ніколи не роби скриншоти відкритих `.env` із секретами**. Якщо не виконано зовнішній етап — не підписуй його як перевірений.

## 10. Джерела документації

- React: https://react.dev/learn
- Vite: https://vite.dev/guide/
- Express: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- OpenAPI 3: https://spec.openapis.org/oas/v3.0.3.html
- Postman: https://learning.postman.com/docs/
- Render Node deployment: https://render.com/docs/deploy-node-express-app
- Render PostgreSQL: https://render.com/docs/postgresql-creating-connecting
- OpenAI JS API: https://developers.openai.com/api/docs/quickstart

### Готові інструкції та звіти

У папці `docs/` є покрокова інструкція до кожної лабораторної; в `reports/` — Word-чернетки зі змістом, метою, алгоритмом, очікуваними результатами та переліком скриншотів. **Це не фінальні підписані звіти**: після запуску на Windows необхідно додати справжні скриншоти, перевірені результати і, за потреби, скоригувати висновки.
