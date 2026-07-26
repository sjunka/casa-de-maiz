import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { AppPressable } from '../../ui/AppPressable';
import { useFormBlockState } from './useFormBlockState';
import type { FormBlock as FormBlockData, FormField } from '@core/contract/models/block';

export const variantBName = 'Sectioned journey';

const isContactField = (field: FormField) => field.blockType === 'text' || field.blockType === 'email';

// PROTOTYPE variant B — fields split into two labelled sections ("Your
// details" / "Your message") with a step indicator up top, borderless
// underline inputs, and hairline dividers instead of a card. No shared card
// surface at all — the opposite structural bet from variant A.
export const FormVariantB = ({ block }: { block: FormBlockData }) => {
  const { colors } = useTheme();
  const { fields, values, errors, status, submitError, setValue, handleSubmit } = useFormBlockState(block);

  const detailFields = fields.filter(isContactField);
  const messageFields = fields.filter(field => !isContactField(field));
  const sections = [
    { title: 'Your details', fields: detailFields },
    { title: 'Your message', fields: messageFields },
  ].filter(section => section.fields.length > 0);

  const sectionFilled = (section: { fields: FormField[] }) =>
    section.fields.every(field => (field.blockType === 'checkbox' ? true : (values[field.name] ?? '').trim().length > 0));

  if (status === 'success') {
    return (
      <View style={styles.successWrap}>
        <Text style={[styles.successText, { color: colors.text }]}>
          {block.form.confirmationMessage ?? 'Thanks! We received your submission.'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.fill} contentContainerStyle={styles.page}>
        <View style={styles.steps}>
          {sections.map((section, index) => (
            <View key={section.title} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  { borderColor: colors.accent },
                  sectionFilled(section) && { backgroundColor: colors.accent },
                ]}
              />
              {index < sections.length - 1 && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            {section.fields.map(field => (
              <UnderlineField
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={v => setValue(field.name, v)}
              />
            ))}
          </View>
        ))}

        {submitError ? (
          <Text accessibilityLiveRegion="polite" style={[styles.submitError, { color: colors.errorText }]}>
            {submitError}
          </Text>
        ) : null}

        <AppPressable
          accessibilityRole="button"
          accessibilityLabel={block.form.submitButtonLabel ?? 'Submit'}
          accessibilityState={{ disabled: status === 'submitting' }}
          disabled={status === 'submitting'}
          onPress={handleSubmit}
          style={[styles.submit, { backgroundColor: colors.accent }, status === 'submitting' && styles.submitDisabled]}
        >
          {status === 'submitting' ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={[styles.submitLabel, { color: colors.onAccent }]}>
              {block.form.submitButtonLabel ?? 'Submit'}
            </Text>
          )}
        </AppPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type FieldProps = { field: FormField; value: string | undefined; error: string | undefined; onChange: (v: string) => void };

const UnderlineField = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  return (
    <View style={styles.field}>
      {field.blockType === 'checkbox' ? (
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
      ) : field.blockType === 'select' ? (
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <View style={styles.options}>
            {(field.options ?? []).map(option => (
              <AppPressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: value === option.value }}
                onPress={() => onChange(option.value)}
                style={styles.option}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { color: value === option.value ? colors.accent : colors.textSecondary },
                    value === option.value && styles.optionLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </AppPressable>
            ))}
          </View>
        </View>
      ) : (
        <>
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
              styles.input,
              field.blockType === 'textarea' && styles.textarea,
              { color: colors.text, borderBottomColor: error ? colors.errorText : colors.border },
            ]}
          />
        </>
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
  fill: { flex: 1 },
  page: { padding: 20 },
  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 16 },
  field: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { minHeight: 36, borderBottomWidth: 1, paddingVertical: 4, fontSize: 16 },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  option: { minHeight: 44, justifyContent: 'center' },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  optionLabelActive: { textDecorationLine: 'underline' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  checkboxLabel: { marginLeft: 10, fontSize: 15 },
  fieldError: { marginTop: 6, fontSize: 13 },
  submit: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginTop: 8 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '700' },
  submitError: { marginBottom: 12, fontSize: 14 },
  successWrap: { padding: 32, alignItems: 'center' },
  successText: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
});
