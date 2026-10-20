import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('both dynamic service templates use the common service graph', () => {
  for (const page of ['components/CityServiceView.tsx', 'components/CarServiceView.tsx']) {
    const source = readFileSync(page, 'utf8');
    assert.match(source, /generateServicePageSchema\(/);
    assert.doesNotMatch(source, /siteName \|\| ["']أوتو كراج["']/);
  }
});

test('shared graph identifies the service and page separately', () => {
  const source = readFileSync('lib/service-page-schema.ts', 'utf8');
  assert.match(source, /'@type': 'Service'/);
  assert.match(source, /'@type': 'WebPage'/);
  assert.match(source, /'@id': serviceId/);
  assert.match(source, /'@id': pageId/);
  assert.match(source, /areaServed/);
  assert.doesNotMatch(source, /AutoRepair/);
});
