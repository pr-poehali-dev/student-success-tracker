/**
 * WebSocket-like клиент для real-time синхронизации через Long Polling
 */

// WebSocket-like endpoint для real-time синхронизации
const WS_URL = "https://functions.poehali.dev/b13884b0-1b22-4c1c-a17d-4be8f6c23604";

export interface WSChange {
  type: string;
  data: unknown;
  author: string;
  timestamp: number;
}

export interface OnlineUser {
  id: string;
  name: string;
  last_seen: number;
}

export interface WSClient {
  connect: (userId: string, userName: string) => void;
  disconnect: () => void;
  sendChange: (type: string, data: unknown, author: string) => Promise<void>;
  onChanges: (callback: (changes: WSChange[]) => void) => void;
  onOnlineUsers: (callback: (users: OnlineUser[]) => void) => void;
  isConnected: () => boolean;
}

export const createWSClient = (): WSClient => {
  let pollInterval: NodeJS.Timeout | null = null;
  let lastTimestamp = 0;
  let isActive = false;
  let currentUserId = '';
  let currentUserName = '';
  let changeCallback: ((changes: WSChange[]) => void) | null = null;
  const onlineUsersCallback: ((users: OnlineUser[]) => void) | null = null;
  
  const poll = async () => {
    if (!isActive) return;
    
    try {
      const response = await fetch(`${WS_URL}?since=${lastTimestamp}&userId=${currentUserId}&userName=${encodeURIComponent(currentUserName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error("❌ [WS] Poll failed:", response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.changes && data.changes.length > 0) {
        console.log(`📥 [WS] Received ${data.changes.length} changes`);
        
        // Обновляем timestamp
        lastTimestamp = data.timestamp;
        
        // Вызываем callback с изменениями
        if (changeCallback) {
          changeCallback(data.changes);
        }
      }
      
      // Обновляем список онлайн пользователей
      if (data.online_users && onlineUsersCallback) {
        onlineUsersCallback(data.online_users);
      }
    } catch (error) {
      console.error("❌ [WS] Poll error:", error);
    }
  };
  
  return {
    connect: (userId: string, userName: string) => {
      if (isActive) return;
      
      currentUserId = userId;
      currentUserName = userName;
      
      console.log("🔌 [WS] Connecting...", { userId, userName });
      isActive = true;
      lastTimestamp = Date.now() / 1000; // Начинаем с текущего времени
      
      // Опрашиваем каждые 3 секунды (быстрее чем 30 сек polling)
      pollInterval = setInterval(poll, 3000);
      
      // Сразу делаем первый запрос
      poll();
    },
    
    disconnect: () => {
      console.log("🔌 [WS] Disconnecting...");
      isActive = false;
      
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    },
    
    sendChange: async (type: string, data: unknown, author: string) => {
      try {
        const response = await fetch(WS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type,
            data,
            author
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log(`📤 [WS] Sent change: ${type} by ${author}`);
      } catch (error) {
        console.error("❌ [WS] Send error:", error);
        throw error;
      }
    },
    
    onChanges: (callback: (changes: WSChange[]) => void) => {
      changeCallback = callback;
    },
    
    onOnlineUsers: (callback: (users: OnlineUser[]) => void) => {
      onlineUsersCallback = callback;
    },
    
    isConnected: () => isActive
  };
};