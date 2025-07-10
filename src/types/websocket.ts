export type MessageType = 'text_update' | 'user_joined' | 'user_left' | 'heartbeat' | 'user_list' | 'pixel_update' | 'canvas_state' | 'canvas_clear';

export interface WebSocketMessage {
  type: MessageType;
  content?: string;
  client_id?: string;
  user_list?: string[];
  timestamp: string;
  // Pixel art fields
  x?: number;
  y?: number;
  color?: string;
  pixels?: Record<string, string>;
}

export interface TextUpdateMessage extends WebSocketMessage {
  type: 'text_update';
  content: string;
}

export interface UserJoinedMessage extends WebSocketMessage {
  type: 'user_joined';
  client_id: string;
}

export interface UserLeftMessage extends WebSocketMessage {
  type: 'user_left';
  client_id: string;
}

export interface HeartbeatMessage extends WebSocketMessage {
  type: 'heartbeat';
}

export interface UserListMessage extends WebSocketMessage {
  type: 'user_list';
  user_list: string[];
}

export interface PixelUpdateMessage extends WebSocketMessage {
  type: 'pixel_update';
  x: number;
  y: number;
  color: string;
  client_id: string;
}

export interface CanvasStateMessage extends WebSocketMessage {
  type: 'canvas_state';
  pixels: Record<string, string>;
}

export interface CanvasClearMessage extends WebSocketMessage {
  type: 'canvas_clear';
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface PixelCanvas {
  width: number;
  height: number;
  pixels: Record<string, string>;
}

export interface WebSocketState {
  status: ConnectionStatus;
  messages: WebSocketMessage[];
  connectedUsers: Set<string>;
  error: string | null;
  canvas: PixelCanvas;
}