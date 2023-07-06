import type {CapPlugin, ICapacitorSocketConnectionDefinitions} from './definitions';
import {registerPlugin} from '@capacitor/core';

const pluginName = 'CapacitorSocketConnectionPlugin';

export type PluginImplementation = unknown;
export type PluginRegistration = () => PluginImplementation;

export type CreatePlugin = <TPlugin>(
  pluginName: string,
  options?: {web?: PluginRegistration},
) => TPlugin;

export const createPlugin: CreatePlugin = <TPlugin>(
  pluginName: string,
  options?: {web?: PluginRegistration},
): TPlugin => {
  return registerPlugin<TPlugin>(pluginName, {web: options?.web});
};

const plugin = createPlugin<ICapacitorSocketConnectionDefinitions & CapPlugin>(
  pluginName,
);

export {plugin as NativePlugin};
