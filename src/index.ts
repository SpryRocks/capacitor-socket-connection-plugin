import { registerPlugin } from '@capacitor/core';

import type { CapacitorSocketConnectionPluginPlugin } from './definitions';

const CapacitorSocketConnectionPlugin = registerPlugin<CapacitorSocketConnectionPluginPlugin>('CapacitorSocketConnectionPlugin', {
  web: () => import('./web').then(m => new m.CapacitorSocketConnectionPluginWeb()),
});

export * from './definitions';
export { CapacitorSocketConnectionPlugin };
