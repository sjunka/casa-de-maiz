// PROTOTYPE — throwaway. Three chrome variants for the tab bar and card
// surfaces, switched at runtime from the floating PrototypeSwitcher. Each
// variant still diverges per platform (iOS glass / Android Material, ADR 0012);
// the variant decides the *structure*, the platform decides the *material*.
//
// Once a variant wins, fold its branch into the real components and delete
// this directory along with PrototypeSwitcher.
import { createContext, useContext } from 'react';

export const VARIANTS = ['A', 'B', 'C'] as const;
export type Variant = (typeof VARIANTS)[number];

export const VARIANT_NAMES: Record<Variant, string> = {
  A: 'Anchored',
  B: 'Floating pill',
  C: 'Icon rail',
};

export type Chrome = {
  variant: Variant;
  // Tab bar structure.
  //   anchored — full-bleed bar flush to the screen edge, icon over label.
  //   floating — detached rounded bar, inset from every edge; label only on the
  //              active tab, which expands into a horizontal pill.
  //   rail     — compact icon-only bar, active marked by a top indicator line.
  tabBar: 'anchored' | 'floating' | 'rail';
  // Card surface treatment.
  //   raised — opaque surface, radius 12, platform elevation.
  //   framed — opaque surface, radius 20, stronger elevation, no border.
  //   flat   — no surface at all; hairline dividers carry the structure.
  card: 'raised' | 'framed' | 'flat';
};

const CHROMES: Record<Variant, Chrome> = {
  A: { variant: 'A', tabBar: 'anchored', card: 'raised' },
  B: { variant: 'B', tabBar: 'floating', card: 'framed' },
  C: { variant: 'C', tabBar: 'rail', card: 'flat' },
};

export const chromeFor = (variant: Variant): Chrome => CHROMES[variant];

export const ChromeContext = createContext<Chrome>(CHROMES.A);

export const useChrome = (): Chrome => useContext(ChromeContext);
