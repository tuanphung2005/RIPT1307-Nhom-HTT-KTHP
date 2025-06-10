export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    role: string;
    avatar?: string;
  };
}

export interface ChatResponse {
  success: boolean;
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  message?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
  statusMessage?: string;
}

export interface SendMessageData {
  content: string;
}
