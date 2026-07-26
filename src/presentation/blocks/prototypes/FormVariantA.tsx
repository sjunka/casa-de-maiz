import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, KeyboardAvoidingView, Switch, TextInput } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { GlassSurface } from '../../ui/GlassSurface';
import { AppPressable } from '../../ui/AppPressable';
import { useFormBlockState } from './useFormBlockState';
import type { FormBlock as FormBlockData, FormField } from '@core/contract/models/block';

export const variantAName = 'Glass ticket';

// PROTOTYPE variant A — one raised card holding the whole form, like an order
// ticket. iOS gets a true frosted-glass card (GlassSurface); Android gets a
// flat Material surface with a filled-container look — no glass, no shadow
// theatrics, just tonal elevation.
export const FormVariantA = ({ block }: { block: FormBlockData }) => {
  const { colors, scheme } = useTheme();
  const { fields, values, errors, status, submitError, setValue, handleSubmit } = useFormBlockState(block);

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
        <View style={[styles.card, Platform.OS === 'android' && { backgroundColor: colors.surfaceElevated }]}>
          {Platform.OS === 'ios' && (
            <GlassSurface
              style={styles.cardFill}
              blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'}
              fallbackColor={colors.surfaceElevated}
            />
          )}
          <View style={styles.cardContent}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>ORDER OF BUSINESS</Text>

            {fields.map(field => (
              <TicketField
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={v => setValue(field.name, v)}
              />
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
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type FieldProps = { field: FormField; value: string | undefined; error: string | undefined; onChange: (v: string) => void };

const TicketField = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
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
              <Text style={{ color: value === option.value ? colors.onAccent : colors.text, fontWeight: '600' }}>
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
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { padding: 16 },
  card: { borderRadius: 28, overflow: 'hidden' },
  cardFill: { borderRadius: 28 },
  cardContent: { padding: 22 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, marginBottom: 18 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { minHeight: 40, borderBottomWidth: 2, paddingVertical: 6, fontSize: 16 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkboxRow: { minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  option: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5 },
  fieldError: { marginTop: 6, fontSize: 13 },
  submit: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, marginTop: 4 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '700' },
  submitError: { marginBottom: 12, fontSize: 14 },
  successWrap: { padding: 32, alignItems: 'center' },
  successText: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
});
