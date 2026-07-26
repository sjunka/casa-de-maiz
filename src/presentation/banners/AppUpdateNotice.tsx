import { useState } from 'react';
import { getAppVersion } from '@core/contract/appVersion';
import { decideAppUpdate } from '@data/logic/decideAppUpdate';
import { useTheme } from '../theme/useTheme';
import { NoticeCard } from './NoticeCard';
import type { AppUpdate } from '@core/contract/models/operationalControls';

type Props = { appUpdate?: AppUpdate };

// The recommended half of the app-update policy: a dismissible notice that
// takes its place in the notice stack. The required half blocks the app
// instead and lives in AppUpdateGate (ADR 0007).
export const AppUpdateNotice = ({ appUpdate }: Props) => {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const decision = decideAppUpdate(appUpdate, getAppVersion());

  if (decision.kind !== 'recommended' || dismissed) {
    return null;
  }

  return (
    <NoticeCard
      testID="app-update-recommended"
      icon="update"
      tint={colors.warningBackground}
      accent={colors.warningText}
      message={decision.message}
      dismissible
      dismissLabel="Descartar mensaje de actualización"
      onDismiss={() => setDismissed(true)}
    />
  );
};
