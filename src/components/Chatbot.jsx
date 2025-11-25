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
  const [showDropdown, setShowDropdown] = useState(false);

  

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
        if (language === "malayalam") {
          setMessages([
            { sender: "bot", text: "ഹലോ 👋" },
            { sender: "bot", text: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?" },
          ]);
        } else {
          setMessages([
            { sender: "bot", text: "Hello 👋" },
            { sender: "bot", text: "How can I help you today?" },
          ]);
        }
      }, 400);
    }

    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen, language]);

  // Auto-scroll on new message
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);


// Auto-format all bot replies
function autoFormat(text) {
  if (!text) return "";

  return text
    // Bold "Key: Value"
    .replace(/([A-Za-z0-9 _-]+):/g, "<b>$1:</b>")
    // Replace new lines with HTML line break
    .replace(/\n/g, "<br/>")
    // Convert long dashes into section divider
    .replace(/-{3,}/g, "<hr/>");
}



  const fetchBotReply = async (message) => {
    try {
      const res = await fetch(activeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        console.warn("⚠️ API returned non-OK status:", res.status);
        return language === "malayalam"
          ? "ക്ഷമിക്കുക, സെർവറുമായി ബന്ധപ്പെടുന്നതിനിടെ പ്രശ്നം ഉണ്ടായി 😢"
          : "Sorry, there was a problem contacting the server 😢";
      }

      const data = await res.json();

      let reply = "";
      if (Array.isArray(data) && data.length > 0 && data[0].answer) {
        reply = data[0].answer;
      } else if (data.output) {
        reply = data.output;
      } else {
        reply = data.reply || data.message || JSON.stringify(data);
      }

      return reply || (language === "malayalam"
        ? "ഹും, അത് എനിക്ക് വ്യക്തമായില്ല 🤔"
        : "Hmm, I didn’t quite get that 🤔");
    } catch (err) {
      console.error("🚨 Chatbot API Error:", err);
      if (err.message.includes("CORS")) {
        return language === "malayalam"
          ? "CORS പിശക്: നിങ്ങളുടെ API സെർവറിൽ CORS പ്രവർത്തനക്ഷമമാക്കുക."
          : "CORS error: Please enable CORS on your API server.";
      }
      return language === "malayalam"
        ? "ക്ഷമിക്കുക, നെറ്റ്‌വർക്ക് അല്ലെങ്കിൽ സെർവർ പ്രശ്നം ഉണ്ടായി 😢"
        : "Sorry, there was a network or server issue 😢";
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
//       setMessages((prev) => [
//   ...prev,
//   { sender: "bot", text: formatBotReply(botReply), formatted: true }
// ]);
setMessages((prev) => [
  ...prev,
  { sender: "bot", text: autoFormat(botReply) }
]);

      setLoading(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-3 md:right-9 right-4 rounded-full bot-glow-tight cursor-pointer transition-transform duration-300 z-[9998]
            ${isOpen ? "scale-90 opacity-90 hover:scale-100" : "hover:scale-110"}
        `}
      >
        <img
          src={botAvatar}
          alt="Bot"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            fixed inset-0 sm:bottom-[110px] sm:right-9 md:right-12 sm:inset-auto
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
                    {loading
                      ? language === "malayalam"
                        ? "ടൈപ്പിംഗ്..."
                        : "Typing..."
                      : language === "malayalam"
                      ? "ഓൺലൈൻ"
                      : "Online"}
                  </p>
                </div>
              </div>
            </div>

            {/* Language Selector (only if both APIs exist) */}
            {hasMultipleAPIs && (
              <div className="relative">
                {/* Dropdown Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="
                    bg-white/90 text-[#0043FF] text-xs font-semibold 
                    px-3 py-1.5 rounded-lg flex items-center gap-2 
                    border border-[#ffffff50] shadow-sm
                    hover:bg-white transition-all duration-200
                  "
                >
                  {language === "english" ? "English" : "Malayalam "}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    className="
                    absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg 
                    border border-[#e3e8ff] overflow-hidden z-[99999] animate-fadeIn
                    "
                  >
                    <button
                      onClick={() => {
                        setLanguage("english");
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-xs font-medium text-[#0043FF] hover:bg-[#0043FF]/10 transition ${
                        language === "english" ? "bg-[#0043FF]/10" : ""
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("malayalam");
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-xs font-medium text-[#0043FF] hover:bg-[#0043FF]/10 transition ${
                        language === "malayalam" ? "bg-[#0043FF]/10" : ""
                      }`}
                    >
                      Malayalam
                    </button>
                  </div>
                )}
              </div>
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
                    {...(msg.sender === "bot"
    ? { dangerouslySetInnerHTML: { __html: msg.text } }
    : {})}
                >
                  {msg.sender === "user" ? msg.text : null}

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
                placeholder={
                  language === "malayalam"
                    ? "നിങ്ങളുടെ സന്ദേശം ഇവിടെ ടൈപ്പ് ചെയ്യൂ..."
                    : "Type your message here..."
                }
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
                <img
                  src={sendIcon}
                  alt="Send"
                  className="w-7 h-7 object-contain"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
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
            font-size: 16px !important;
          }
          .fixed {
            position: fixed;
            bottom: 0;
            top: auto;
          }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulseShadow {
          0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(160,90,255,0.3)); }
          50% { transform: rotate(5deg) scale(1.03); filter: drop-shadow(0 0 6px rgba(170,100,255,0.8)); }
          100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(160,90,255,0.3)); }
        }
        .bot-glow-tight {
          animation: pulseShadow 3s infinite ease-in-out;
          border-radius: 65%;
          background: transparent;
          display: inline-block;
          transition: transform 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
