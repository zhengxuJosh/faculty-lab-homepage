const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../availability.js');
const schedule = globalThis.XLabAvailability;

test('term boundaries and weekly dates use Beijing calendar dates', () => {
  assert.deepEqual(schedule.busyOn('2026-11-02'), []);
  assert.equal(schedule.busyOn('2026-11-09')[0].start, '17:45');
  assert.equal(schedule.busyOn('2026-11-11')[0].end, '12:15');
  assert.deepEqual(schedule.busyOn('2026-11-13'), []);
  assert.equal(schedule.busyOn('2026-12-28').length, 1);
  assert.equal(schedule.busyOn('2026-12-30').length, 1);
  assert.deepEqual(schedule.busyOn('2027-01-01'), []);
  assert.deepEqual(schedule.busyOn('2027-01-04'), []);
  let total = 0;
  for (let day = Date.parse('2026-11-01T00:00:00Z'); day <= Date.parse('2027-01-08T00:00:00Z'); day += 86400000) {
    total += schedule.busyOn(new Date(day).toISOString().slice(0, 10)).length;
  }
  assert.equal(total, 19);
});

test('one-off meetings block only their dates, including the full requested duration', () => {
  assert.equal(schedule.busyOn('2026-11-10')[0].end, '17:00');
  assert.equal(schedule.busyOn('2026-11-12')[0].end, '17:30');
  for (const [date, end] of [['2026-11-10', '17:00'], ['2026-11-12', '17:30']]) {
    for (const duration of [20, 30]) {
      assert.equal(schedule.canRequest(date, duration === 20 ? '15:40' : '15:30', duration), true);
      assert.equal(schedule.canRequest(date, '15:50', duration), false);
      assert.equal(schedule.canRequest(date, '16:00', duration), false);
      assert.equal(schedule.canRequest(date, '16:59', duration), false);
      assert.equal(schedule.canRequest(date, end, duration), true);
    }
  }
  assert.equal(schedule.canRequest('2026-11-12', '17:29', 20), false);
  for (const date of ['2026-11-03', '2026-11-05', '2026-11-17', '2026-11-19']) {
    assert.deepEqual(schedule.busyOn(date), []);
    assert.equal(schedule.canRequest(date, '16:00', 30), true);
  }
});

test('Sunday guidance blocks its exact date even before weekly teaching begins', () => {
  assert.equal(schedule.busyOn('2026-11-08')[0].start, '22:00');
  assert.equal(schedule.busyOn('2026-11-08')[0].end, '23:00');
  for (const duration of [20, 30]) {
    assert.equal(schedule.canRequest('2026-11-08', duration === 20 ? '21:40' : '21:30', duration), true);
    assert.equal(schedule.canRequest('2026-11-08', '21:50', duration), false);
    assert.equal(schedule.canRequest('2026-11-08', '22:00', duration), false);
    assert.equal(schedule.canRequest('2026-11-08', '22:59', duration), false);
    assert.equal(schedule.canRequest('2026-11-08', '23:00', duration), true);
    assert.equal(schedule.canRequest('2026-11-15', '22:00', duration), true);
  }
  assert.deepEqual(schedule.busyOn('2026-11-15'), []);
});

test('whole meeting must fit, with adjacent meetings allowed', () => {
  for (const duration of [20, 30]) {
    const beforeMonday = duration === 20 ? '17:25' : '17:15';
    assert.equal(schedule.canRequest('2026-11-09', beforeMonday, duration), true);
    assert.equal(schedule.canRequest('2026-11-09', '17:30', duration), false);
    assert.equal(schedule.canRequest('2026-11-09', '17:45', duration), false);
    assert.equal(schedule.canRequest('2026-11-09', '20:59', duration), false);
    assert.equal(schedule.canRequest('2026-11-09', '21:00', duration), true);
    assert.equal(schedule.canRequest('2026-11-11', duration === 20 ? '09:10' : '09:00', duration), true);
    assert.equal(schedule.canRequest('2026-11-11', '09:11', duration), false);
    assert.equal(schedule.canRequest('2026-11-11', '12:14', duration), false);
    assert.equal(schedule.canRequest('2026-11-11', '12:15', duration), true);
  }
  assert.equal(schedule.canRequest('2026-11-09', '17:25', 20), true);
  assert.equal(schedule.canRequest('2026-11-09', '17:25', 30), false);
  assert.equal(schedule.canRequest('2026-11-10', '18:00', 30), true);
  assert.equal(schedule.canRequest('2027-01-04', '18:00', 30), true);
});

test('invalid times and meetings crossing midnight are rejected', () => {
  for (const time of ['', 'invalid', '24:00', '17:60', '23:50']) {
    assert.equal(schedule.canRequest('2026-11-10', time, 20), false);
  }
  assert.equal(schedule.canRequest('2026-11-10', '23:40', 20), true);
});
