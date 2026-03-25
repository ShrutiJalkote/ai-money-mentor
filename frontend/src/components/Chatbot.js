import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import ReactMarkdown from "react-markdown";

function Chatbot({ income, expenses }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🎤 Voice Input
  const startListening = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech recognition not supported");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.start();

      recognition.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };
    } catch (err) {
      console.error(err);
    }
  };

  // 📩 Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, type: "user" }];
    setMessages(newMessages);

    try {
      const res = await axios.post(`${BASE_URL}/chat`, {
        message: input,
        income: Number(income),
        expenses: Number(expenses),
      });

      setMessages((prev) => [
        ...prev,
        { text: res.data.reply, type: "bot" },
      ]);
    } catch (err) {
      alert("Error connecting to AI");
    }

    setInput("");
  };

  // ⌨️ Enter key support
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="card">
      <h3>🤖 AI Assistant</h3>

      {/* 💬 Chat Messages */}
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={m.type}>
            <ReactMarkdown>{m.text}</ReactMarkdown>
          </div>
        ))}
      </div>

      {/* 🧠 Input + Buttons */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything about your money..."
        />

        <button className="send-btn" onClick={sendMessage}>
          Send
        </button>

        <button className="mic-btn" onClick={startListening}>
          🎤
        </button>
      </div>
    </div>
  );
}

export default Chatbot;