import { isContractVersionCompatible } from '@core/contract/models/contractVersion';

const supported = { major: 1, minor: 1 };

test('accepts the same major and minor', () => {
  expect(isContractVersionCompatible('1.1', supported)).toBe(true);
});

test('accepts a greater minor on the same major', () => {
  expect(isContractVersionCompatible('1.2', supported)).toBe(true);
});

test('rejects a lower minor on the same major', () => {
  expect(isContractVersionCompatible('1.0', supported)).toBe(false);
});

test('rejects a different major', () => {
  expect(isContractVersionCompatible('2.0', supported)).toBe(false);
});
