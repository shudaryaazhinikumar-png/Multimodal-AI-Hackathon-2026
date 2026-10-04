import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  FileText,
  Presentation,
  Video,
  BookOpen,
  Layers,
  Lightbulb,
  BookMarked,
  Repeat2,
  ChevronDown,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentPanel } from '@/components/AgentPanel';
import { toast } from '@/components/ui/Toast';
import { mockChatHistory, mockChatSources, mockAiResponses, defaultAiResponse, mockAgentActivities } from '@/data/mockChat';
import type { ChatMessage, ChatSource, AgentActivity } from '@/types';

const typeIcon: Record<string, typeof FileText> = { pdf: FileText, ppt: Presentation, video: Video };
const typeColor: Record<string, string> = { pdf: 'text-primary', ppt: 'text-gold', video: 'text-plum' };
const typeBg: Record<string, string> = { pdf: 'bg-primary-soft', ppt: 'bg-gold-soft', video: 'bg-plum-soft' };

const tutorActions = [
  { label: 'Explain Simply', key: 'explain simply', icon: Lightbulb },
  { label: 'Explain Deeply', key: 'explain deeply', icon: BookMarked },
  { label: 'Give an Example', key: 'give an example', icon: Layers },
  { label: 'Give an Analogy', key: 'give an analogy', icon: Repeat2 },
  { label: 'Summarize', key: 'summarize', icon: BookOpen },
  { label: 'Quiz Me', key: 'quiz me', icon: Sparkles },
  { label: 'Show Related Topics', key: 'show related topics', icon: BookOpen },
];

const contextOptions = ['All Materials', 'Current Course', 'Current Topic', 'Selected Documents'];

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      return <p key={i} className="font-semibold text-text-primary mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-text-primary leading-relaxed">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <span key={j} className="font-semibold">{part.slice(2, -2)}</span>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

export function TutorPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('All Materials');
  const [contextOpen, setContextOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<ChatSource | null>(null);
  const [agents, setAgents] = useState<AgentActivity[]>(mockAgentActivities);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (content: string, actionKey?: string) => {
    if (!content.trim() && !actionKey) return;
    setError(false);

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'student',
      content: actionKey ? `${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}` : content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, studentMsg]);
    setInput('');
    setLoading(true);

    // Animate agents
    setAgents(mockAgentActivities.map((a, i) => ({
      ...a,
      status: i === 0 ? 'active' : 'idle',
    })));
    setTimeout(() => {
      setAgents(mockAgentActivities.map((a, i) => i <= 1 ? { ...a, status: 'done' as const } : i === 2 ? { ...a, status: 'active' as const } : a));
    }, 600);
    setTimeout(() => {
      setAgents(mockAgentActivities.map((a, i) => i <= 2 ? { ...a, status: 'done' as const } : i === 3 ? { ...a, status: 'active' as const } : a));
    }, 1000);

    await new Promise((r) => setTimeout(r, 1400));

    const lowerContent = content.toLowerCase();
    let responseText = defaultAiResponse;
    if (actionKey && mockAiResponses[actionKey]) {
      responseText = mockAiResponses[actionKey];
    } else {
      for (const key of Object.keys(mockAiResponses)) {
        if (lowerContent.includes(key.split(' ')[0])) {
          responseText = mockAiResponses[key];
          break;
        }
      }
    }

    // Simulate streaming
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: 'ai',
      content: '',
      sources: mockChatSources,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);

    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      await new Promise((r) => setTimeout(r, 30));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id ? { ...m, content: words.slice(0, i + 3).join(' ') } : m
        )
      );
    }
    setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, isStreaming: false } : m)));
    setAgents(mockAgentActivities.map((a) => ({ ...a, status: 'done' as const })));
    setTimeout(() => {
      setAgents(mockAgentActivities.map((a, i) => i <= 1 ? { ...a, status: 'done' as const } : { ...a, status: 'idle' as const }));
    }, 2000);
  };

  const handleAction = (action: { label: string; key: string; icon: typeof Lightbulb }) => {
    if (action.key === 'quiz me') {
      toast('info', 'Starting adaptive quiz...');
      navigate('/quiz');
      return;
    }
    sendMessage(`Please ${action.key}`, action.key);
  };

  const handleRetry = () => {
    setMessages((prev) => prev.slice(0, -1));
    setError(false);
    sendMessage(messages[messages.length - 1]?.content || 'What is backpropagation?');
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={24} className="text-plum" /> AI Tutor
          </h1>
          <p className="mt-1 text-text-secondary">Your source-aware learning companion</p>
        </div>
        {/* Context selector */}
        <div className="relative">
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:border-primary/40 transition-colors"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">{context}</span>
            <ChevronDown size={14} />
          </button>
          {contextOpen && (
            <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-border bg-surface-elevated shadow-xl py-1.5 animate-slide-up">
              {contextOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setContext(opt); setContextOpen(false); }}
                  className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                    context === opt ? 'text-primary bg-primary-soft' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 flex-1 min-h-0">
        {/* Chat area */}
        <Card className="flex flex-col min-h-0">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !loading ? (
              <EmptyState
                icon={<Sparkles size={28} className="text-plum" />}
                title="Start a conversation with your AI Tutor"
                description="Ask about any topic from your learning materials. I'll provide answers with source citations."
              />
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className={`max-w-[85%] ${msg.role === 'student' ? '' : 'w-full'}`}>
                    {msg.role === 'student' ? (
                      <div className="rounded-2xl rounded-br-md bg-surface-elevated px-4 py-3">
                        <p className="text-sm text-text-primary">{msg.content}</p>
                        <p className="text-[10px] text-text-secondary mt-1">{msg.timestamp}</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-bl-md border border-plum/20 bg-surface-elevated px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-plum" />
                          <span className="text-xs font-medium text-plum">AI Tutor</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          {formatContent(msg.content)}
                          {msg.isStreaming && <span className="inline-block w-1.5 h-4 bg-plum animate-pulse-plum ml-0.5" />}
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Sources</p>
                            <div className="space-y-2">
                              {msg.sources.map((source, idx) => {
                                const Icon = typeIcon[source.type];
                                return (
                                  <button
                                    key={source.id}
                                    onClick={() => setPreviewSource(source)}
                                    className="flex items-start gap-3 w-full rounded-lg border border-border bg-surface p-3 hover:border-primary/40 transition-colors text-left"
                                  >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeBg[source.type]}`}>
                                      <Icon size={14} className={typeColor[source.type]} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-text-primary">
                                        [{idx + 1}] {source.title}
                                      </p>
                                      <p className="text-[10px] text-text-secondary mt-0.5">
                                        {source.page && `Chapter 4 • Page ${source.page}`}
                                        {source.slide && `Slide ${source.slide}`}
                                        {source.timestamp && `Timestamp: ${source.timestamp}`}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tutor actions */}
                        {msg.role === 'ai' && !msg.isStreaming && msg === messages[messages.length - 1] && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tutorActions.map((action) => (
                              <button
                                key={action.key}
                                onClick={() => handleAction(action)}
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-secondary hover:border-plum/40 hover:text-plum transition-colors"
                              >
                                <action.icon size={12} />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-text-secondary mt-2">{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex justify-start animate-slide-up">
                <div className="rounded-2xl rounded-bl-md border border-plum/20 bg-surface-elevated px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-plum" />
                    <span className="text-xs font-medium text-plum">AI Tutor is thinking...</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="typing-dot h-2 w-2 rounded-full bg-plum" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-plum" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-plum" />
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-danger" />
                    <span className="text-sm font-medium text-danger">Unable to generate response</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">The AI service is temporarily unavailable. Please try again.</p>
                  <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything about your study materials..."
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-plum focus:outline-none focus:ring-1 focus:ring-plum"
                disabled={loading}
              />
              <Button
                variant="ai"
                icon={<Send size={16} />}
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
              >
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Right sidebar - Agents */}
        <div className="hidden lg:flex flex-col gap-4">
          <AgentPanel activities={agents} />
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Topics</h3>
              <div className="space-y-2">
                {['Backpropagation', 'CNN Architecture', 'Gradient Descent', 'LSTM Networks'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => sendMessage(`What is ${topic.toLowerCase()}?`)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
                  >
                    <BookOpen size={14} className="text-plum" />
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Source Preview Modal */}
      <Modal
        open={!!previewSource}
        onClose={() => setPreviewSource(null)}
        title={previewSource?.title}
        size="lg"
      >
        {previewSource && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeBg[previewSource.type]}`}>
                {(() => {
                  const Icon = typeIcon[previewSource.type];
                  return <Icon size={20} className={typeColor[previewSource.type]} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{previewSource.title}</p>
                <p className="text-xs text-text-secondary">
                  {previewSource.page && `Page ${previewSource.page}`}
                  {previewSource.slide && `Slide ${previewSource.slide}`}
                  {previewSource.timestamp && `Timestamp: ${previewSource.timestamp}`}
                </p>
              </div>
            </div>
            {previewSource.type === 'video' && previewSource.timestamp ? (
              <div className="rounded-xl border border-border bg-surface-elevated p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-plum-soft">
                  <Sparkles size={28} className="text-plum" />
                </div>
                <p className="text-sm text-text-primary mb-1">Video Source</p>
                <p className="text-xs text-text-secondary">Timestamp: {previewSource.timestamp}</p>
                <p className="text-sm text-text-primary mt-4 text-left bg-surface rounded-lg p-4">{previewSource.snippet}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface-elevated p-6">
                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider">
                  {previewSource.page ? `Page ${previewSource.page}` : previewSource.slide ? `Slide ${previewSource.slide}` : 'Excerpt'}
                </p>
                <p className="text-sm text-text-primary leading-relaxed">{previewSource.snippet}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ai" icon={<Sparkles size={16} />} onClick={() => { setPreviewSource(null); toast('info', 'Continue the conversation in AI Tutor'); }}>
                Ask AI about this
              </Button>
              <Button variant="secondary" onClick={() => setPreviewSource(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
