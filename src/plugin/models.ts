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

export type OnDataEvent = {socketUuid: SocketUuid; data: number[]};
export type OnCloseEvent = {socketUuid: SocketUuid};
export type OnErrorEvent = {socketUuid: SocketUuid};
