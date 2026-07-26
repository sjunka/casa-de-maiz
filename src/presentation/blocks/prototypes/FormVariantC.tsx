import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../theme/useTheme';
import { GlassSurface } from '../../ui/GlassSurface';
import { AppPressable } from '../../ui/AppPressable';
import { useFormBlockState } from './useFormBlockState';
import type { FormBlock as FormBlockData, FormField } from '@core/contract/models/block';

export const variantCName = 'Conversational, docked CTA';

type Glyph = React.ComponentProps<typeof MaterialDesignIcons>['name'];

const iconFor = (field: FormField): Glyph => {
  switch (field.blockType) {
    case 'email':
      return 'email-outline';
    case 'textarea':
      return 'message-text-outline';
    case 'select':
      return 'format-list-bulleted';
    default:
      return 'account-outline';
  }
};

// PROTOTYPE variant C — one relaxed, conversational column of prompts (each
// row an icon chip + plain-text prompt), select rendered as pill chips,
// checkbox as a tappable full-width row. The structural bet: the primary
// action isn't inline at the end of the form, it's a docked bar pinned to
// the bottom of the screen (glass on iOS, tonal Material bar on Android) —
// visible the whole time, not something you scroll to find.
export const FormVariantC = ({ block }: { block: FormBlockData }) => {
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
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {fields.map(field => (
          <PromptField
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
      </ScrollView>

      <View style={styles.dock}>
        {Platform.OS === 'ios' ? (
          <GlassSurface
            style={styles.dockFill}
            blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'}
            fallbackColor={colors.surfaceElevated}
          />
        ) : (
          <View style={[styles.dockFill, { backgroundColor: colors.surfaceElevated }]} />
        )}
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
  );
};

type FieldProps = { field: FormField; value: string | undefined; error: string | undefined; onChange: (v: string) => void };

const PromptField = ({ field, value, error, onChange }: FieldProps) => {
  const { colors } = useTheme();
  const label = field.label ?? field.name;

  if (field.blockType === 'checkbox') {
    const checked = value === 'true';
    return (
      <AppPressable
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked }}
        onPress={() => onChange(checked ? 'false' : 'true')}
        style={[styles.checkboxRow, { borderColor: colors.border }]}
      >
        <View style={[styles.checkMark, { borderColor: colors.accent }, checked && { backgroundColor: colors.accent }]}>
          {checked && <MaterialDesignIcons name="check" size={14} color={colors.onAccent} />}
        </View>
        <Text style={[styles.promptLabel, { color: colors.text }]}>{label}</Text>
      </AppPressable>
    );
  }

  return (
    <View style={styles.row}>
      <View style={[styles.iconChip, { backgroundColor: colors.accentContainer }]}>
        <MaterialDesignIcons name={iconFor(field)} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.promptLabel, { color: colors.text }]}>{label}</Text>
        {field.blockType === 'select' ? (
          <View style={styles.chips}>
            {(field.options ?? []).map(option => (
              <AppPressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: value === option.value }}
                onPress={() => onChange(option.value)}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceElevated },
                  value === option.value && { backgroundColor: colors.accent },
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
            placeholder={`Type your ${label.toLowerCase()}…`}
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              field.blockType === 'textarea' && styles.textarea,
              { color: colors.text, backgroundColor: colors.surfaceElevated, borderColor: error ? colors.errorText : 'transparent' },
            ]}
          />
        )}
        {error ? (
          <Text accessibilityLiveRegion="polite" style={[styles.fieldError, { color: colors.errorText }]}>
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 96 },
  row: { flexDirection: 'row', marginBottom: 20 },
  iconChip: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  rowBody: { flex: 1 },
  promptLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { minHeight: 44, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fieldError: { marginTop: 6, fontSize: 13 },
  chip: { minHeight: 40, minWidth: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, marginBottom: 20 },
  checkMark: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  submitError: { marginBottom: 12, fontSize: 14 },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  dockFill: StyleSheet.absoluteFill,
  submit: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 16, fontWeight: '700' },
  successWrap: { padding: 32, alignItems: 'center' },
  successText: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
});
