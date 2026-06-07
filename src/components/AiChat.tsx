import { FormEvent, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types';

interface Props { messages: ChatMessage[]; onSend: (text: string) => void; }
const suggestions = ['حلل الأرض', 'عطني أفضل أرض', 'قارن أفضل ٥ قطع', 'أقل مخاطر'];

export default function AiChat({ messages, onSend }: Props) {
  const [text, setText] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }
  return (
    <div className="chat-card">
      <div className="chat-head"><div><Bot size={22}/><h3>بن دايل AI</h3></div><span><Sparkles size={14}/> مساعد ذكي</span></div>
      <div className="messages">
        {messages.map((m, i) => <div className={`message ${m.role}`} key={i}>{m.content}</div>)}
      </div>
      <div className="suggestions">{suggestions.map((s) => <button key={s} onClick={() => onSend(s)}>{s}</button>)}</div>
      <form onSubmit={submit} className="chat-form"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="اسأل بن دايل عن القطعة..." /><button><Send size={18}/></button></form>
    </div>
  );
}
