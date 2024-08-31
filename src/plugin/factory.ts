import {Plugin, Plugins} from './core/index';
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
  _?: {web?: PluginRegistration},
): TPlugin => {
  return Plugins[pluginName] as TPlugin;
};

const plugin = createPlugin<ICapacitorSocketConnectionDefinitions & Plugin>(pluginName);

export {plugin as NativePlugin};
