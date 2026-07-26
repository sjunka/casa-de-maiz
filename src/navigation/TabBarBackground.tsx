import { GlassSurface } from '@presentation/ui/GlassSurface';
import { useTheme } from '@presentation/theme/useTheme';

export const TabBarBackground = () => {
  const { colors, scheme } = useTheme();
  return (
    <GlassSurface blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'} fallbackColor={colors.surface} />
  );
};
