import assert from 'node:assert/strict';
import test from 'node:test';
import { getSiteFeatures, getSiteProfile, isAutomotiveSite } from '../lib/site-profile';

test('automotive remains the backward-compatible default profile', () => {
  assert.equal(getSiteProfile(undefined), 'automotive');
  assert.equal(getSiteProfile(''), 'automotive');
  assert.equal(getSiteProfile('unknown'), 'automotive');
  assert.equal(isAutomotiveSite(getSiteProfile(undefined)), true);
});

test('home services profile disables every automotive feature', () => {
  const profile = getSiteProfile('home_services');
  assert.equal(profile, 'home_services');
  assert.deepEqual(getSiteFeatures(profile), {
    automotive: false,
    cars: false,
    carServiceTemplates: false,
  });
});

test('site profile accepts normalized deployment values', () => {
  assert.equal(getSiteProfile(' HOME-SERVICES '), 'home_services');
  assert.equal(getSiteProfile('AUTOMOTIVE'), 'automotive');
});
