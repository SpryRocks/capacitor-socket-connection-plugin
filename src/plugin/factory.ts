import {Plugin, registerPlugin} from './core/index';
import type {ICapacitorSocketConnectionDefinitions} from './definitions';

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

const plugin = createPlugin<ICapacitorSocketConnectionDefinitions & Plugin>(pluginName);

export {plugin as NativePlugin};
