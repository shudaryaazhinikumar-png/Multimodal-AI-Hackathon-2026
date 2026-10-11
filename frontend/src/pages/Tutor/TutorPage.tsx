import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Send,
  Paperclip,
  Mic,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bookmark,
  MessageSquare,
  X,
} from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayDrawer } from '@/components/clay/ClayTabs';
import { useTutor } from '@/hooks/useTutor';
import { AIMessage, UserMessage, TypingIndicator, SourcePreviewContent } from '@/components/tutor/MessageComponents';
import { LoadingState } from '@/components/ui/States';
import type { SourceCitation } from '@/types';

const suggestedQuestions = [
  'Explain backpropagation simply',
  'What is gradient descent?',
  'Compare ReLU and Sigmoid',
  'How does Adam optimizer work?',
];

const learningMemory = {
  confident: ['Linear Regression', 'Basic Python', 'Activation Functions'],
  workingOn: ['Backpropagation', 'Optimization'],
  preference: 'Simplified explanations',
};

export function TutorPage() {
  const { conversations, activeConversation, loading, sending, selectConversation, sendMessage, newConversation } = useTutor();
  const [input, setInput] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<SourceCitation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, sending]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const q = input;
    setInput('');
    await sendMessage(q);
  };

  const handleSuggestion = async (q: string) => {
    setInput('');
    await sendMessage(q);
  };

  const handleCitationClick = (c: SourceCitation) => {
    setSelectedCitation(c);
    setBookmarked(false);
    setDrawerOpen(true);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleBookmark = () => {
    setBookmarked(true);
    showToast('Source bookmarked');
  };

  const handleNewConversation = () => {
    newConversation();
    setShowConversations(false);
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setShowConversations(false);
  };

  if (loading) return <LoadingState label="Loading conversations..." />;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Conversation List - Desktop */}
        <ClayCard className="hidden flex-col overflow-hidden p-0 lg:flex">
          <div className="border-b border-ivory-200 p-4">
            <ClayButton size="sm" fullWidth onClick={handleNewConversation}>
              <Plus size={16} className="mr-1 inline" />
              New Conversation
            </ClayButton>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`mb-1 w-full rounded-clay p-3 text-left transition-all ${
                  activeConversation?.id === conv.id
                    ? 'bg-violet-50 shadow-clay-raised'
                    : 'hover:bg-ivory-100'
                }`}
              >
                <p className="truncate text-sm font-medium text-charcoal-900">{conv.title}</p>
                <p className="mt-0.5 truncate text-xs text-clay-500">{conv.lastMessage}</p>
                <p className="mt-0.5 text-xs text-clay-400">{conv.timestamp}</p>
              </button>
            ))}
          </div>
        </ClayCard>

        {/* Chat Area */}
        <ClayCard className="flex flex-col overflow-hidden p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ivory-200 p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConversations(true)}
                className="rounded-clay p-1.5 text-clay-500 hover:bg-ivory-100 lg:hidden"
                aria-label="Show conversations"
              >
                <MessageSquare size={18} />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <Brain size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal-900">{activeConversation?.title || 'New Conversation'}</p>
                <p className="text-xs text-clay-500">AI Tutor · Source-cited</p>
              </div>
            </div>
            <ClayBadge variant="success" className="hidden sm:inline-flex">
              <Sparkles size={12} />
              Online
            </ClayBadge>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConversation?.messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-clay-2xl bg-violet-100 shadow-clay-raised">
                  <Brain size={32} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900">Ask your AI Tutor</h3>
                  <p className="mt-1 text-sm text-clay-600">Get personalized explanations grounded in your materials</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="rounded-full bg-ivory-100 px-4 py-2 text-sm font-medium text-clay-700 shadow-clay-sm hover:bg-ivory-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeConversation?.messages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} message={msg} />
              ) : (
                <AIMessage key={msg.id} message={msg} onCitationClick={handleCitationClick} />
              )
            )}

            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-ivory-200 p-4">
            <div className="flex items-end gap-2 rounded-clay-lg bg-ivory-100 p-2 shadow-clay-pressed">
              <button
                className="rounded-clay p-2 text-clay-500 hover:bg-ivory-200"
                aria-label="Attach file"
                onClick={() => showToast('File attachment coming soon')}
              >
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask your tutor..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-charcoal-800 placeholder:text-clay-400 focus:outline-none"
              />
              <button
                className="rounded-clay p-2 text-clay-500 hover:bg-ivory-200"
                aria-label="Voice input"
                onClick={() => showToast('Voice input coming soon')}
              >
                <Mic size={18} />
              </button>
              <ClayButton size="sm" onClick={handleSend} disabled={!input.trim() || sending}>
                <Send size={16} />
              </ClayButton>
            </div>
          </div>
        </ClayCard>

        {/* Sources / Context Panel */}
        <div className="hidden flex-col gap-4 lg:flex">
          <ClayCard className="p-4">
            <h3 className="text-sm font-bold text-charcoal-900">What your tutor knows</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-medium text-mint-500">You are confident with:</p>
                <div className="mt-1 space-y-1">
                  {learningMemory.confident.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-charcoal-700">
                      <CheckCircle2 size={12} className="text-mint-500" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-violet-600">You are working on:</p>
                <div className="mt-1 space-y-1">
                  {learningMemory.workingOn.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-charcoal-700">
                      <ArrowRight size={12} className="text-violet-600" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-clay-500">Learning preference:</p>
                <p className="mt-0.5 text-xs text-charcoal-700">{learningMemory.preference}</p>
              </div>
            </div>
          </ClayCard>

          {activeConversation?.messages.some((m) => m.citations && m.citations.length > 0) && (
            <ClayCard className="p-4">
              <h3 className="text-sm font-bold text-charcoal-900">Recent Sources</h3>
              <div className="mt-3 space-y-2">
                {activeConversation.messages
                  .filter((m) => m.citations)
                  .flatMap((m) => m.citations!)
                  .slice(0, 5)
                  .map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => handleCitationClick(c)}
                      className="flex w-full items-start gap-2 rounded-clay bg-ivory-100 p-2 text-left hover:bg-ivory-200"
                    >
                      <span className="text-xs font-bold text-violet-600">[{i + 1}]</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-charcoal-900">{c.title}</p>
                        {c.page && <p className="text-xs text-clay-500">Page {c.page}</p>}
                        {c.timestamp && <p className="text-xs text-clay-500">{c.timestamp}</p>}
                      </div>
                    </button>
                  ))}
              </div>
            </ClayCard>
          )}
        </div>
      </div>

      {/* Source Preview Drawer */}
      <ClayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Source Preview">
        {selectedCitation && (
          <SourcePreviewContent
            citation={selectedCitation}
            onOpen={() => {
              setDrawerOpen(false);
              showToast('Opening source document...');
            }}
            onBookmark={handleBookmark}
          />
        )}
      </ClayDrawer>

      {/* Mobile Conversation Drawer */}
      <ClayDrawer open={showConversations} onClose={() => setShowConversations(false)} title="Conversations">
        <div className="mb-4">
          <ClayButton size="sm" fullWidth onClick={handleNewConversation}>
            <Plus size={16} className="mr-1 inline" />
            New Conversation
          </ClayButton>
        </div>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`w-full rounded-clay p-3 text-left transition-all ${
                activeConversation?.id === conv.id
                  ? 'bg-violet-50 shadow-clay-raised'
                  : 'hover:bg-ivory-100'
              }`}
            >
              <p className="truncate text-sm font-medium text-charcoal-900">{conv.title}</p>
              <p className="mt-0.5 truncate text-xs text-clay-500">{conv.lastMessage}</p>
              <p className="mt-0.5 text-xs text-clay-400">{conv.timestamp}</p>
            </button>
          ))}
        </div>
      </ClayDrawer>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-clay bg-charcoal-900 px-4 py-2.5 text-sm text-white shadow-clay-xl lg:bottom-8"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
