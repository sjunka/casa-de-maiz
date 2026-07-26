import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { FormBlock } from '@presentation/blocks/FormBlock';
import { submitFormSubmission } from '@data/remote/formSubmission';
import { ApiError } from '@core/transport/apiError';
import type { FormBlock as FormBlockData } from '@core/contract/models/block';

jest.mock('@data/remote/formSubmission', () => ({ submitFormSubmission: jest.fn() }));

const submitFormSubmissionMock = submitFormSubmission as jest.Mock;

const block: FormBlockData = {
  blockType: 'formBlock',
  contractVersion: '1.1',
  channels: ['ios', 'android'],
  form: {
    id: 'fixture-contact-form',
    submitButtonLabel: 'Send message',
    confirmationMessage: 'Thanks! We received your message.',
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true },
      { blockType: 'email', name: 'email', label: 'Email', required: false },
      {
        blockType: 'select',
        name: 'topic',
        label: 'Topic',
        required: true,
        options: [
          { label: 'Reservation', value: 'reservation' },
          { label: 'Feedback', value: 'feedback' },
        ],
      },
      { blockType: 'textarea', name: 'message', label: 'Message', required: false },
      { blockType: 'checkbox', name: 'subscribe', label: 'Send me updates', required: false },
      { blockType: 'newsletterOptIn', name: 'unsupported', label: 'Unsupported field', required: false },
    ],
  },
};

beforeEach(() => {
  submitFormSubmissionMock.mockReset();
});

test('renders every supported field type and skips an unrecognised one', async () => {
  await render(<FormBlock block={block} />);

  expect(screen.getByLabelText('Name')).toBeTruthy();
  expect(screen.getByLabelText('Email')).toBeTruthy();
  expect(screen.getByLabelText('Message')).toBeTruthy();
  expect(screen.getByLabelText('Send me updates')).toBeTruthy();
  expect(screen.getByLabelText('Reservation')).toBeTruthy();
  expect(screen.queryByText('Unsupported field')).toBeNull();
});

test('blocks submission and shows an error when a required field is empty', async () => {
  await render(<FormBlock block={block} />);

  // `__DEV__` prefills `name`; clear it back out to exercise validation.
  await fireEvent.changeText(screen.getByLabelText('Name'), '');
  await fireEvent.press(screen.getByLabelText('Send message'));

  // `topic` defaults to its first option (Reservation), so only `name` is
  // left unanswered.
  expect(await screen.findAllByText('This field is required.')).toHaveLength(1);
  expect(submitFormSubmissionMock).not.toHaveBeenCalled();
});

test('a successful submission shows the confirmation message', async () => {
  submitFormSubmissionMock.mockResolvedValue(undefined);
  await render(<FormBlock block={block} />);

  await fireEvent.changeText(screen.getByLabelText('Name'), 'Ana');
  await fireEvent.press(screen.getByLabelText('Reservation'));
  await fireEvent.press(screen.getByLabelText('Send message'));

  await waitFor(() => expect(screen.getByTestId('form-block-success')).toBeTruthy());
  expect(screen.getByText('Thanks! We received your message.')).toBeTruthy();
  expect(submitFormSubmissionMock).toHaveBeenCalledWith({
    form: 'fixture-contact-form',
    submissionData: expect.arrayContaining([{ field: 'name', value: 'Ana' }, { field: 'topic', value: 'reservation' }]),
  });
});

test('closing the confirmation returns to a cleared, idle form', async () => {
  submitFormSubmissionMock.mockResolvedValue(undefined);
  await render(<FormBlock block={block} />);

  await fireEvent.changeText(screen.getByLabelText('Name'), 'Ana');
  await fireEvent.press(screen.getByLabelText('Reservation'));
  await fireEvent.press(screen.getByLabelText('Send message'));
  await waitFor(() => expect(screen.getByTestId('form-block-success')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Close'));

  expect(screen.getByTestId('form-block')).toBeTruthy();
  // `__DEV__` prefill reappears rather than the typed-over 'Ana'.
  expect(screen.getByLabelText('Name').props.value).toBe('Juan Pérez');
});

test('a submission failure shows the error user message and keeps the form on screen', async () => {
  submitFormSubmissionMock.mockRejectedValue(new ApiError('network', 'Check your connection.', 'boom'));
  await render(<FormBlock block={block} />);

  await fireEvent.changeText(screen.getByLabelText('Name'), 'Ana');
  await fireEvent.press(screen.getByLabelText('Reservation'));
  await fireEvent.press(screen.getByLabelText('Send message'));

  await waitFor(() => expect(screen.getByTestId('form-block-submit-error')).toBeTruthy());
  expect(screen.getByText('Check your connection.')).toBeTruthy();
  expect(screen.getByTestId('form-block')).toBeTruthy();
});
