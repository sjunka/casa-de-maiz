import { resolveNoticeSources } from '@data/logic/resolveNoticeSource';
import type { Alert } from '@core/contract/models/alert';

const alert: Alert = {
  id: 'from-backend',
  message: 'Backend alert',
  placement: 'topBar',
  trigger: { type: 'load' },
  dismissible: true,
  pageSlugs: [],
  priority: 0,
  actions: [],
};

test('a notice unchanged from the backend reads as cms', () => {
  const backend = { mode: 'notice' as const, bannerMessage: 'Backend notice', appUpdate: { policy: 'recommended' as const, message: 'Backend update' } };
  const sources = resolveNoticeSources(backend, backend, [alert]);

  expect(sources).toEqual({ appUpdate: 'cms', banner: 'cms', alert: 'cms' });
});

test('a notice the seed filled in reads as mock', () => {
  const backend = undefined;
  const seeded = { mode: 'notice' as const, bannerMessage: 'Seed notice', appUpdate: { policy: 'recommended' as const, message: 'Seed update' } };
  const sources = resolveNoticeSources(backend, seeded, []);

  expect(sources).toEqual({ appUpdate: 'mock', banner: 'mock', alert: 'mock' });
});
