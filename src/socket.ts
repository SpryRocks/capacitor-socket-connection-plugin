import {
  NativeLink,
  NativePlugin,
  OnCloseEvent,
  OnDataEvent,
  OnErrorEvent,
  PluginEvents,
} from './plugin/index';
import {
  OnSocketClose,
  OnSocketData,
  OnSocketError,
  SocketData,
  SocketOptions,
} from './types';
import {SocketConnectionError} from './error';

type State =
  | 'notConnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected';

export interface ISocket {
  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  open(host: string, port: number): Promise<void>;

  write(data: SocketData): Promise<void>;

  close(): Promise<void>;
}

export class Socket implements ISocket {
  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  private _state: State = 'notConnected';

  private _link: NativeLink | undefined;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor,@typescript-eslint/no-empty-function
  constructor(_options?: SocketOptions) {
    this.setupListeners();
  }

  async open(host: string, port: number) {
    this.state = 'connecting';
    const {link} = await NativePlugin.openConnection({host, port});
    this._link = link;
    this.state = 'connected';
  }

  async write(data: SocketData) {
    const state = this.state;
    if (state !== 'connected') {
      throw new SocketConnectionError('Not supported state: ' + state);
    }
    return NativePlugin.sendData({link: this.link, data: Array.from(data)});
  }

  private onDataEventReceived(event: OnDataEvent) {
    console.log('Socket', 'onDataEventReceived', {event});
    const state = this.state;
    if (state !== 'connected') return;
    if (event.socketUuid !== this.link.uuid) return;
    if (!this.onData) return;
    this.onData(new Uint8Array(event.data));
  }

  private onCloseEventReceived(event: OnCloseEvent) {
    console.log('Socket', 'onCloseEventReceived', {event});
    const state = this.state;
    if (state !== 'connected') return;
    if (event.socketUuid !== this.link.uuid) return;
    if (!this.onClose) return;
    this.onClose();
  }

  private onErrorEventReceived(event: OnErrorEvent) {
    console.log('Socket', 'onErrorEventReceived', {event});
    const state = this.state;
    if (state !== 'connected') return;
    if (event.socketUuid !== this.link.uuid) return;
    if (!this.onError) return;
    this.onError(new SocketConnectionError('Connection error'));
  }

  async close() {
    const state = this.state;
    if (state === 'connected') {
      this.state = 'disconnecting';
      await NativePlugin.closeConnection({link: this.link});
      this.state = 'disconnected';
    } else {
      throw new SocketConnectionError('Not supported state: ' + state);
    }
  }

  private get state() {
    return this._state;
  }

  private set state(value: State) {
    this._state = value;
    console.log('Socket', 'newState', value);
  }

  private get link() {
    if (!this._link) throw new SocketConnectionError('PluginLink is undefined');
    return this._link;
  }

  private setupListeners() {
    NativePlugin.addListener(PluginEvents.OnData, (data) => {
      this.onDataEventReceived(data as OnDataEvent);
    });
    NativePlugin.addListener(PluginEvents.OnClose, (data) => {
      this.onCloseEventReceived(data as OnCloseEvent);
    });
    NativePlugin.addListener(PluginEvents.OnError, (data) => {
      this.onErrorEventReceived(data as OnErrorEvent);
    });
  }
}
