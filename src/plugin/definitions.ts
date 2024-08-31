import {
  CloseConnectionOptions,
  CloseConnectionResult,
  OpenConnectionOptions,
  OpenConnectionResult,
  SendDataOptions,
  SendDataResult,
} from './models';

export interface ICapacitorSocketConnectionDefinitions {
  openConnection(options: OpenConnectionOptions): Promise<OpenConnectionResult>;
  closeConnection(options: CloseConnectionOptions): Promise<CloseConnectionResult>;
  sendData(options: SendDataOptions): Promise<SendDataResult>;
}
