import { useState } from 'react';

const AskCopilotChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your FPL Copilot. Ask me questions like:\n\n• Why is Palmer recommended as captain?\n• Should I transfer out Saka?\n• What's the risk of this move?",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');

    // Stubbed response
    setTimeout(() => {
      const response =
        "Based on your sandbox state and current squad, here's my recommendation:\n\n✓ Palmer is your best captain choice (7.8 xPts)\n✓ Consider benching Saka due to injury\n⚠ Risk: Limited bench depth if injuries occur\n\n[This is a stubbed response. Full AI integration coming soon!]";
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Ask Copilot</h2>
        <p className="text-xs text-slate-400 mt-1">Get AI-powered advice</p>
      </div>
      <div className="px-5 py-4 max-h-80 overflow-y-auto flex-1">
        <div className="space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-600'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg border border-emerald-700 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskCopilotChat;
