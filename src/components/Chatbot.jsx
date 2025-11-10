import React, { useState, useEffect, useRef } from "react";
import botAvatar from "../assets/bot-avatar.png";
import bot from "../assets/bot-white.png";
import sendIcon from "../assets/send-icon.svg";

export default function Chatbot({ apiUrl, apiUrlEnglish, apiUrlMalayalam }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const chatRef = useRef(null);

  // Detect if multiple APIs are provided
  const hasMultipleAPIs = apiUrlEnglish && apiUrlMalayalam;

  // Pick active API based on selected language
  const activeApi = hasMultipleAPIs
    ? language === "english"
      ? apiUrlEnglish
      : apiUrlMalayalam
    : apiUrl;

  // Initial bot messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          { sender: "bot", text: "Hello 👋" },
          { sender: "bot", text: "How can I help you today?" },
        ]);
      }, 400);
    }

    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  // Auto-scroll on new message
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // 🧠 Universal API fetch handler
  const fetchBotReply = async (message) => {
    try {
      const res = await fetch(activeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, question: message }),
      });

      if (!res.ok) {
        console.warn("⚠️ API returned non-OK status:", res.status);
        return "Sorry, there was a problem contacting the server 😢";
      }

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.warn("⚠️ Non-JSON response:", text);
        return text || "Received non-JSON response from server 🤔";
      }

      const reply =
        data.answer ||
        data.output ||
        data.response ||
        data.reply ||
        data.message ||
        (Array.isArray(data) && data[0]?.answer) ||
        JSON.stringify(data);

      return reply || "Hmm, I didn’t quite get that 🤔";
    } catch (err) {
      console.error("🚨 Chatbot API Error:", err);
      if (err.message.includes("CORS")) {
        return "CORS error: Please enable CORS on your API server 🙏";
      }
      return "Sorry, there was a network or server issue 😢";
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    const botReply = await fetchBotReply(userInput);

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      setLoading(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 md:right-9 right-4 rounded-full bot-glow-tight cursor-pointer hover:scale-110 transition-transform duration-300 z-[9998]"
        >
          <img
            src={botAvatar}
            alt="Bot"
            className="w-24 h-24 md:w-28 md:h-28 rounded-full"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            fixed inset-0 sm:bottom-[125px] sm:right-9 md:right-12 sm:inset-auto
            w-full h-[100dvh] sm:h-[420px] sm:w-72 md:w-96 ios-safe-height
            bg-white rounded-none sm:rounded-[15px]
            shadow-[-8px_13px_30px_-2px_rgba(59,_130,_246,_0.5)]
            flex flex-col transition-all duration-300 animate-slideUp
            z-[9999]
          "
        >
          {/* Header */}
          <div
            className="
              bg-[#0043FF] flex items-center justify-between px-5 py-3 text-white 
              sm:rounded-t-[15px] shadow-[inset_0px_-12px_22px_-15px_rgba(0,_0,_0,_0.7)]
              sticky top-0 z-10
            "
          >
            <div className="flex items-center gap-4">
              <img src={bot} alt="Bot" className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm md:text-base font-bold tracking-wide">
                  AI Chatbot
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      loading ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></span>
                  <p className="text-xs text-white tracking-wide">
                    {loading ? "Typing..." : "Online"}
                  </p>
                </div>
              </div>
            </div>

            {/* Language Selector (only if both APIs exist) */}
            {hasMultipleAPIs && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ml-2 bg-white/80 text-[#0043FF] text-xs font-semibold px-1 py-1 rounded-md outline-none cursor-pointer"
              >
                <option value="english">English</option>
                <option value="malayalam">Malayalam</option>
              </select>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
              }}
              className="text-xl font-bold hover:opacity-80 transition"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="
              flex-1 p-4 overflow-y-auto bg-white space-y-3 scrollbar-hide 
              mb-[70px] sm:mb-0
            "
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`text-sm px-4 py-2 rounded-2xl max-w-[75%] leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-transparent text-black border border-[#1C3CFF38] rounded-br-none shadow-[inset_5px_0px_17px_-13px_rgba(0,_0,_0,_0.35)]"
                      : "bg-[#0043FF] text-white rounded-bl-none shadow-[inset_-7px_0px_17px_-5px_rgba(0,_0,_0,_0.35)]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0043FF] text-white px-4 py-2 rounded-2xl rounded-bl-none flex items-center shadow-sm">
                  <div className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="px-4 py-3 bg-white sm:rounded-b-3xl fixed bottom-0 left-0 right-0 sm:static">
            <div className="flex items-center bg-white border border-[#194EFF40] rounded-[15px] px-4 py-2 shadow-sm">
              <input
                type="text"
                placeholder="Type your message here..."
                className="flex-1 text-sm text-black placeholder-black/80 bg-transparent outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className={`ml-2 flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
                }`}
              >
                <img src={sendIcon} alt="Send" className="w-7 h-7 object-contain" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .typing {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .typing span {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          animation: bounce 1.3s infinite;
        }
        .typing span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        /* --- iOS Chrome/Safari fix --- */
        @supports (-webkit-touch-callout: none) {
          html, body {
            height: -webkit-fill-available;
          }

          .ios-safe-height {
            height: -webkit-fill-available !important;
            max-height: 100vh;
            overflow: hidden;
          }

          input, textarea, select {
            font-size: 16px !important; /* prevents zoom-in on focus */
          }

          /* Prevent chat from jumping when keyboard opens */
          .fixed {
            position: fixed;
            bottom: 0;
            top: auto;
          }
        }
        /* Hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
        display: none;
        }
        .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
        }
        @keyframes pulseShadow {
        0% {
            transform: rotate(0deg) scale(1);
            filter: drop-shadow(0 0 2px rgba(160, 90, 255, 0.3));
        }
        50% {
            transform: rotate(5deg) scale(1.03);
            filter: drop-shadow(0 0 6px rgba(170, 100, 255, 0.8));
        }
        100% {
            transform: rotate(0deg) scale(1);
            filter: drop-shadow(0 0 2px rgba(160, 90, 255, 0.3));
        }
        }

        .bot-glow-tight {
        animation: pulseShadow 3s infinite ease-in-out;
        border-radius: 65%;
        background: transparent;
        display: inline-block;
        transition: transform 0.3s ease-in-out;
        }

      `}</style>
    </>
  );
}
