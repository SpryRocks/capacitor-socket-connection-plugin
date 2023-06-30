import {ISocketConnectionPlugin, SocketConnectionPlugin} from './plugin';
import {registerPlugin} from '@capacitor/core';

import type {ICapacitorSocketConnectionDefinitions} from './definitions';

const wrapper = registerPlugin<ICapacitorSocketConnectionDefinitions>(
  'CapacitorSocketConnectionPlugin',
);
const plugin: ISocketConnectionPlugin = new SocketConnectionPlugin(wrapper);

export {plugin as CapacitorSocketConnectionPlugin};
