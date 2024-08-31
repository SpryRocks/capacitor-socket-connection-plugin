import {Plugins} from '@capacitor/core';

type CapPluginListener = (event: unknown) => void;

type Plugin = {
  addListener: (name: string, listener: CapPluginListener) => void;
};

type PluginImplementation = unknown;
type PluginRegistration = () => PluginImplementation;

type CreatePlugin = <TPlugin>(
  pluginName: string,
  options?: {web?: PluginRegistration},
) => TPlugin;

export const createPlugin: CreatePlugin = <TPlugin>(
  pluginName: string,
  _?: {web?: PluginRegistration},
): TPlugin => {
  return Plugins[pluginName] as TPlugin;
};

export {Plugin};
