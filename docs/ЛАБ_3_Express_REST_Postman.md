# Лабораторна робота №3. Основи серверної логіки

## Мета
Створити сервер Node.js/Express, реалізувати REST API для читання та збереження інформації в PostgreSQL, додати OpenAPI та протестувати запити через Postman.

## Терміни
**Node.js** — середовище виконання JavaScript на сервері; **Express** — фреймворк HTTP-маршрутів; **REST API** — правила доступу до ресурсів за HTTP; **GET** — прочитати, **POST** — створити; **JSON** — формат обміну; **OpenAPI** — машинозчитуваний опис API; **Postman** — перевірка HTTP-запитів.

## Виконання
1. Підготувати БД і виконати `npm run dev`.
2. Перейти на `http://localhost:4000/api/health` — очікувати `status: ok`, `database: connected`.
3. Перейти на `http://localhost:4000/api/services` — JSON-каталог.
4. Перейти на `http://localhost:4000/openapi.yaml` — OpenAPI 3.0.3.
5. Встановити Postman і імпортувати `postman/Stargazing.postman_collection.json`.
6. Послідовно виконати запити 01–06. `POST /api/appointments` із правильними даними має повернути **201**, а з некоректними — **422**. Колекція сама підставляє майбутню дату.
7. У pgAdmin виконати:

```sql
SELECT reference, service_id, preferred_date, preferred_time, status
FROM appointments ORDER BY created_at DESC LIMIT 10;
```

## Головні маршрути
- `GET /api/health` — 200 або 503, стан PostgreSQL.
- `GET /api/services` — 200, каталог.
- `GET /api/session` — 200, створення/продовження сесії.
- `POST /api/appointments` — 201 або 422, збереження демозаявки.
- `GET /api/appointments/mine` — 200, поточна сесія.
- `POST /api/ai/consult` — 200 за наявності ключа, 503 без нього.
- `GET /api/metrics` — метрики за X-Monitor-Token.

## Фрагмент принципу SQL
```javascript
const rows = await pool.query(
  'SELECT id, title, category, price_uah FROM services ORDER BY position'
);
```
Для `INSERT` використані параметризовані значення `$1...$7`, щоб відокремити дані від SQL-команд.

## Скриншоти
1. PowerShell: Express запустився на 4000.
2. Postman: health 200.
3. Postman: services 200 і JSON-масив.
4. Postman: appointment 201 та `reference`.
5. Postman: помилкова заявка 422.
6. PgAdmin: запис з'явився в `appointments`.
7. OpenAPI у браузері або VS Code.

## Висновок для уточнення після перевірки
Під час лабораторної роботи реалізовано REST API на Node.js/Express, яке взаємодіє з PostgreSQL. Описано маршрути у форматі OpenAPI та підготовлено перевірки GET/POST у Postman, включно з успішними та помилковими сценаріями. [Додати підтверджені статуси та результати Postman.] 
