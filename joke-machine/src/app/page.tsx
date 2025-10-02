"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("anthropic:claude-opus-4-20250514");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [userMessage] }),
      });

      const data = await res.json();
      const content =
        data?.messages?.[0]?.content ||
        `⚠️ Debug Info: ${JSON.stringify(data)}`;

      setMessages((prev) => [...prev, { role: "assistant", content }]);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Request failed: ${err.message}` },
      ]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#eaf0ff] to-[#dbe5ff] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white shadow-md rounded-full px-6 py-3 border border-gray-100">
        <Bot className="text-blue-600 w-5 h-5" />
        <h1 className="text-lg font-semibold text-gray-800">Joke Bot</h1>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="ml-4 text-sm border border-gray-200 rounded-full bg-gray-50 px-3 py-1 text-gray-600 focus:ring-2 focus:ring-blue-400"
        >
          <option value="anthropic:claude-opus-4-20250514">
            Anthropic Claude Opus
          </option>
          <option value="mistral:mistral-medium-latest">
            Mistral Medium
          </option>
          <option value="ollama:llama2:latest">Ollama LLaMA 2 (local)</option>
        </select>
      </div>

      {/* Chat Window */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400">
              💬 No jokes yet — ask me something funny!
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {m.role === "assistant" && (
                  <Bot className="w-4 h-4 text-blue-600 mt-1" />
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[75%] ${m.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <User className="w-4 h-4 text-blue-600 mt-1" />
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center border-t border-gray-200 bg-white p-3"
        >
          <input
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your joke request..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="ml-3 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 mt-4">
        Powered by Anthropic · Mistral · Ollama
      </p>
    </main>
  );
}
