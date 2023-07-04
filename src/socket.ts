/* eslint-disable no-console */
import {
  BaseEvent,
  ByteArray,
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

type State = 'initial' | 'opening' | 'opened' | 'closing' | 'closed' | 'error';

export interface ISocket {
  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  open(host: string, port: number): Promise<void>;

  write(data: SocketData): Promise<void>;

  close(): Promise<void>;
}

export class Socket implements ISocket {
  private static readonly TAG = 'SocketConnectionPlugin';

  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  private _state: State = 'initial';

  private _link: NativeLink | undefined;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor,@typescript-eslint/no-empty-function
  constructor(_options?: SocketOptions) {
    this.setupListeners();
  }

  async open(host: string, port: number) {
    this.checkStateOrThrow('initial', `You can call "open" method only once`);
    this.onOpeningInternal();
    let close: boolean;
    try {
      const {link} = await NativePlugin.openConnection({host, port});
      close = this.checkState('closing');
      this.onOpenedInternal(link);
    } catch (error) {
      this.onErrorInternal(error);
      throw error;
    }

    if (close) {
      this.closeInternal().catch();
    }
  }

  async write(data: SocketData) {
    this.checkStateOrThrow('opened', `Not supported state: ${this.state}`);
    return NativePlugin.sendData({link: this.link, data: Array.from(data)});
  }

  private onDataEventReceived(event: OnDataEvent) {
    console.log('Socket', 'onDataEventReceived', {event});
    if (!this.checkEventUuid(event)) return;
    this.onDataInternal(event.data);
  }

  private onCloseEventReceived(event: OnCloseEvent) {
    console.log('Socket', 'onCloseEventReceived', {event});
    if (!this.checkEventUuid(event)) return;
    this.onClosedInternal();
  }

  private onErrorEventReceived(event: OnErrorEvent) {
    console.log('Socket', 'onErrorEventReceived', {event});
    if (!this.checkEventUuid(event)) return;
    this.onErrorInternal(new SocketConnectionError('Connection error'));
  }

  async close() {
    if (this.checkState('initial')) {
      this.onClosedInternal();
      return;
    }
    if (this.checkState('opening')) {
      this.onClosingInternal();
      return;
    }
    if (this.checkState('opened')) {
      await this.closeInternal();
      return;
    }
  }

  private async closeInternal() {
    if (this.checkState('opened')) {
      this.onClosingInternal();
      await NativePlugin.closeConnection({link: this.link});
      this.onClosedInternal();
    }
  }

  private get state() {
    return this._state;
  }

  private set state(newState: State) {
    const oldState = this._state;
    console.log(Socket.TAG, 'set state', {oldState, newState});
    this._state = newState;
  }

  private get link() {
    if (!this._link) throw new SocketConnectionError('PluginLink is undefined');
    return this._link;
  }

  private onOpeningInternal() {
    this.state = 'opening';
  }

  private onOpenedInternal(link: NativeLink) {
    this._link = link;
    this.state = 'opened';
  }

  private onDataInternal(bytes: ByteArray) {
    if (!this.checkState('opened')) return;
    const data = new Uint8Array(bytes);
    if (this.onData) this.onData(data);
  }

  private onErrorInternal(error: unknown) {
    if (this.checkState('error')) return;
    if (this.checkState('closed')) return;
    if (this.checkState('closing')) {
      this.onClosedInternal();
      return;
    }
    this.state = 'error';
    if (this.onError) this.onError(error);
  }

  private onClosingInternal() {
    this.state = 'closing';
  }

  private onClosedInternal() {
    if (this.checkState('closed')) return;
    if (this.checkState('error')) return;
    this.state = 'closed';
    if (this.onClose) this.onClose();
  }

  private checkState(...states: State[]) {
    return states.includes(this.state);
  }

  private checkEventUuid(event: BaseEvent) {
    return event.socketUuid === this.link.uuid;
  }

  private checkStateOrThrow(state: State, errorMessage: string) {
    if (!this.checkState(state)) throw new SocketConnectionError(errorMessage);
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
