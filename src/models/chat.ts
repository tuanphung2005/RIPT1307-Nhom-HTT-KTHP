import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { ChatMessage, ChatResponse, SendMessageData } from '@/services/chat/types';
import { chatService } from '@/services/chat/chatService';

const POLLING_INTERVAL = 3000; // 3 seconds
const VISIBILITY_POLLING_INTERVAL = 10000; // 10 seconds when tab not visible

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
  page: number;
  total: number;
  isPolling: boolean;
  lastRefresh: number;
}

export interface ChatModel {
  // State
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
  page: number;
  total: number;
  isPolling: boolean;
  
  // Actions
  fetchMessages: (page?: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  checkForNewMessages: () => Promise<void>;
}

const INITIAL_STATE: ChatState = {
  messages: [],
  loading: false,
  sending: false,
  hasMore: true,
  page: 1,
  total: 0,
  isPolling: false,
  lastRefresh: 0,
};

export const useChatModel = (): ChatModel => {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  // Check for new messages (smart refresh - only get newer messages)
  const checkForNewMessages = useCallback(async () => {
    if (state.loading || state.sending || isTypingRef.current) return;
    
    try {
      const latestMessageId = state.messages.length > 0 ? state.messages[0].id : null;
      const response: ChatResponse = await chatService.getMessages(1, 20);
      
      if (response.messages.length > 0) {
        // Find new messages
        const newMessages = latestMessageId 
          ? response.messages.filter(msg => msg.id !== latestMessageId && 
              !state.messages.some(existingMsg => existingMsg.id === msg.id))
          : response.messages;
          
        if (newMessages.length > 0) {
          setState(prev => ({
            ...prev,
            messages: [...newMessages, ...prev.messages],
            total: response.total,
            lastRefresh: Date.now(),
          }));
        }
      }
    } catch (error: any) {
      // Silently fail for polling errors to avoid spam
      console.warn('Polling error:', error.message);
    }
  }, [state.loading, state.sending, state.messages]);

  // Start polling for new messages
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    setState(prev => ({ ...prev, isPolling: true }));
    
    const interval = document.hidden ? VISIBILITY_POLLING_INTERVAL : POLLING_INTERVAL;
    pollingIntervalRef.current = setInterval(checkForNewMessages, interval);
  }, [checkForNewMessages]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPolling: false }));
  }, []);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Slow down polling when tab is not visible
      if (pollingIntervalRef.current) {
        stopPolling();
        startPolling();
      }
    } else {
      // Speed up polling when tab becomes visible
      if (pollingIntervalRef.current) {
        stopPolling();
        startPolling();
      }
      // Immediately check for new messages when tab becomes visible
      checkForNewMessages();
    }
  }, [stopPolling, startPolling, checkForNewMessages]);
  // Fetch messages with pagination
  const fetchMessages = useCallback(async (page: number = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response: ChatResponse = await chatService.getMessages(page);
      
      setState(prev => ({
        ...prev,
        messages: page === 1 ? response.messages : [...prev.messages, ...response.messages],
        hasMore: response.hasMore,
        page: response.page,
        total: response.total,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching chat messages:', error);
      message.error(error.message || 'Không thể tải tin nhắn');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Send new message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      message.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      setState(prev => ({ ...prev, sending: true }));
      
      const messageData: SendMessageData = { content: content.trim() };
      const response = await chatService.sendMessage(messageData);
        // Add new message to the beginning of the list
      setState(prev => ({
        ...prev,
        messages: [response.message, ...prev.messages],
        total: prev.total + 1,
        sending: false,
      }));
      
      message.success(response.statusMessage || 'Đã gửi tin nhắn');    } catch (error: any) {
      console.error('Error sending message:', error);
      message.error(error.message || 'Không thể gửi tin nhắn');
      setState(prev => ({ ...prev, sending: false }));
    }
  }, []);

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    await fetchMessages(state.page + 1);
  }, [state.hasMore, state.loading, state.page, fetchMessages]);

  // Refresh messages (reload first page)
  const refresh = useCallback(async () => {
    await fetchMessages(1);
  }, [fetchMessages]);

  // Reset state
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);
  // Load initial messages on mount
  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // Set up polling and visibility change listener
  useEffect(() => {
    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling, handleVisibilityChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);
  return {
    messages: state.messages,
    loading: state.loading,
    sending: state.sending,
    hasMore: state.hasMore,
    page: state.page,
    total: state.total,
    isPolling: state.isPolling,
    fetchMessages,
    sendMessage,
    loadMore,
    refresh,
    reset,
    startPolling,
    stopPolling,
    checkForNewMessages,
  };
};
