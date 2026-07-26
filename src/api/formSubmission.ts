import { API_BASE_URL, ENABLE_LIVE_FORM_SUBMISSIONS } from '@core/transport/config';
import { ApiError, httpError, networkError } from '@core/transport/apiError';

export type FormSubmissionRequest = {
  form: string | number;
  submissionData: { field: string; value: string }[];
};

const FORM_SUBMISSIONS_PATH = '/api/form-submissions';

// ponytail: no real submission-service backing this, resolves like the documented 201 response.
const mockSubmitForm = async (_request: FormSubmissionRequest): Promise<void> => {};

export const submitFormSubmission = async (request: FormSubmissionRequest): Promise<void> => {
  if (!ENABLE_LIVE_FORM_SUBMISSIONS) {
    return mockSubmitForm(request);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${FORM_SUBMISSIONS_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (cause) {
    const error = networkError(FORM_SUBMISSIONS_PATH, cause);
    console.error(`[api] ${error.kind}: ${error.message}`);
    throw error;
  }

  if (response.status === 201) {
    return;
  }

  const error = httpError(FORM_SUBMISSIONS_PATH, response.status);
  console.error(`[api] ${error.kind}: ${error.message}`);
  throw error;
};

export type { ApiError };
