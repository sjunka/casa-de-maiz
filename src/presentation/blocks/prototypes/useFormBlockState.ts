import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { submitFormSubmission } from '@data/remote/formSubmission';
import { ApiError } from '@core/transport/apiError';
import type { FormBlock as FormBlockData, FormField } from '@core/contract/models/block';

const SUPPORTED_FIELD_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select'];
const SUBMIT_ERROR_MESSAGE = "Couldn't submit this. Please try again.";
const REQUIRED_MESSAGE = 'This field is required.';

export type FormBlockStatus = 'idle' | 'submitting' | 'success' | 'error';

// PROTOTYPE — shared submit/validation behaviour for the three visual
// variants in this folder, lifted verbatim from the real FormBlock so the
// variants only have to differ in layout, not in what "submit" means.
export const useFormBlockState = (block: FormBlockData) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormBlockStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fields = block.form.fields.filter((field): field is FormField =>
    SUPPORTED_FIELD_TYPES.includes(field.blockType),
  );

  const setValue = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (!field.required) continue;
      const value = values[field.name];
      if (field.blockType === 'checkbox' ? value !== 'true' : !value?.trim()) {
        nextErrors[field.name] = REQUIRED_MESSAGE;
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      AccessibilityInfo.announceForAccessibility(REQUIRED_MESSAGE);
      return;
    }

    setStatus('submitting');
    setSubmitError(null);
    try {
      await submitFormSubmission({
        form: block.form.id,
        submissionData: fields.map(field => ({ field: field.name, value: values[field.name] ?? '' })),
      });
      setStatus('success');
      AccessibilityInfo.announceForAccessibility(
        block.form.confirmationMessage ?? 'Thanks! We received your submission.',
      );
    } catch (error) {
      const message = error instanceof ApiError ? error.userMessage : SUBMIT_ERROR_MESSAGE;
      setStatus('error');
      setSubmitError(message);
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  return { fields, values, errors, status, submitError, setValue, handleSubmit };
};
