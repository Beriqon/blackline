import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookingDateTime} from '../lib/booking-time.ts';
test('Miami selections use the visitor timezone rather than the server timezone',()=>{assert.equal(bookingDateTime('2026-11-10','10:00','America/New_York')?.toISOString(),'2026-11-10T15:00:00.000Z');assert.equal(bookingDateTime('2026-07-10','10:00','America/New_York')?.toISOString(),'2026-07-10T14:00:00.000Z');});
test('invalid dates, timezone names and skipped daylight-saving hours are rejected',()=>{assert.equal(bookingDateTime('2026-02-30','10:00','UTC'),null);assert.equal(bookingDateTime('2026-11-10','25:00','UTC'),null);assert.equal(bookingDateTime('2026-11-10','10:00','invalid'),null);assert.equal(bookingDateTime('2026-03-08','02:30','America/New_York'),null);});
