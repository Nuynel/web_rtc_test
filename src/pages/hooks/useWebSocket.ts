import {useEffect, useRef, useState} from "react";

type sdpMessage = {
  id: string;
  type: RTCSdpType | 'init' | 'update' | 'reject' | 'update_nickname';
  description?: string;
  ids?: {id: string, nickname: string}[],
}

const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [sdpIncomingMessage, setSdpIncomingMessage] = useState<sdpMessage | null>(null);
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [ids, setIds] = useState<{id: string, nickname: string}[]>([]);
  
  useEffect(() => {
    console.log(url)
    ws.current = new WebSocket(url);
    
    ws.current.onopen = () => {
      console.log('[WebSocket] Подключено');
      setIsOpen(true);
    };
    
    ws.current.onmessage = (event) => {
      const message: sdpMessage = JSON.parse(event.data);
      console.log('[WebSocket] Тип сообщения:', message.type);
      if (message.type === 'init' && message.id) {
        setIds(message.ids || [])
        return setPersonalId(message.id);
      }
      if (message.type === 'update') {
        setIds(message.ids || [])
      }
      if (message.type === 'reject') {
        setIsRejected(true)
      }
      setSdpIncomingMessage(message); {
        console.log('Updated ids:', message)
      }
    };
    
    ws.current.onclose = () => {
      console.log('[WebSocket] Отключено');
      setIsOpen(false);
    };
    
    ws.current.onerror = (err) => {
      console.error('[WebSocket] Ошибка', err);
    };
    
    return () => {
      console.log('[WebSocket] Очистка');
      ws.current?.close();
    };
  }, [url]);
  
  const sendWSMessage = (message: sdpMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Соединение не открыто');
    }
  };
  
  return { sendWSMessage, isOpen, personalId, sdpIncomingMessage, setSdpIncomingMessage, ids, isRejected, setIsRejected };
}

export default useWebSocket;