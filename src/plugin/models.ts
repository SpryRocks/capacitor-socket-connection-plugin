export type SocketUuid = string;
export type NativeLink = {uuid: SocketUuid};
export type OpenConnectionOptions = {
  host: string;
  port: number;
};
export type OpenConnectionResult = {link: NativeLink};
export type CloseConnectionOptions = {link: NativeLink};
export type CloseConnectionResult = void;
export type SendDataOptions = {link: NativeLink; data: number[]};
export type SendDataResult = void;

export enum PluginEvents {
  OnData = 'OnData',
  OnClose = 'OnClose',
  OnError = 'OnError',
}

export type ErrorObject = {message: string};

export type Byte = number;
export type ByteArray = Array<Byte>;
export type BaseEvent = {socketUuid: SocketUuid};
export type OnDataEvent = BaseEvent & {data: ByteArray};
export type OnCloseEvent = BaseEvent;
export type OnErrorEvent = BaseEvent & {error: ErrorObject};
