'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanContext?: any;
}

export default function AIChatModal({ isOpen, onClose, scanContext }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(3);
  const [isPremium, setIsPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your skincare advisor. I can help with questions about skincare routines, ingredients, and general skin health tips. How can I help you today?\n\n*Note: I provide general guidance only. For medical concerns, please consult a dermatologist.*",
      }]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          scanContext,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "You've used your 3 free questions for today. Upgrade to Premium for unlimited skincare advice!",
        }]);
        setQuestionsRemaining(0);
      } else if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        if (data.allowance) {
          setQuestionsRemaining(data.allowance.questions_remaining);
          setIsPremium(data.allowance.is_premium);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
      }]);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        height: '80vh',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Skincare Advisor</h3>
            <p style={{ fontSize: '13px', color: '#888' }}>
              {isPremium ? 'Unlimited questions' : `${questionsRemaining} questions remaining today`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? '#0a0a0a' : '#f5f5f5',
                color: msg.role === 'user' ? 'white' : '#0a0a0a',
                fontSize: '14px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#f5f5f5',
                color: '#888',
              }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '12px',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={questionsRemaining > 0 ? "Ask about skincare..." : "Daily limit reached"}
            disabled={questionsRemaining === 0 && !isPremium}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || (questionsRemaining === 0 && !isPremium)}
            style={{
              padding: '12px 20px',
              background: '#0a0a0a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              opacity: (!input.trim() || loading) ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '12px 20px',
          background: '#fffbeb',
          borderTop: '1px solid #fef3c7',
          fontSize: '11px',
          color: '#92400e',
          textAlign: 'center',
        }}>
          ⚠️ This is general guidance only, not medical advice. Consult a dermatologist for diagnosis.
        </div>
      </div>
    </div>
  );
}
