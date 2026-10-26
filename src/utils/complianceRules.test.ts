import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEstimatedServings,
  calculateCo2AvoidedKg,
  calculateWaterSavedLitres,
  checkTemperatureSafety,
  getExpiryUrgency,
  verifyRegulatoryCompliance,
} from './complianceRules';

test('calculateEstimatedServings yields correct meal portions', () => {
  // Cooked meals: 350g per serving -> 35kg should equal 100 servings
  assert.equal(calculateEstimatedServings('cooked_hot', 35), 100);
  assert.equal(calculateEstimatedServings('cooked_cold', 14), 40);
  // Bakery: 150g -> 15kg should equal 100 servings
  assert.equal(calculateEstimatedServings('bakery', 15), 100);
  // Zero handling
  assert.equal(calculateEstimatedServings('cooked_hot', 0), 0);
});

test('calculateCo2AvoidedKg and water saved matches scientific factor', () => {
  assert.equal(calculateCo2AvoidedKg(10), 25.0);
  assert.equal(calculateWaterSavedLitres(10), 10500);
});

test('checkTemperatureSafety verifies hot and cold food thresholds', () => {
  // Hot food >= 60C is optimal
  const hotOptimal = checkTemperatureSafety('cooked_hot', 65);
  assert.equal(hotOptimal.safe, true);
  assert.equal(hotOptimal.status, 'optimal');

  // Hot food 55-59.9C is warning
  const hotWarning = checkTemperatureSafety('cooked_hot', 57);
  assert.equal(hotWarning.safe, true);
  assert.equal(hotWarning.status, 'warning');

  // Hot food below 55C is critical danger zone
  const hotCritical = checkTemperatureSafety('cooked_hot', 48);
  assert.equal(hotCritical.safe, false);
  assert.equal(hotCritical.status, 'critical');

  // Chilled food <= 4C is optimal
  const coldOptimal = checkTemperatureSafety('cooked_cold', 3.2);
  assert.equal(coldOptimal.safe, true);
  assert.equal(coldOptimal.status, 'optimal');

  // Chilled food > 7C is critical
  const coldCritical = checkTemperatureSafety('cooked_cold', 9.5);
  assert.equal(coldCritical.safe, false);
  assert.equal(coldCritical.status, 'critical');
});

test('getExpiryUrgency accurately flags urgent countdown windows', () => {
  const ref = '2026-10-26T12:00:00Z';
  
  // 1 hour left -> urgent
  const urgent = getExpiryUrgency('2026-10-26T13:00:00Z', ref);
  assert.equal(urgent.urgency, 'urgent');
  assert.equal(urgent.minutesRemaining, 60);

  // 4 hours left -> moderate
  const moderate = getExpiryUrgency('2026-10-26T16:00:00Z', ref);
  assert.equal(moderate.urgency, 'moderate');

  // Already past -> expired
  const expired = getExpiryUrgency('2026-10-26T11:00:00Z', ref);
  assert.equal(expired.urgency, 'expired');
});

test('verifyRegulatoryCompliance approves intact items and rejects breached items', () => {
  const valid = verifyRegulatoryCompliance({
    visualCheckPassed: true,
    odorCheckPassed: true,
    packagingSealed: true,
    measuredTempCelsius: 64,
    category: 'cooked_hot',
  });
  assert.equal(valid.approved, true);
  assert.equal(valid.violations.length, 0);
  assert.match(valid.complianceCode, /^CERT-SAFE-/);

  const breached = verifyRegulatoryCompliance({
    visualCheckPassed: true,
    odorCheckPassed: false, // failed smell check
    packagingSealed: true,
    measuredTempCelsius: 40, // dangerous temp for hot food
    category: 'cooked_hot',
  });
  assert.equal(breached.approved, false);
  assert.equal(breached.violations.length, 2);
  assert.match(breached.complianceCode, /^FLAG-REJECT-/);
});
