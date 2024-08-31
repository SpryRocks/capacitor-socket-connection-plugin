export interface SocketOptions {}

export type SocketState =
  | 'initial'
  | 'opening'
  | 'opened'
  | 'closing'
  | 'closed'
  | 'error';

export type SocketData = Uint8Array;

export type OnStateChanged = (state: SocketState) => void;

export type OnSocketData = (data: SocketData) => void;
export type OnSocketClose = () => void;
export type OnSocketError = (error: unknown) => void;
