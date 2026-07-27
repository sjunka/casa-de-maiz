import type { Alert } from '@core/contract/models/bootstrap/alert';
import type { OperationalControls } from '@core/contract/models/bootstrap/operationalControls';

type DataSource = 'cms' | 'mock';

// A notice `seedNotices` filled in is ours, not the CMS's: compare what the
// backend actually sent against what ended up on screen.
export const resolveNoticeSources = (
  backendControls: OperationalControls | undefined,
  seededControls: OperationalControls,
  backendAlerts: Alert[],
): { appUpdate: DataSource; banner: DataSource; alert: DataSource } => ({
  appUpdate: backendControls?.appUpdate === seededControls.appUpdate ? 'cms' : 'mock',
  banner: backendControls?.bannerMessage === seededControls.bannerMessage ? 'cms' : 'mock',
  alert: backendAlerts.length > 0 ? 'cms' : 'mock',
});
