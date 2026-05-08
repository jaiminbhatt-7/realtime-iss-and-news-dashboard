import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { HfInference } from '@huggingface/inference';

const CHAT_HISTORY_KEY = 'chatbot_history';

export default function Chatbot({ issData, newsData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize HF client
  const hfToken = import.meta.env.VITE_AI_TOKEN;
  const hf = hfToken ? new HfInference(hfToken) : null;

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I can answer questions about the current ISS location, speed, and the latest space news shown on this dashboard.' }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    const initialMsg = [{ role: 'assistant', content: 'Hello! I can answer questions about the current ISS location, speed, and the latest space news shown on this dashboard.' }];
    setMessages(initialMsg);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(initialMsg));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !hf) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    
    // Keep only last 30 messages
    const trimmedMessages = newMessages.length > 30 ? newMessages.slice(newMessages.length - 30) : newMessages;
    
    setMessages(trimmedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build context from dashboard data
      const issContext = `ISS is currently located at latitude ${issData.currentPos?.lat?.toFixed(2) || 'unknown'}, longitude ${issData.currentPos?.lon?.toFixed(2) || 'unknown'}, above ${issData.locationName}. Its speed is ${issData.currentSpeed?.toFixed(0) || 'unknown'} km/h. There are ${issData.astronauts?.number || 0} people in space.`;
      
      const newsContext = `Latest news summaries: ${newsData.articles.slice(0, 5).map(a => `- ${a.title}`).join('. ')}. Total articles available: ${newsData.articles.length}.`;

      const systemPrompt = `You are a helpful dashboard assistant. You MUST ONLY answer questions using the following dashboard data. DO NOT use outside internet knowledge. DO NOT guess. If the answer is not in the data, say "I don't have information about that in the current dashboard data."
      
      DATA:
      ${issContext}
      ${newsContext}`;

      const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          { role: 'system', content: systemPrompt },
          ...trimmedMessages
        ],
        max_tokens: 150,
        temperature: 0.1,
      });

      const aiResponse = response.choices[0].message.content.trim();
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant', content: aiResponse }];
        return updated.length > 30 ? updated.slice(updated.length - 30) : updated;
      });

    } catch (err) {
      console.error("Chatbot error", err);
      let errorMessage = "Sorry, I encountered an error. Please check your Hugging Face API key or try again later.";
      
      if (err.httpResponse && err.httpResponse.body && err.httpResponse.body.error) {
        const hfError = err.httpResponse.body.error;
        if (hfError.message && hfError.message.includes('provider you have enabled')) {
          errorMessage = `Hugging Face requires you to enable a free Inference Provider. Please go to your Hugging Face Account Settings -> Inference Providers and connect a free provider (like Together or Featherless) to use the Mistral model.`;
        } else {
          errorMessage = `API Error: ${hfError.message || hfError}`;
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform ${isOpen ? 'scale-0' : 'scale-100'} z-50`}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-card text-card-foreground border rounded-lg shadow-xl flex flex-col transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'} h-[500px] max-h-[80vh]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50 rounded-t-lg">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare size={18} /> Dashboard AI
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} title="Clear Chat" className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground">
              <Trash2 size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hfToken && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded mb-2">
              Warning: VITE_AI_TOKEN is not configured. Chatbot will not work.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-lg rounded-tl-none text-sm flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t bg-muted/20">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ISS or News..."
              className="flex-1 px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
