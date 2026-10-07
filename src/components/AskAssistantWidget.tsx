import React, { useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import { askAIAssistant } from '../services/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AskAssistantWidget: React.FC<{ role: string }> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello! I am your NHS Digital Assistant. How can I assist you with clinical guidelines, triage questions, appointments, or hospital services today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await askAIAssistant(userText, role);
      setMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'I am having trouble connecting to NHS Services. For emergencies, please call 999 immediately.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Pill Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-5 z-40 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open digital assistant"
            className="flex items-center gap-2 px-4 py-2 bg-nhs-blue hover:bg-nhs-dark text-white rounded-full shadow-sm text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
          >
            <Bot className="w-4 h-4" />
            <span>Automated assistant, not a doctor</span>
          </button>
        )}
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-5 z-50 w-[92vw] sm:w-96 bg-white rounded-lg border border-nhs-border shadow-sm overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-nhs-blue text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <p className="font-semibold text-sm">Digital Assistant</p>
                <p className="text-xs text-blue-100">Decision support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close digital assistant"
              className="p-1.5 hover:bg-nhs-dark rounded-md"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="bg-red-50 border-b border-red-200 px-3 py-2 text-xs font-medium text-red-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <span>This is an automated assistant, not a doctor. For medical emergencies, call 999.</span>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-nhs-bg text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded bg-nhs-dark text-white flex items-center justify-center flex-shrink-0 font-medium text-xs">
                    NHS
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-nhs-blue text-white'
                      : 'bg-white text-nhs-text border border-nhs-border'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-nhs-muted text-sm py-1">
                <Loader2 className="w-4 h-4 animate-spin text-nhs-blue" />
                Processing...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-nhs-border bg-white flex items-center gap-2">
            <label htmlFor="ai-chat-input" className="sr-only">Ask a question</label>
            <input
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 border border-nhs-border rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="p-2 bg-nhs-blue hover:bg-nhs-dark text-white rounded-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
