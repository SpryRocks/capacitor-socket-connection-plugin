import {Plugin, registerPlugin} from '@capacitor/core';

type PluginImplementation = unknown;
type PluginRegistration = () => PluginImplementation;

type CreatePlugin = <TPlugin>(
  pluginName: string,
  options?: {web?: PluginRegistration},
) => TPlugin;

export const createPlugin: CreatePlugin = <TPlugin>(
  pluginName: string,
  options?: {web?: PluginRegistration},
): TPlugin => {
  return registerPlugin<TPlugin>(pluginName, {web: options?.web});
};

export {Plugin};
