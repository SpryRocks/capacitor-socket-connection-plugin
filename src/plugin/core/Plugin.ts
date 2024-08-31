import {Plugins} from '@capacitor/core';

type CapPluginListener = (event: unknown) => void;

export type Plugin = {
  addListener: (name: string, listener: CapPluginListener) => void;
};

export {Plugins};
