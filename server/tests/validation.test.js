import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAppointment, validateAiQuestion } from '../src/validation.js';
const today = '2026-11-12';
const valid = { name: 'Наталія', phone: '+380 67 123 45 67', serviceId: 1,
  date: '2026-12-12', time: '12:30', comment: 'Навчальний приклад' };

test('коректна заявка проходить валідацію', () => assert.equal(validateAppointment(valid, today).valid, true));
test('неправильний телефон блокується', () => assert.ok(validateAppointment({ ...valid, phone: '123' }, today).errors.phone));
test('дата в минулому блокується', () => assert.ok(validateAppointment({ ...valid, date: '2026-10-01' }, today).errors.date));
test('неіснуюча дата блокується', () => assert.ok(validateAppointment({ ...valid, date: '2026-02-30' }, today).errors.date));
test('час поза графіком блокується', () => assert.ok(validateAppointment({ ...valid, time: '22:00' }, today).errors.time));
test('відсутня послуга блокується', () => assert.ok(validateAppointment({ ...valid, serviceId: '' }, today).errors.serviceId));
test('занадто довге питання AI блокується', () => assert.equal(validateAiQuestion({ question: 'x'.repeat(501) }).valid, false));
test('звичайне питання AI приймається', () => assert.equal(validateAiQuestion({ question: 'Що таке SPF?' }).valid, true));
