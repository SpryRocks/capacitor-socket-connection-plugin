import {ICapacitorSocketConnectionDefinitions} from './definitions';

export interface ISocketConnectionPlugin {}

export class SocketConnectionPlugin implements ISocketConnectionPlugin {
  constructor(private readonly wrapper: ICapacitorSocketConnectionDefinitions) {
    this.wrapper.echo({value: ''});
  }
}
