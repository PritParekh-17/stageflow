"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type WsConnectionStatus = "CONNECTED" | "CONNECTING" | "RECONNECTING" | "DISCONNECTED";

interface UseWebSocketOptions {
  eventId: number | string;
  onMessage?: (data: any) => void;
  enabled?: boolean;
}

export function useWebSocket({ eventId, onMessage, enabled = true }: UseWebSocketOptions) {
  const [status, setStatus] = useState<WsConnectionStatus>("DISCONNECTED");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!enabled || !eventId) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_HOST || "127.0.0.1:8000";
    const wsUrl = `${wsProtocol}//${host}/ws/events/${eventId}`;

    try {
      setStatus(reconnectAttemptsRef.current > 0 ? "RECONNECTING" : "CONNECTING");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("CONNECTED");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(parsed);
          }
        } catch (_) {
          // ignore non-json messages
        }
      };

      ws.onclose = () => {
        setStatus("DISCONNECTED");
        // Reconnect after delay
        if (reconnectAttemptsRef.current < 10) {
          const timeout = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, timeout);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (_) {
      setStatus("DISCONNECTED");
    }
  }, [enabled, eventId]);

  useEffect(() => {
    if (enabled && eventId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, enabled, eventId]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  return { status, send };
}
