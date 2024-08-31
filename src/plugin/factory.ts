import {createPlugin, Plugin} from './core/index';
import type {ICapacitorSocketConnectionDefinitions} from './definitions';

const pluginName = 'CapacitorSocketConnectionPlugin';

const plugin = createPlugin<ICapacitorSocketConnectionDefinitions & Plugin>(pluginName);

export {plugin as NativePlugin};
