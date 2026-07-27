import type { AppUpdate } from '@core/contract/models/bootstrap/operationalControls';
import { isBelowMinimumVersion } from './compareVersions';

export type AppUpdateDecision =
  | { kind: 'none' }
  | { kind: 'recommended'; message: string }
  | { kind: 'required'; message: string };

// `policy` is authoritative — a minimum version alone never blocks.
export const decideAppUpdate = (appUpdate: AppUpdate | undefined, installedVersion: string): AppUpdateDecision => {
  if (!appUpdate) return { kind: 'none' };

  if (appUpdate.policy === 'required' && appUpdate.minimumVersion && isBelowMinimumVersion(installedVersion, appUpdate.minimumVersion)) {
    return { kind: 'required', message: appUpdate.message };
  }

  if (appUpdate.policy === 'recommended') {
    return { kind: 'recommended', message: appUpdate.message };
  }

  return { kind: 'none' };
};
