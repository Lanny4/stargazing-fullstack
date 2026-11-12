# Лабораторна робота №5. Хмарні сервіси та деплоймент

## Мета
Опублікувати повностековий React/Express/PostgreSQL застосунок на хмарній платформі, налаштувати ENV та перевірити доступність і продуктивність.

## Чому не GitHub Pages
GitHub Pages роздає статичні сторінки, але не запускає Express і PostgreSQL. Статичний сайт першої лабораторної залишається окремим. Для повного стеку використаємо Render.

## Покроково
1. Створити **новий**, порожній репозиторій GitHub `stargazing-fullstack` (не змінювати репозиторій першої лабораторної).
2. Завантажити в нього вміст папки `Stargazing_Labs_2-6`, не завантажуючи `server/.env`.
3. У Render створити PostgreSQL (перевірити актуальні доступні плани й вартість) та взяти її **Internal Database URL**, якщо розташована в одному регіоні з сервісом.
4. Render → New → Web Service → обрати GitHub-репозиторій. Root Directory порожня; Build Command: `npm install && npm run build`; Start Command: `npm run db:setup && npm start`.
5. У Environment Variables додати `NODE_ENV=production`, `DATABASE_URL`, `SESSION_SECRET`, `METRICS_TOKEN`; опційно `OPENAI_API_KEY`, `OPENAI_MODEL`.
6. Встановити Health Check Path `/api/health` і запустити Deploy.
7. Після фактичного завершення перевірити опублікований URL та `/api/health` (200).
8. Відкрити Render → Logs і Events. Для метрик зробити GET `/api/metrics` із заголовком `X-Monitor-Token` (із свого ENV).

## Де налаштування
- `render.yaml` — навчальний Blueprint; альтернативно ручний Web Service.
- `server/.env.example` — приклад параметрів; сам `.env` **не** завантажувати на GitHub.
- `server/src/metrics.js` — підрахунок запитів, помилок, середньої та p95 затримок, пам’яті, uptime.
- `GET /api/health` — SQL `SELECT 1`, що підтверджує зв'язок з PostgreSQL.

## Скриншоти
1. Новий репозиторій із React/server/db.
2. Render Web Service — успішний статус Live.
3. Налаштовані імена ENV **без відкритих значень**.
4. Відкритий публічний сайт.
5. `/api/health` на публічному домені.
6. Render Logs, Events.
7. `/api/metrics` у Postman (замаскувати токен).

**Статус до твого деплою:** підготовлено конфігурацію, але не можна стверджувати, що робота опублікована, поки Render не покаже Live й успішний health check.

## Висновок для уточнення після реального деплою
У лабораторній роботі підготовлено повностековий застосунок Stargazing для хмарного розгортання на Render, визначено конфігураційні ENV-змінні та реалізовано endpoints моніторингу. [Після розгортання зазначити фактичний URL, статус Live, результати health check і метрик.] 
