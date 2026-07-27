import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import type { RootTabParamList } from '../types';

type Glyph = React.ComponentProps<typeof MaterialDesignIcons>['name'];

// One icon family, identical glyphs on both platforms — the brief asks for the
// tab bar to *read* the same everywhere even though its chrome diverges.
// Outline when inactive, filled when active, so the active tab is legible
// without relying on colour alone.
const ICONS: Record<keyof RootTabParamList, { active: Glyph; inactive: Glyph }> = {
  home: { active: 'home', inactive: 'home-outline' },
  menu: { active: 'silverware-fork-knife', inactive: 'silverware-variant' },
  reservations: { active: 'calendar-blank', inactive: 'calendar-blank-outline' },
  privacy: { active: 'shield-lock', inactive: 'shield-lock-outline' },
  formFixture: { active: 'form-select', inactive: 'form-select' },
};

type Props = { route: string; focused: boolean; color: string; size: number };

export const TabIcon = ({ route, focused, color, size }: Props) => {
  const icon = ICONS[route as keyof RootTabParamList];
  if (!icon) {
    return null;
  }

  return (
    <MaterialDesignIcons
      name={focused ? icon.active : icon.inactive}
      size={size}
      color={color}
      // The tab itself carries the accessible label; the glyph is decoration.
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
};
