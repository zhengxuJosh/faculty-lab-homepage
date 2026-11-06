const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../availability.js');
const schedule = globalThis.XLabAvailability;

test('term boundaries and weekly dates use Beijing calendar dates', () => {
  assert.deepEqual(schedule.busyOn('2026-11-02'), []);
  assert.equal(schedule.busyOn('2026-11-09')[0].start, '17:45');
  assert.equal(schedule.busyOn('2026-11-11')[0].end, '12:15');
  assert.deepEqual(schedule.busyOn('2026-11-10'), []);
  assert.equal(schedule.busyOn('2026-12-28').length, 1);
  assert.equal(schedule.busyOn('2026-12-30').length, 1);
  assert.deepEqual(schedule.busyOn('2027-01-01'), []);
  assert.deepEqual(schedule.busyOn('2027-01-04'), []);
  let total = 0;
  for (let day = Date.parse('2026-11-01T00:00:00Z'); day <= Date.parse('2027-01-08T00:00:00Z'); day += 86400000) {
    total += schedule.busyOn(new Date(day).toISOString().slice(0, 10)).length;
  }
  assert.equal(total, 16);
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
