import type {CapPlugin, ICapacitorSocketConnectionDefinitions} from './definitions';
import {registerPlugin} from '@capacitor/core';

const pluginName = 'CapacitorSocketConnectionPlugin';

const createPlugin = <T>(pluginName: string) => registerPlugin<T>(pluginName);

const plugin = createPlugin<ICapacitorSocketConnectionDefinitions & CapPlugin>(
  pluginName,
);

export {plugin as NativePlugin};
