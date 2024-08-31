import {Plugin as CapPlugin} from '@capacitor/core';
import {registerPlugin as capRegisterPlugin} from '@capacitor/core';

export type Plugin = CapPlugin;

export const registerPlugin = capRegisterPlugin;
