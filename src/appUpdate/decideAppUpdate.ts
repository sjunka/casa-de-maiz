import type { AppUpdate } from '../models/operationalControls';
import { isBelowMinimumVersion } from './compareVersions';

export type AppUpdateDecision =
  | { kind: 'none' }
  | { kind: 'recommended'; message: string }
  | { kind: 'required'; message: string };

// `policy` is authoritative — a minimum version alone never blocks. See docs/adr/0007.
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
