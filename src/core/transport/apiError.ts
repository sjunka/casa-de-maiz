export type ApiErrorKind = 'network' | 'http' | 'parse' | 'unsupported-contract' | 'not-found';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly userMessage: string;

  constructor(kind: ApiErrorKind, userMessage: string, technicalDetail: string) {
    super(technicalDetail);
    this.kind = kind;
    this.userMessage = userMessage;
  }
}

const NETWORK_MESSAGE =
  "Can't reach Casa Maiz right now. Check your connection and try again.";
const LOAD_FAILED_MESSAGE = 'Something went wrong loading this. Please try again.';
const NOT_FOUND_MESSAGE = "We couldn't find this page.";
const UNSUPPORTED_CONTRACT_MESSAGE =
  'This app needs to be updated to keep working. Please update Casa Maiz.';

export const networkError = (path: string, cause: unknown): ApiError =>
  new ApiError('network', NETWORK_MESSAGE, `network error calling ${path}: ${String(cause)}`);

export const httpError = (path: string, status: number): ApiError =>
  new ApiError('http', LOAD_FAILED_MESSAGE, `${path} responded with status ${status}`);

export const notFoundError = (path: string): ApiError =>
  new ApiError('not-found', NOT_FOUND_MESSAGE, `${path} responded with status 404`);

export const parseError = (path: string, reason: string): ApiError =>
  new ApiError('parse', LOAD_FAILED_MESSAGE, `response from ${path} failed validation: ${reason}`);

export const unsupportedContractError = (path: string, contractVersion: string): ApiError =>
  new ApiError(
    'unsupported-contract',
    UNSUPPORTED_CONTRACT_MESSAGE,
    `unsupported contract version ${contractVersion} from ${path}`,
  );
