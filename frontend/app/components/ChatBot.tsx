"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useChat } from "../hooks/useChat";
import Loading from "./Loading";
import api from "../utils/api";

function renderMessageText(text: string) {
  const tokenRegex = /(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g;
  const parts = text.split(tokenRegex);
  return parts.map((part, i) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 underline break-all hover:text-orange-300"
        >
          {part}
        </a>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatBot() {
  const { messages, isLoading, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (reference && typeof reference === "string") {
      verifyPayment(reference);
    } else {
      resetSession();
    }
  }, [reference]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    await sendMessage(text);
  };

  const resetSession = async () => {
    try {
      await api.get("/reset");
    } catch (error) {
      console.error("Reset session error:", error);
      toast.error("Failed to reset session. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const verifyPayment = async (ref: string) => {
    setPageLoading(true);
    try {
      await api.get(`/verify-payment/${ref}`);
      toast.success("Payment verified successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setTimeout(() => {
        setPageLoading(false);
        router.replace("/");
      }, 3500);
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* CHAT HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-lg z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-lg text-white font-bold text-xl tracking-wider">
            RB
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">BiteBot</h1>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors border border-slate-700"
        >
          Reset Session
        </button>
      </header>

      {/* MESSAGE AREA */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md whitespace-pre-line text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-orange-500 text-white rounded-tr-none"
                  : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
              }`}
            >
              {renderMessageText(msg.text)}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT FOOTER */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800">
        {isLoading && (
          <div className="flex items-center space-x-2 pb-3 px-2">
            <span className="text-xs text-slate-400 font-medium">
              BiteBot is thinking
            </span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={
              isLoading ? "Waiting for response..." : "Type an option number..."
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 text-slate-200 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
