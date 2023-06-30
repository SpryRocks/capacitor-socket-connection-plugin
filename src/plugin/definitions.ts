import {
  CloseConnectionOptions,
  CloseConnectionResult,
  OpenConnectionOptions,
  OpenConnectionResult,
  SendDataOptions,
  SendDataResult,
} from './models';

type CapPluginListener = (event: unknown) => void;

export type CapPlugin = {
  addListener: (name: string, listener: CapPluginListener) => void;
};

export interface ICapacitorSocketConnectionDefinitions {
  openConnection(options: OpenConnectionOptions): Promise<OpenConnectionResult>;
  closeConnection(options: CloseConnectionOptions): Promise<CloseConnectionResult>;
  sendData(options: SendDataOptions): Promise<SendDataResult>;
}
