import { GlassSurface } from '../ui/GlassSurface';
import { useTheme } from '../theme/useTheme';

export const TabBarBackground = () => {
  const { colors, scheme } = useTheme();
  return (
    <GlassSurface blurType={scheme === 'dark' ? 'thinMaterialDark' : 'thinMaterialLight'} fallbackColor={colors.surface} />
  );
};
