import { submitFormSubmission } from '@data/repository/formSubmission';

const request = { form: 'fixture-contact-form', submissionData: [{ field: 'name', value: 'Ana' }] };

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('submissions never reach the network in the default configuration', async () => {
  const fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  await expect(submitFormSubmission(request)).resolves.toBeUndefined();
  expect(fetchMock).not.toHaveBeenCalled();
});

describe('with live submissions enabled', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('@core/transport/config', () => ({
      API_BASE_URL: 'https://payload-cms-poc-seven.vercel.app',
      ENABLE_LIVE_FORM_SUBMISSIONS: true,
    }));
  });

  afterEach(() => {
    jest.dontMock('@core/transport/config');
  });

  test('a 201 response resolves', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ status: 201 }) as unknown as typeof fetch;

    const { submitFormSubmission: liveSubmit } = require('@data/repository/formSubmission');
    await expect(liveSubmit(request)).resolves.toBeUndefined();
  });

  test('a non-201 response maps to a user-safe message', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ status: 500 }) as unknown as typeof fetch;

    const { submitFormSubmission: liveSubmit } = require('@data/repository/formSubmission');
    await expect(liveSubmit(request)).rejects.toMatchObject({ kind: 'http' });
  });

  test('a network failure maps to a user-safe message', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { submitFormSubmission: liveSubmit } = require('@data/repository/formSubmission');
    await expect(liveSubmit(request)).rejects.toMatchObject({ kind: 'network' });
  });
});
