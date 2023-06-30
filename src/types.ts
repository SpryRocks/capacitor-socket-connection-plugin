import {SocketConnectionError} from './error';

export interface SocketOptions {}

export type SocketData = Uint8Array;

export type OnSocketData = (data: SocketData) => void;
export type OnSocketClose = () => void;
export type OnSocketError = (error: SocketConnectionError) => void;
