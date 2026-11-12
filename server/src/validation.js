export function dateInKyiv() {
  // Формат YYYY-MM-DD незалежно від налаштувань системи.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

export function validateAppointment(payload, today = dateInKyiv()) {
  const errors = {};
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return { valid: false, errors: { form: 'Очікується об’єкт JSON.' } };
  }
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const date = typeof payload.date === 'string' ? payload.date : '';
  const time = typeof payload.time === 'string' ? payload.time : '';
  const comment = typeof payload.comment === 'string' ? payload.comment.trim() : '';
  const serviceId = Number(payload.serviceId);
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M}'’\- .]+$/u.test(name)) {
    errors.name = 'Ім’я: 2–80 символів, тільки літери та пробіли.';
  }
  if (!/^\+?[0-9 ()-]{9,20}$/.test(phone) || phone.replace(/\D/g, '').length < 9) {
    errors.phone = 'Вкажи коректний телефон (мінімум 9 цифр).';
  }
  if (!Number.isSafeInteger(serviceId) || serviceId < 1) {
    errors.serviceId = 'Обери послугу зі списку.';
  }
  const plausible = /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) &&
    new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
  if (!plausible || date < today) {
    errors.date = 'Обери дійсну дату: сьогодні або пізніше.';
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || time < '09:00' || time > '19:00') {
    errors.time = 'Час має бути між 09:00 та 19:00.';
  }
  if (comment.length > 500) errors.comment = 'Коментар не більше 500 символів.';
  return { valid: Object.keys(errors).length === 0, errors,
    value: { name, phone, date, time, comment, serviceId } };
}

export function validateAiQuestion(payload) {
  const question = typeof payload?.question === 'string' ? payload.question.trim() : '';
  if (question.length < 3 || question.length > 500) {
    return { valid: false, error: 'Питання має містити від 3 до 500 символів.' };
  }
  return { valid: true, question };
}
