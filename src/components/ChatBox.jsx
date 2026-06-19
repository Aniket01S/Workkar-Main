import React, { useState, useEffect, useRef } from 'react';
import { useWorkkar } from '../context/WorkkarContext';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBox({ jobId, currentUserId, title = "Live Chat" }) {
  const { getMessages, sendMessage } = useWorkkar();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Poll messages every 3 seconds
  useEffect(() => {
    let active = true;

    const fetchMsgs = async () => {
      const msgs = await getMessages(jobId);
      if (active) {
        setMessages(msgs);
        setLoading(false);
      }
    };

    fetchMsgs(); // Initial fetch

    const interval = setInterval(fetchMsgs, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText(''); // optimistic clear

    const newMsg = await sendMessage(jobId, textToSend);
    if (newMsg) {
      setMessages(prev => [...prev, newMsg]);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <MessageSquare size={15} className="text-blue-500 dark:text-blue-400" />
          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 uppercase tracking-widest font-mono">
            {title}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/30">
          Secure Link
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center p-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-full mb-3 border border-blue-500/10">
              <MessageSquare size={28} className="text-blue-500/60 dark:text-blue-400/60" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300">Start the Chat</p>
            <p className="opacity-80 mt-1 max-w-[200px]">Send a message to sync service details with your partner.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg._id || msg.id}
                    className={`flex flex-col max-w-[82%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5 px-1 tracking-wide">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words font-medium shadow-sm transition-all ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-500/10'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tl-none shadow-slate-100/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 px-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer border-none shrink-0"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
