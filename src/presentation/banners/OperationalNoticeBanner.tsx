import { useState } from 'react';
import { CollapsibleBanner } from '../ui/CollapsibleBanner';
import { NoticeCard } from './NoticeCard';
import { useTheme } from '../theme/useTheme';
import type { OperationalControls } from '@core/contract/models/operationalControls';

type Props = { operationalControls?: OperationalControls };

export const OperationalNoticeBanner = ({ operationalControls }: Props) => {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hasNotice = operationalControls?.mode === 'notice' && !!operationalControls.bannerMessage;

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
