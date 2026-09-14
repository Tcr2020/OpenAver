// TASK-147b-T3: CD-147b-5 四項判準 — didEnrichSomething(event)
// ③④ 是本條 CD 的鑑別力：同樣 success=true、兩個布林都 false，只差 fields_filled。
// ⑥ 鎖 extrafanart_written（掃描頁不送 write_extrafanart ⇒ 前端恆 0，形狀對齊後端）。

import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
window.t = (key) => key;

const { didEnrichSomething } = await import('../state-batch.js');

test('success=true, nfo_written=true counts as success', () => {
  assert.equal(
    didEnrichSomething({ success: true, nfo_written: true, cover_written: false, fields_filled: [] }),
    true,
  );
});

test('success=true, cover_written=true counts as success', () => {
  assert.equal(
    didEnrichSomething({ success: true, nfo_written: false, cover_written: true, fields_filled: [] }),
    true,
  );
});

test('fields_filled only (maker backfilled, no nfo/cover write) counts as success', () => {
  assert.equal(
    didEnrichSomething({
      success: true,
      nfo_written: false,
      cover_written: false,
      fields_filled: ['maker'],
    }),
    true,
  );
});

test('success=true but nothing written and empty fields_filled counts as failure', () => {
  assert.equal(
    didEnrichSomething({
      success: true,
      nfo_written: false,
      cover_written: false,
      fields_filled: [],
    }),
    false,
  );
});

test('success=false counts as failure regardless of other fields', () => {
  assert.equal(
    didEnrichSomething({
      success: false,
      nfo_written: true,
      cover_written: true,
      fields_filled: ['maker'],
    }),
    false,
  );
});

test('extrafanart_written only counts as success', () => {
  assert.equal(
    didEnrichSomething({
      success: true,
      nfo_written: false,
      cover_written: false,
      fields_filled: [],
      extrafanart_written: 1,
    }),
    true,
  );
});
