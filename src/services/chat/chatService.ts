import { authService } from '../auth/authService';
import { backendApiService } from '../api/backendApi';
import { API_CONFIG } from '../api/config';
import type { ChatResponse, SendMessageResponse, SendMessageData } from './types';

class ChatService {
  // Get chat messages
  async getMessages(page: number = 1, limit: number = 50): Promise<ChatResponse> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Bạn cần đăng nhập để xem chat');
      }

      const response = await backendApiService.get(
        `${API_CONFIG.ENDPOINTS.CHAT.MESSAGES}?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        messages: response.data || [],
        total: response.total || 0,
        page: response.page || page,
        limit: response.limit || limit,
        hasMore: response.hasMore || false,
        message: response.message
      };
    } catch (error: any) {
      console.error('Error getting chat messages:', error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tải tin nhắn');
    }
  }

  // Send a chat message
  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('Bạn cần đăng nhập để gửi tin nhắn');
      }

      const response = await backendApiService.post(API_CONFIG.ENDPOINTS.CHAT.SEND, data);

      return {
        success: true,
        message: response.data,
        statusMessage: response.message || 'Tin nhắn đã được gửi!'
      };
    } catch (error: any) {
      console.error('Error sending chat message:', error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    }
  }
}

export const chatService = new ChatService();
export { ChatService };
export default chatService;
