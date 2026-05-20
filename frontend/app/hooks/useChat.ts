import { useState, useCallback } from "react";
import api from "../utils/api";

export type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
};

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME_MESSAGE: Message = {
  id: 1,
  sender: "bot",
  text: "Welcome! 🍔\n\nSelect 1 to Place an order\nSelect 99 to checkout order\nSelect 98 to see order history\nSelect 97 to see current order\nSelect 0 to cancel order",
  time: now(),
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const appendMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { id: Date.now(), ...msg }]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      appendMessage({ sender: "user", text, time: now() });
      setIsLoading(true);

      try {
        const response = await api.post<{ reply: string }>("/chat", { message: text });
        appendMessage({
          sender: "bot",
          text: response.data.reply || "No response from server.",
          time: now(),
        });
      } catch (error) {
        console.error("Chat error:", error);
        appendMessage({
          sender: "bot",
          text: "An error occurred while communicating with the server. Please try again.",
          time: now(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage],
  );

  return { messages, isLoading, sendMessage };
}
