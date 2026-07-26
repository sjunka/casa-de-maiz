import { useCallback, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { submitFormSubmission } from '../api/formSubmission';
import { ApiError } from '../api/apiError';
import { AppPressable } from '../ui/AppPressable';
import type { FormBlock as FormBlockData, FormField } from '../models/block';

type Props = { block: FormBlockData };

const SUPPORTED_FIELD_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select'];

const SUBMIT_ERROR_MESSAGE = "Couldn't submit this. Please try again.";
const REQUIRED_MESSAGE = 'This field is required.';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export const FormBlock = ({ block }: Props) => {
  const { colors } = useTheme();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
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

  const validate = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (!field.required) continue;
      const value = values[field.name];
      if (field.blockType === 'checkbox' ? value !== 'true' : !value?.trim()) {
        nextErrors[field.name] = REQUIRED_MESSAGE;
      }
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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

  const renderField: ListRenderItem<FormField> = useCallback(
    ({ item: field }) => (
      <FormFieldInput
        field={field}
        value={values[field.name]}
        error={errors[field.name]}
        onChange={value => setValue(field.name, value)}
      />
    ),
    [values, errors],
  );

  if (status === 'success') {
    return (
      <View style={styles.container} testID="form-block-success">
        <Text style={[styles.confirmation, { color: colors.text }]}>
          {block.form.confirmationMessage ?? 'Thanks! We received your submission.'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        testID="form-block"
        contentContainerStyle={styles.container}
        data={fields}
        keyExtractor={field => field.name}
        // A form has a handful of CMS-defined fields, not a data feed — every
        // row stays mounted so a guest never loses focus/keystrokes mid-fill.
        initialNumToRender={fields.length}
        renderItem={renderField}
        ListFooterComponent={
          <>
            {submitError ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.submitError, { color: colors.errorText }]}
                testID="form-block-submit-error"
              >
                {submitError}
              </Text>
            ) : null}
            <AppPressable
              accessibilityRole="button"
              accessibilityLabel={block.form.submitButtonLabel ?? 'Submit'}
              accessibilityState={{ disabled: status === 'submitting' }}
              disabled={status === 'submitting'}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                { backgroundColor: colors.accent },
                status === 'submitting' && styles.submitButtonDisabled,
              ]}
              testID="form-block-submit"
            >
              {status === 'submitting' ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text style={[styles.submitLabel, { color: colors.onAccent }]}>
                  {block.form.submitButtonLabel ?? 'Submit'}
                </Text>
              )}
            </AppPressable>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
};

type FieldProps = {
  field: FormField;
  value: string | undefined;
  error: string | undefined;
  onChange: (value: string) => void;
};

const FormFieldInput = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {field.blockType === 'checkbox' ? (
        <View style={styles.checkboxHitArea}>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: value === 'true' }}
            value={value === 'true'}
            onValueChange={next => onChange(next ? 'true' : 'false')}
          />
        </View>
      ) : field.blockType === 'select' ? (
        <View style={styles.options}>
          {(field.options ?? []).map(option => (
            <AppPressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: value === option.value }}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                { borderColor: colors.border },
                value === option.value && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <Text style={{ color: value === option.value ? colors.onAccent : colors.text }}>
                {option.label}
              </Text>
            </AppPressable>
          ))}
        </View>
      ) : (
        <TextInput
          testID={`form-field-${field.name}`}
          accessibilityLabel={label}
          value={value ?? ''}
          onChangeText={onChange}
          multiline={field.blockType === 'textarea'}
          keyboardType={field.blockType === 'email' ? 'email-address' : 'default'}
          autoCapitalize={field.blockType === 'email' ? 'none' : 'sentences'}
          style={[
            styles.input,
            field.blockType === 'textarea' && styles.textarea,
            { color: colors.text, borderColor: error ? colors.errorText : colors.border },
          ]}
        />
      )}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.fieldError, { color: colors.errorText }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  textarea: { minHeight: 88, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkboxHitArea: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-start' },
  option: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderRadius: 8 },
  fieldError: { marginTop: 4, fontSize: 13 },
  submitButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 12 },
  submitButtonDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '600' },
  submitError: { marginBottom: 12, fontSize: 14 },
  confirmation: { fontSize: 16, textAlign: 'center' },
});
