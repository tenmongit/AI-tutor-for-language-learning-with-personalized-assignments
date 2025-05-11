import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function ChatWithAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Add initial welcome message
    setMessages([
      {
        role: "ai",
        content: "¡Hola! I'm your LinguaAI tutor. How can I help you today with your language learning?"
      }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput("");
    
    try {
      // Call the backend API
      const response = await api.post("/chat", { message: input });
      setMessages(prev => [...prev, { role: "ai", content: response.data.reply }]);
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Sorry, I encountered an error. Please try again later." 
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Chat with LinguaAI</h2>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <i className="fas fa-microphone"></i>
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="h-96 overflow-y-auto mb-4 space-y-4 pr-2" 
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start space-x-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <i className="fas fa-robot text-indigo-600"></i>
                </div>
              )}
              
              <div className={`chat-message ${msg.role} max-w-xs lg:max-w-md px-4 py-3`}>
                <p>{msg.content}</p>
              </div>
              
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <i className="fas fa-robot text-indigo-600"></i>
              </div>
              <div className="chat-message ai max-w-xs lg:max-w-md px-4 py-3">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..." 
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
