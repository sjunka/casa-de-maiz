import type { Alert } from '@core/contract/models/bootstrap/alert';
import type { OperationalControls } from '@core/contract/models/bootstrap/operationalControls';
import { getAppVersion } from '@core/contract/appVersion';
import { decideAppUpdate } from '../appUpdate/decideAppUpdate';

// This build opens with the full notice stack on every launch, so each of the
// three kinds is guaranteed a card. Backend content always wins: a seed only
// fills a slot the backend left empty, and extra backend alerts are never
// trimmed to make room.
const SEED_APP_UPDATE = {
  policy: 'recommended',
  message: 'Actualiza para disfrutar el nuevo menú y reservas.',
};

const SEED_BANNER_MESSAGE = 'Hoy cerramos cocina a las 22:30.';

const SEED_ALERT: Alert = {
  id: 'seed-alert',
  message: 'Menú de temporada disponible esta semana.',
  placement: 'topBar',
  trigger: { type: 'load', delayMs: 0 },
  dismissible: true,
  frequency: { type: 'always', cooldownHours: 24 },
  pageSlugs: [],
  priority: 0,
  actions: [{ href: '/menu', label: 'Ver menú' }],
};

const rendersNotice = (controls: OperationalControls | undefined): boolean =>
  controls?.mode === 'notice' && !!controls.bannerMessage;

export const seedNotices = (
  operationalControls: OperationalControls | undefined,
  alerts: Alert[],
): { operationalControls: OperationalControls; alerts: Alert[] } => {
  const appUpdate =
    decideAppUpdate(operationalControls?.appUpdate, getAppVersion()).kind === 'none'
      ? SEED_APP_UPDATE
      : operationalControls?.appUpdate;

  const notice = rendersNotice(operationalControls)
    ? operationalControls
    : { ...operationalControls, mode: 'notice', bannerMessage: SEED_BANNER_MESSAGE };

  return {
    operationalControls: { ...notice, mode: notice?.mode ?? 'notice', appUpdate },
    alerts: alerts.length > 0 ? alerts : [SEED_ALERT],
  };
};
