import { useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { GlassSurface } from '../ui/GlassSurface';
import { submitFormSubmission } from '@data/remote/formSubmission';
import { ApiError } from '@core/transport/apiError';
import { AppPressable } from '../ui/AppPressable';
import type { FormBlock as FormBlockData, FormField } from '@core/contract/models/block';

type Props = { block: FormBlockData };

const SUPPORTED_FIELD_TYPES = ['text', 'email', 'textarea', 'checkbox', 'select'];

const SUBMIT_ERROR_MESSAGE = "Couldn't submit this. Please try again.";
const REQUIRED_MESSAGE = 'This field is required.';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Platform look-and-feel decided via mattpocock-skills:prototype (see
// docs/adr/0012-platform-native-presentation.md for the wider pattern):
// iOS gets a raised glass "ticket" card (GlassSurface); Android gets
// outlined M3 fields with a segmented control for `select` and a filled
// pill button — no card, no glass. Both share the same validation/submit
// behaviour below, only the rendered field shapes diverge.
export const FormBlock = ({ block }: Props) => {
  const { colors, scheme } = useTheme();
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

  if (status === 'success') {
    return (
      <View style={styles.container} testID="form-block-success">
        <Text style={[styles.confirmation, { color: colors.text }]}>
          {block.form.confirmationMessage ?? 'Thanks! We received your submission.'}
        </Text>
      </View>
    );
  }

  const submitLabel = block.form.submitButtonLabel ?? 'Submit';

  const submitButton = (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={submitLabel}
      accessibilityState={{ disabled: status === 'submitting' }}
      disabled={status === 'submitting'}
      onPress={handleSubmit}
      rippleColor={colors.onAccent}
      style={[styles.submit, { backgroundColor: colors.accent }, status === 'submitting' && styles.submitDisabled]}
      testID="form-block-submit"
    >
      {status === 'submitting' ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <Text style={[styles.submitLabel, { color: colors.onAccent }]}>{submitLabel}</Text>
      )}
    </AppPressable>
  );

  const submitErrorText = submitError ? (
    <Text accessibilityLiveRegion="polite" style={[styles.submitError, { color: colors.errorText }]} testID="form-block-submit-error">
      {submitError}
    </Text>
  ) : null;

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
        <ScrollView style={styles.fill} contentContainerStyle={styles.iosPage} testID="form-block">
          <View style={styles.iosCard}>
            <GlassSurface
              style={styles.iosCardFill}
              blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'}
              fallbackColor={colors.surfaceElevated}
            />
            <View style={styles.iosCardContent}>
              {fields.map(field => (
                <TicketField
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  error={errors[field.name]}
                  onChange={v => setValue(field.name, v)}
                />
              ))}
              {submitErrorText}
              {submitButton}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.fill} contentContainerStyle={styles.androidPage} testID="form-block">
      {fields.map(field => (
        <OutlinedField
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={v => setValue(field.name, v)}
        />
      ))}
      {submitErrorText}
      {submitButton}
    </ScrollView>
  );
};

type FieldProps = {
  field: FormField;
  value: string | undefined;
  error: string | undefined;
  onChange: (value: string) => void;
};

// iOS — glass ticket card fields: underline inputs, pill options, a Switch.
const TicketField = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {field.blockType === 'checkbox' ? (
        <View style={styles.checkboxHitArea}>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: value === 'true' }}
            value={value === 'true'}
            onValueChange={next => onChange(next ? 'true' : 'false')}
            trackColor={{ true: colors.accent }}
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
              <Text style={[styles.optionLabel, { color: value === option.value ? colors.onAccent : colors.text }]}>
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
            styles.iosInput,
            field.blockType === 'textarea' && styles.textarea,
            { color: colors.text, borderBottomColor: error ? colors.errorText : colors.border },
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

// Android — outlined M3 fields, `select` as a connected segmented control, a Switch.
const OutlinedField = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  if (field.blockType === 'checkbox') {
    return (
      <View style={styles.checkboxRow}>
        <Switch
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityState={{ checked: value === 'true' }}
          value={value === 'true'}
          onValueChange={next => onChange(next ? 'true' : 'false')}
          trackColor={{ true: colors.accent }}
        />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>{label}</Text>
      </View>
    );
  }

  if (field.blockType === 'select') {
    const options = field.options ?? [];
    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <View style={[styles.segmented, { borderColor: colors.accent }]}>
          {options.map((option, i) => (
            <AppPressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: value === option.value }}
              onPress={() => onChange(option.value)}
              style={[
                styles.segment,
                i > 0 && [styles.segmentDivider, { borderLeftColor: colors.accent }],
                value === option.value && { backgroundColor: colors.accent },
              ]}
            >
              <Text style={[styles.segmentLabel, { color: value === option.value ? colors.onAccent : colors.accent }]}>
                {option.label}
              </Text>
            </AppPressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        testID={`form-field-${field.name}`}
        accessibilityLabel={label}
        value={value ?? ''}
        onChangeText={onChange}
        multiline={field.blockType === 'textarea'}
        keyboardType={field.blockType === 'email' ? 'email-address' : 'default'}
        autoCapitalize={field.blockType === 'email' ? 'none' : 'sentences'}
        style={[
          styles.androidInput,
          field.blockType === 'textarea' && styles.textarea,
          { color: colors.text, borderColor: error ? colors.errorText : colors.border },
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.fieldError, { color: colors.errorText }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { padding: 16 },
  field: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, marginBottom: 18 },
  checkboxLabel: { marginLeft: 10, fontSize: 15 },
  checkboxHitArea: { minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  fieldError: { marginTop: 6, fontSize: 13 },
  submit: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, marginTop: 4 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '700' },
  submitError: { marginBottom: 12, fontSize: 14 },
  confirmation: { fontSize: 16, textAlign: 'center' },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5 },
  optionLabel: { fontWeight: '600' },

  // iOS — glass ticket
  iosPage: { padding: 16 },
  iosCard: { borderRadius: 28, overflow: 'hidden' },
  iosCardFill: { borderRadius: 28 },
  iosCardContent: { padding: 22 },
  iosInput: { minHeight: 40, borderBottomWidth: 2, paddingVertical: 6, fontSize: 16 },

  // Android — outlined + segmented
  androidPage: { padding: 16 },
  androidInput: { minHeight: 48, borderWidth: 1.5, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  segmented: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 8, overflow: 'hidden' },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  segmentDivider: { borderLeftWidth: 1 },
  segmentLabel: { fontWeight: '600' },
});
