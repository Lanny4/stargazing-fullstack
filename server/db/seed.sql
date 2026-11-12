INSERT INTO services (slug, title, category, description, duration_min, price_uah, image_key, position)
VALUES
('cleaning','Чистка обличчя','Обличчя','Делікатне очищення й догляд з урахуванням особливостей шкіри.',75,1200,'clean',1),
('moisturizing','Зволоження та glow','Догляд','Доглядова програма для комфорту та зволоження шкіри.',60,950,'glow',2),
('peeling','Делікатний пілінг','Обличчя','Знайомство з м’якими методами оновлення шкіри після консультації.',45,1100,'peel',3),
('consultation','Консультація косметолога','Консультації','Обговорення потреб та підбір загального плану домашнього догляду.',30,500,'consult',4),
('massage','Масаж обличчя','Догляд','Розслаблювальний ритуал догляду для обличчя.',45,850,'massage',5),
('mask','Доглядова маска','Догляд','Комфортна процедура з базовим очищенням і маскою.',40,700,'mask',6)
ON CONFLICT (slug) DO UPDATE SET
  title=EXCLUDED.title,
  category=EXCLUDED.category,
  description=EXCLUDED.description,
  duration_min=EXCLUDED.duration_min,
  price_uah=EXCLUDED.price_uah,
  image_key=EXCLUDED.image_key,
  position=EXCLUDED.position;
