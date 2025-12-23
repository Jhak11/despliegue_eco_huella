import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import './ChatWidget.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showHook, setShowHook] = useState(false);
    const [hookMessage, setHookMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const hasFetchedHook = useRef(false);

    // Initial Hook Fetch
    useEffect(() => {
        if (!hasFetchedHook.current) {
            fetchHook();
            hasFetchedHook.current = true;
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const fetchHook = async () => {
        try {
            const { data } = await api.get('/chat/hook');
            if (data.hook) {
                setHookMessage(data.hook);
                // Delay showing hook slightly for effect
                setTimeout(() => setShowHook(true), 2000);
            }
        } catch (error) {
            console.error("Failed to fetch hook", error);
        }
    };

    const toggleChat = () => {
        if (!isOpen && showHook) {
            // Opening from hook click or fab click while hook is visible
            handleOpenChatWithHook();
        } else {
            // Normal toggle
            setIsOpen(!isOpen);
            setShowHook(false); // Hide hook if opening
        }

        if (!isOpen && messages.length === 0 && !hookMessage) {
            // Initial greeting if no hook and fresh chat
            setMessages([{
                id: 1,
                sender: 'bot',
                text: "¡Hola! Soy EcoBot 🤖. ¿En qué puedo ayudarte a reducir tu huella hoy?"
            }]);
        }
    };

    const handleOpenChatWithHook = async () => {
        setIsOpen(true);
        setShowHook(false);

        // Add implicit user message about the hook
        const initialMsg = `Cuéntame más sobre: "${hookMessage}"`;

        // Standard user message structure
        const userMsg = { id: Date.now(), sender: 'user', text: initialMsg };
        setMessages([userMsg]);
        setIsLoading(true);

        try {
            const { data } = await api.post('/chat/message', {
                message: initialMsg,
                history: []
            });

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.reply
            }]);
        } catch (error) {
            const errorMessage = error.response?.data?.details || error.response?.data?.error || "Lo siento, tuve un problema de conexión.";
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `⚠️ ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue("");

        const newMsg = { id: Date.now(), sender: 'user', text: userText };
        setMessages(prev => [...prev, newMsg]);
        setIsLoading(true);

        try {
            // Filter history for API
            const history = messages.map(m => ({ sender: m.sender, text: m.text }));

            const { data } = await api.post('/chat/message', {
                message: userText,
                history
            });

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.reply
            }]);
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || "Error de conexión con EcoBot.";
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: `⚠️ ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const closeHook = (e) => {
        e.stopPropagation();
        setShowHook(false);
    };

    return (
        <div className="chat-widget-container">
            {/* Hook Bubble */}
            <AnimatePresence>
                {showHook && !isOpen && (
                    <motion.div
                        className="hook-bubble"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        onClick={handleOpenChatWithHook}
                    >
                        <button className="hook-close" onClick={closeHook}>×</button>
                        <div className="hook-text">
                            💡 {hookMessage}
                        </div>
                        <div className="hook-arrow"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        <div className="chat-header">
                            <div className="header-title">
                                <span><img src="/assets/golemino_bot.png?v=2" alt="Bot" style={{ width: '28px', height: '28px', verticalAlign: 'middle' }} /></span> EcoBot AI
                            </div>
                            <button className="header-close" onClick={() => setIsOpen(false)}>_</button>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.sender}`}>
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message bot">
                                    <div className="message-bubble typing">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribe tu duda..."
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !inputValue.trim()}>
                                ➤
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
                className="chat-fab"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
            >
                {isOpen ? '✕' : <img src="/assets/golemino_bot.png?v=3" alt="Chat" className="chat-fab-icon" />}
            </motion.button>
        </div>
    );
}
