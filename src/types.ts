import { serverMessageKeys } from "./constants";

export interface ClientConfig {
  apiHostname: string;
  apiKey?: string;
  apiPath: string;
  apiPort: number;
  apiProtocol: string;
  apiProvider: string;
  discoveryKey: string;
  key: string;
  modelName: string;
  path: string;
  port: number;
  public: boolean;
  serverKey: string;
}

export interface ServerConfig {
  path: string;
  webSocketPort: number;
}

export interface ClientMessage<T = unknown> {
  key: string;
  data: T;
}

export interface Peer {
  publicKey: Buffer;
  write: (value: string) => boolean;
  on: (key: string, cb: (data: Buffer) => void) => void;
  once: (key: string, cb: (data: Buffer) => void) => void;
  writable: boolean;
  key: string;
  discovery_key: string;
}

export interface Session {
  id: string;
  providerId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface PeerSessionRequest {
  modelName: string;
  preferredProviderId?: string;
}

export interface PeerWithSession extends Session {
  peer_key: string | null;
  discovery_key: string | null;
  model_name: string | null;
}

export interface PeerUpsert {
  key: string;
  discoveryKey: string;
  config: {
    gpuMemory?: number;
    modelName?: string;
    public?: boolean;
    serverKey?: string;
  }
}

export interface Message {
  role: string;
  content: string | undefined;
}

export type ServerMessageKey = keyof typeof serverMessageKeys;
