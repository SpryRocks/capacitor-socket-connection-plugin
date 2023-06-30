import { WebPlugin } from '@capacitor/core';

import type { CapacitorSocketConnectionPluginPlugin } from './definitions';

export class CapacitorSocketConnectionPluginWeb extends WebPlugin implements CapacitorSocketConnectionPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
