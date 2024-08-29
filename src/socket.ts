import {
  BaseEvent,
  ByteArray,
  ErrorObject,
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
  OnStateChanged,
  SocketData,
  SocketOptions,
  SocketState as State,
} from './types';
import {createLogger} from './logger';
import {ErrorLevel} from '@spryrocks/logger-plugin';
import {SocketConnectionError} from './error';

export interface ISocket {
  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  onStateChanged: OnStateChanged | undefined;

  open(host: string, port: number): Promise<void>;

  write(data: SocketData): Promise<void>;

  close(): Promise<void>;

  get state(): State;
}

export class Socket implements ISocket {
  private readonly logger = createLogger();

  onStateChanged: OnStateChanged | undefined;

  onData: OnSocketData | undefined;

  onClose: OnSocketClose | undefined;

  onError: OnSocketError | undefined;

  private _state: State = 'initial';

  private _link: NativeLink | undefined;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor,@typescript-eslint/no-empty-function
  constructor(_options?: SocketOptions) {
    this.setupListeners();
  }

  //region Actions
  async open(host: string, port: number) {
    this.logger.debug('Open connection', {host, port});
    this.checkStateOrThrow('initial', `You can call "open" method only once`);
    this.onOpeningInternal();
    let close: boolean;
    try {
      const {link} = await this.wrapCall(NativePlugin.openConnection({host, port}));
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
    return this.wrapCall(
      NativePlugin.sendData({link: this.getLinkOrThrow(), data: Array.from(data)}),
    );
  }

  async close() {
    if (this.checkState('initial')) {
      this.logger.debug('Connection closed from initial state');
      this.onClosedInternal();
      return;
    }
    if (this.checkState('opening')) {
      this.logger.debug('Connection closing from opening state');
      this.onClosingInternal();
      return;
    }

    await this.closeInternal();
  }
  //endregion

  //region Events
  private onDataEventReceived(event: OnDataEvent) {
    if (!this.checkEventUuid(event)) return;
    this.onDataInternal(event.data);
  }

  private onCloseEventReceived(event: OnCloseEvent) {
    if (!this.checkEventUuid(event)) return;
    this.logger.info('onClose event received', {event});
    this.onClosedInternal();
  }

  private onErrorEventReceived(event: OnErrorEvent) {
    if (!this.checkEventUuid(event)) return;
    this.logger.info('onError event received', {event});
    this.onErrorInternal(this.createErrorFromObject(event.error));
  }
  //endregion

  //region State & Helpers
  get state() {
    return this._state;
  }

  private set state(newState: State) {
    const oldState = this._state;
    this.logger.info(`Set state: "${newState}"`, {oldState});
    this._state = newState;
    this.onStateChanged?.(newState);
  }

  private getLink() {
    return this._link;
  }

  private getLinkOrThrow() {
    if (!this._link) throw new SocketConnectionError('PluginLink is undefined');
    return this._link;
  }

  private setLink(link: NativeLink) {
    this._link = link;
    this.logger.updateParams({link: link.uuid});
  }

  private checkState(...states: State[]) {
    return states.includes(this.state);
  }

  private checkEventUuid(event: BaseEvent) {
    return event.socketUuid === this.getLink()?.uuid;
  }

  private checkStateOrThrow(state: State, errorMessage: string) {
    if (!this.checkState(state)) {
      this.logger.error(undefined, errorMessage, {level: ErrorLevel.Low});
      throw new SocketConnectionError(errorMessage);
    }
  }
  //endregion

  //region Internal
  private onOpeningInternal() {
    this.state = 'opening';
  }

  private onOpenedInternal(link: NativeLink) {
    this.setLink(link);
    this.state = 'opened';
    this.logger.info('Connection opened');
  }

  private onDataInternal(bytes: ByteArray) {
    if (!this.checkState('opened')) return;
    const data = new Uint8Array(bytes);
    this.onData?.(data);
  }

  private onErrorInternal(error: unknown) {
    if (this.checkState('error')) return;
    if (this.checkState('closed')) return;
    if (this.checkState('closing')) {
      this.onClosedInternal();
      return;
    }
    this.logger.error(error, undefined, {level: ErrorLevel.Medium});
    this.state = 'error';
    this.onError?.(error);
  }

  private onClosingInternal() {
    this.state = 'closing';
  }

  private onClosedInternal() {
    if (this.checkState('closed')) return;
    if (this.checkState('error')) return;
    this.state = 'closed';
    this.onClose?.();
  }

  private async closeInternal() {
    if (this.checkState('opened')) {
      this.logger.debug('Close connection');
      this.onClosingInternal();
      await this.wrapCall(NativePlugin.closeConnection({link: this.getLinkOrThrow()}));
      this.onClosedInternal();
      this.logger.info('Connection closed');
      return;
    }

    this.logger.info(`Cannot close connection from state "${this.state}"`);
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
  //endregion

  private createErrorFromObject(error: ErrorObject): SocketConnectionError {
    return new SocketConnectionError(error.message);
  }

  private processErrorCode(code: string): SocketConnectionError | undefined {
    try {
      const errorObject: ErrorObject = JSON.parse(code);
      return this.createErrorFromObject(errorObject);
    } catch {
      return undefined;
    }
  }

  private processError(error: {
    errorMessage: string | undefined;
    code: string | undefined;
  }): SocketConnectionError {
    if (error.code) {
      const processedError = this.processErrorCode(error.code);
      if (processedError) return processedError;
    }
    return new SocketConnectionError(error.errorMessage ?? 'Unknown error');
  }

  private wrapCall<T>(promise: Promise<T>): Promise<T> {
    return promise.catch((error) => {
      throw this.processError(error);
    });
  }
}
