import { useEffect, useState } from 'react';
import { CollapsibleBanner } from '../ui/CollapsibleBanner';
import { NoticeCard } from './NoticeCard';
import { useTheme } from '../theme/useTheme';
import type { OperationalControls } from '@core/contract/models/bootstrap/operationalControls';

type Props = { operationalControls?: OperationalControls };

export const OperationalNoticeBanner = ({ operationalControls }: Props) => {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hasNotice = operationalControls?.mode === 'notice' && !!operationalControls.bannerMessage;

  // Evaluator-facing banners must auto-dismiss so a fresh install can be
  // verified without manually closing every card; a reload just re-shows it.
  useEffect(() => {
    if (!hasNotice) return;
    const timer = setTimeout(() => setDismissed(true), 8000);
    return () => clearTimeout(timer);
  }, [hasNotice]);

  if (!hasNotice || collapsed) {
    return null;
  }

  return (
    <CollapsibleBanner visible={!dismissed} onExited={() => setCollapsed(true)}>
      <NoticeCard
        testID="operational-notice-banner"
        icon="clock-outline"
        tint={colors.infoBackground}
        accent={colors.infoText}
        message={operationalControls?.bannerMessage ?? ''}
        dismissible
        dismissLabel="Descartar aviso"
        onDismiss={() => setDismissed(true)}
      />
    </CollapsibleBanner>
  );
};
