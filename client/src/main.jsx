import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './legacy.css';
import './styles.css';

async function request(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Object.values(data.details || {}).join(' ') || data.error || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const bookingBlank = { name: '', phone: '', serviceId: '', date: '', time: '11:00', comment: '' };

function ServiceIllustration({ type }) {
  const paths = {
    clean: <><ellipse cx="110" cy="96" rx="60" ry="74"/><path d="M78 87q12-10 25 0M122 87q12-10 25 0M112 92l-8 23h13m-25 18q18 10 37 0M60 66q0-48 53-46 44 0 51 37"/></>,
    glow: <><rect x="81" y="67" width="63" height="88" rx="12"/><rect x="93" y="48" width="39" height="19" rx="2"/><path d="M104 48V35h16v13M95 108h36M113 88v45m48-65 11-25 10 25 25 10-25 9-10 25-11-25-23-9 23-10"/></>,
    peel: <><path d="M110 22C90 59 64 85 64 117a46 46 0 0 0 92 0c0-32-26-58-46-95Z"/><path d="M86 119q3 19 24 23M174 52l7-19 7 19 18 7-18 8-7 18-7-18-17-8 17-7"/></>,
    consult: <><path d="M46 57h130v81H87l-35 21v-21h-6Z"/><path d="M75 89h78M75 108h57M160 54V33M149 43h22"/></>,
    massage: <><path d="M91 44c-34 8-48 36-43 72 5 27 30 53 63 54 39 2 64-29 64-65 0-39-30-65-67-65"/><path d="M93 89q10-9 20-2m18 2q9-7 18-2m-31 5-4 27h13m-28 21q17 7 31-1M70 42l9-16 9 16 17 9-17 9-9 16-9-16-17-9 17-9"/></>,
    mask: <><rect x="74" y="61" width="73" height="103" rx="15"/><path d="M86 61V45h49v16M87 94h47M87 113h47M100 132h21M162 53l7-17 7 17 18 7-18 7-7 18-7-18-18-7 18-7"/></>
  };
  return <svg viewBox="0 0 220 190" aria-hidden="true">{paths[type] || paths.glow}</svg>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [category, setCategory] = useState(() => {
    try { return localStorage.getItem('stargazing.category') || 'Усі'; }
    catch { return 'Усі'; }
  });
  const [form, setForm] = useState(bookingBlank);
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState([]);
  const [visits, setVisits] = useState(null);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    let active = true;
    request('/api/services').then(({ services }) => { if (active) setServices(services); })
      .catch(e => { if (active) setLoadError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    request('/api/session').then(d => { if (active) setVisits(d.visits); }).catch(() => {});
    request('/api/appointments/mine').then(d => { if (active) setMine(d.appointments); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    try { localStorage.setItem('stargazing.category', category); } catch { /* storage disabled */ }
  }, [category]);

  const categories = useMemo(() => ['Усі', ...new Set(services.map(s => s.category))], [services]);
  const visible = useMemo(() => services.filter(s => category === 'Усі' || s.category === category), [services, category]);
  const setField = (name, value) => { setForm(prev => ({ ...prev, [name]: value })); setFormMessage(null); };
  const selectService = (id) => {
    setField('serviceId', String(id));
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };
  const sendBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormMessage(null);
    try {
      const data = await request('/api/appointments', { method: 'POST', body: JSON.stringify(form) });
      setFormMessage({ type: 'success', text: `${data.message} Номер заявки: ${data.reference}` });
      setForm(bookingBlank);
      const updated = await request('/api/appointments/mine');
      setMine(updated.appointments);
    } catch (err) { setFormMessage({ type: 'error', text: err.message }); }
    finally { setSubmitting(false); }
  };
  const sendQuestion = async (e) => {
    e.preventDefault();
    const text = question.trim();
    if (!text) return;
    setQuestion(''); setChat(prev => [...prev, { from: 'you', text }]); setAsking(true);
    try {
      const data = await request('/api/ai/consult', { method: 'POST', body: JSON.stringify({ question: text }) });
      setChat(prev => [...prev, { from: 'ai', text: data.answer }]);
    } catch (err) { setChat(prev => [...prev, { from: 'error', text: err.message }]); }
    finally { setAsking(false); }
  };

  return <>
    <a className="skip-link" href="#main">Перейти до вмісту</a>
    <div className="topbar">✳ ПРОСТІР, ДЕ ТУРБОТА ПРО СЕБЕ СТАЄ РИТУАЛОМ ✳</div>
    <header className="site-header" id="top"><div className="container nav-wrap">
      <a href="#top" className="brand" aria-label="Stargazing — головна"><span className="brand-symbol">✳</span><span>star<span className="brand-light">gazing</span><small>SKIN & BEAUTY CLINIC</small></span></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-menu" aria-label="Відкрити меню" onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-menu" aria-label="Навігація" onClick={() => setMenuOpen(false)}>
        <a href="#about">Про нас</a><a href="#services">Послуги</a><a href="#approach">Підхід</a><a href="#assistant">AI-помічник</a><a href="#booking" className="nav-cta">Записатися ↗</a>
      </nav></div></header>
    <main id="main">
      <section className="hero"><div className="container hero-grid">
        <div className="hero-content"><p className="eyebrow"><span className="eyebrow-line"/> ЕСТЕТИЧНА КОСМЕТОЛОГІЯ</p>
          <h1>Твоя краса —<br/> у <em>турботі</em><br/> про себе<span className="title-dot">.</span></h1>
          <p className="hero-description">Знайомий Stargazing у новому форматі: інтерактивні послуги, демозапис і розумний інформаційний помічник.</p>
          <div className="hero-actions"><a href="#booking" className="btn btn-dark">Обрати процедуру ↗</a><a href="#services" className="text-link">Переглянути каталог ↗</a></div>
          <div className="hero-note"><span className="tiny-flower">✻</span><span>Soft skin. Slow beauty. Self love.</span></div>
        </div>
        <div className="hero-visual"><div className="hero-halo"/><div className="hero-image-frame"><img className="hero-photo" src="/assets/hero-art.svg" alt="Ілюстрація догляду за шкірою"/></div><div className="floating-seal"><span>GLOW<br/>WITH<br/>CARE</span><span className="seal-star">✧</span></div><div className="floating-caption">✷ твій момент спокою ↗</div></div>
      </div><div className="container hero-bottom"><span>STARGAZING / ЛАБОРАТОРНІ 2–6</span><span>РОЗРОБЛЕНО З REACT + EXPRESS ↘</span></div></section>

      <section className="values"><div className="container values-grid"><div>✳ ДЕЛІКАТНИЙ ДОГЛЯД</div><div>✳ ІНДИВІДУАЛЬНИЙ ПІДХІД</div><div>✳ ДИНАМІЧНИЙ КАТАЛОГ</div><div>✳ ЗРУЧНИЙ ЗАПИС</div></div></section>
      <section className="section services-section" id="services"><div className="container">
        <div className="section-heading heading-split"><div><p className="eyebrow dark-eyebrow">✳ ДАНІ З POSTGRESQL</p><h2>Твої ритуали <em>турботи</em></h2></div><p>Каталог завантажується з REST API. Обери категорію — React оновить картки без перезавантаження сторінки.</p></div>
        <div className="category-filter" role="group" aria-label="Фільтр послуг">{categories.map(c => <button type="button" key={c} className={category === c ? 'category-btn active' : 'category-btn'} onClick={() => setCategory(c)} aria-pressed={category === c}>{c}</button>)}</div>
        {loading ? <p className="feedback">Завантаження послуг із бази даних…</p> : loadError ? <p role="alert" className="feedback error">Не вдалося отримати дані із сервера: {loadError}. Перевір PostgreSQL та Express.</p> :
          <div className="services-grid">{visible.map((s, i) => <article className={`service-card service-${['one','two','three','four'][i % 4]}`} key={s.id}>
            <div className="service-art"><span className="art-number">{String(i + 1).padStart(2, '0')}</span><ServiceIllustration type={s.image_key}/><span className="art-decoration">✧</span></div>
            <div className="service-info"><div className="service-topline"><span>{s.category.toUpperCase()} · {s.duration_min} ХВ</span><span>{s.price_uah.toLocaleString('uk-UA')} ₴</span></div><h3>{s.title}</h3><p>{s.description}</p><button className="service-action" type="button" onClick={() => selectService(s.id)}>Обрати процедуру ↗</button></div>
          </article>)}</div>}
        <p className="price-note">* Послуги, ціни та заявки — виключно навчальні. Це не реальна клініка.</p>
      </div></section>

      <section className="section about-section" id="about"><div className="container about-grid"><div className="about-visual"><div className="about-art-frame"><img src="/assets/clinic-art.svg" alt="Атмосферна ілюстрація інтер'єру клініки"/></div><span className="about-side-word">feel good in your skin</span><div className="about-sticker">YOUR SKIN<br/>YOUR STORY <span>✳</span></div></div>
        <div className="about-content"><p className="eyebrow dark-eyebrow">✳ ЗНАЙОМСЯ, STARGAZING</p><h2>Краса без поспіху.<br/><em>Турбота без компромісів.</em></h2><p className="about-lead">Це продовження нашої першої лабораторної — тепер сайт працює як повноцінний вебзастосунок.</p><p>React відображає каталог, Express обробляє запити, PostgreSQL зберігає записи, а API з’єднує всі частини системи.</p><div className="about-quote"><span>“</span><p>Найкраща практика — коли кожна технологія має зрозумілу задачу.</p></div></div>
      </div></section>
      <section className="section steps-section" id="approach"><div className="container"><div className="steps-head"><p className="eyebrow dark-eyebrow">✳ ЯК ЦЕ ПРАЦЮЄ</p><h2>Три кроки до <em>твого glow</em></h2><p>Без справжніх медичних даних — лише навчальні приклади.</p></div><div className="steps-grid">
        <div className="step"><span className="step-count">01 ↗</span><div className="step-line"/><h3>Обери послугу</h3><p>Каталог надходить з PostgreSQL через API, а React керує фільтрами.</p></div>
        <div className="step"><span className="step-count">02 ↗</span><div className="step-line"/><h3>Заповни форму</h3><p>Express перевіряє введені значення і створює демонстраційну заявку.</p></div>
        <div className="step"><span className="step-count">03 ✳</span><div className="step-line"/><h3>Перевір результат</h3><p>Демо-заявка з’являється в списку поточної сесії браузера.</p></div>
      </div></div></section>
      <section className="quote-banner"><div className="container"><p>YOU DESERVE TO <em>FEEL BEAUTIFUL</em> IN YOUR OWN SKIN.</p><span>✳</span></div></section>

      <section className="section booking-section" id="booking"><div className="container booking-grid">
        <div className="booking-text"><p className="eyebrow">✳ ДЕМОНСТРАЦІЙНИЙ ЗАПИС</p><h2>Зроби перший<br/>крок до <em>свого glow.</em></h2><p>Форма відправляє дані на Node.js/Express і зберігає тестову заявку в PostgreSQL. Використовуй лише вигадані контактні дані.</p>
          <p className="visit-counter">Відкриттів сесії: {visits ?? '—'} · HttpOnly-cookie зберігає ідентифікатор сесії.</p>
          {mine.length > 0 && <div className="my-appointments"><h3>Заявки цієї сесії</h3>{mine.map(a => <p key={a.reference}><strong>{a.reference}</strong> · {a.service} · {a.date} о {a.time} · {a.status}</p>)}</div>}
        </div>
        <div className="booking-card"><p className="form-tag">STARGAZING / REACT FORM</p><h3>Запис на процедуру <span>✧</span></h3>
          <form onSubmit={sendBooking}>
            <div className="form-field"><label htmlFor="client-name">Ім’я *</label><input id="client-name" required minLength={2} maxLength={80} placeholder="Вигадане ім’я" value={form.name} onChange={e => setField('name', e.target.value)}/></div>
            <div className="form-field"><label htmlFor="client-phone">Телефон *</label><input id="client-phone" required type="tel" placeholder="+380 67 123 45 67 (демо)" value={form.phone} onChange={e => setField('phone', e.target.value)}/></div>
            <div className="form-field"><label htmlFor="client-service">Послуга *</label><select id="client-service" required value={form.serviceId} onChange={e => setField('serviceId', e.target.value)}><option value="">Обери послугу</option>{services.map(s => <option key={s.id} value={s.id}>{s.title} — {s.price_uah} ₴</option>)}</select></div>
            <div className="form-row"><div className="form-field"><label htmlFor="client-date">Дата *</label><input id="client-date" type="date" min={todayLocal()} required value={form.date} onChange={e => setField('date', e.target.value)}/></div>
              <div className="form-field"><label htmlFor="client-time">Час *</label><input id="client-time" type="time" min="09:00" max="19:00" required value={form.time} onChange={e => setField('time', e.target.value)}/></div></div>
            <div className="form-field"><label htmlFor="client-comment">Коментар (необов’язково)</label><textarea id="client-comment" rows="3" maxLength={500} placeholder="Без особистих або медичних відомостей" value={form.comment} onChange={e => setField('comment', e.target.value)}/></div>
            <button className="btn btn-dark btn-submit" disabled={submitting || loading || !!loadError} type="submit">{submitting ? 'Збереження…' : 'Створити демо-заявку ↗'}</button>
            <p className="form-legal">Для лабораторної: лише тестові дані, без підтвердження реального прийому.</p>
            {formMessage && <div className={`form-status ${formMessage.type}`} role="status" aria-live="polite">{formMessage.text}</div>}
          </form>
        </div>
      </div></section>

      <section className="section assistant-section" id="assistant"><div className="container assistant-grid"><div><p className="eyebrow dark-eyebrow">✳ AI-ІНТЕГРАЦІЯ / ЛАБ №6</p><h2>Запитай свого <em>beauty-помічника</em></h2><p>Питання надсилається на наш Express-сервер, а він звертається до OpenAI API. Секретний ключ не потрапляє до браузера.</p><p className="ai-note">AI дає лише загальну інформацію, не діагноз і не індивідуальні призначення. Не надсилай особисту або медичну інформацію.</p>
        </div><div className="assistant-card"><div className="assistant-head"><span>✳ STARGAZING AI</span><span>інформаційний помічник</span></div><div className="chat-window" role="log" aria-live="polite">
          {chat.length === 0 && <p className="chat-intro">Привіт! Спробуй запитати «Для чого потрібен SPF?» або «Які процедури є в каталозі?»</p>}
          {chat.map((m, i) => <div key={i} className={`bubble ${m.from}`}>{m.text}</div>)}
          {asking && <p className="chat-intro">Отримую відповідь…</p>}
        </div><form className="chat-form" onSubmit={sendQuestion}><label className="sr-only" htmlFor="ai-question">Питання до AI</label><input id="ai-question" maxLength={500} minLength={3} required placeholder="Напиши своє питання…" value={question} onChange={e => setQuestion(e.target.value)}/><button disabled={asking} type="submit" aria-label="Надіслати">↗</button></form></div></div></section>
    </main>
    <footer className="footer"><div className="container footer-main"><div><div className="brand footer-brand">✳ stargazing</div><p>Турбота починається з тебе.</p></div><div className="footer-links"><a href="#services">Послуги</a><a href="#booking">Запис</a><a href="#assistant">AI</a><a href="/openapi.yaml" target="_blank" rel="noreferrer">OpenAPI</a></div></div><div className="container footer-bottom"><span>© {year} STARGAZING / Навчальний проєкт — НЕ реальна клініка</span><span>LABS 2–6 · REACT · EXPRESS · POSTGRESQL</span></div></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
