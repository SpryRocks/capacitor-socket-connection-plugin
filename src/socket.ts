import {
  OnSocketClose,
  OnSocketData,
  OnSocketError,
  SocketData,
  SocketOptions,
} from './types';
import {CapacitorSocketConnectionPlugin} from './factory';

export interface ISocket {
  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  open(host: string, port: number): Promise<void>;

  write(data: SocketData): Promise<void>;

  close(): Promise<void>;
}

export class Socket implements ISocket {
  private readonly plugin = CapacitorSocketConnectionPlugin;

  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  constructor(_options?: SocketOptions) {
    this.plugin.toString();
  }

  open(_host: string, _port: number): Promise<void> {
    return Promise.resolve();
  }

  write(_data: SocketData): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}
