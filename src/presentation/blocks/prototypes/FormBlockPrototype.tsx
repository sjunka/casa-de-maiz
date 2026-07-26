import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FormVariantA, variantAName } from './FormVariantA';
import { FormVariantB, variantBName } from './FormVariantB';
import { FormVariantC, variantCName } from './FormVariantC';
import { PrototypeSwitcher } from './PrototypeSwitcher';
import type { FormBlock as FormBlockData } from '@core/contract/models/block';

// PROTOTYPE (mattpocock-skills:prototype UI.md) — three structurally
// different looks for the form block: glassmorphic/Material card (A),
// sectioned underline form (B), conversational stack with a docked CTA (C).
// Question this answers: "what should the form block look like?" Switch
// variants with the floating bar; nothing here persists past this branch —
// fold the winner into FormBlock.tsx and delete this folder once picked.
const VARIANTS = [
  { key: 'A', name: variantAName, render: FormVariantA },
  { key: 'B', name: variantBName, render: FormVariantB },
  { key: 'C', name: variantCName, render: FormVariantC },
];

export const FormBlockPrototype = ({ block }: { block: FormBlockData }) => {
  const [index, setIndex] = useState(0);
  const Variant = VARIANTS[index].render;

  return (
    <View style={styles.fill}>
      {/* Reserves room for the floating switcher so it doesn't sit on top of
          each variant's first line of content. */}
      <View style={styles.switcherSpacer} />
      <Variant block={block} />
      <PrototypeSwitcher variants={VARIANTS} index={index} onChange={setIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  switcherSpacer: { height: 52 },
});
