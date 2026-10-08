import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, FileText, Video, Presentation, BookOpen, Brain, Send } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayButton } from '@/components/clay/ClayButton';
import { LoadingState } from '@/components/ui/States';
import { useLearning } from '@/hooks/useLearning';
import { mockDocuments } from '@/services/mock/mockData';

const transcriptSections = [
  { id: 't1', time: '00:00', text: 'Welcome to this lecture on backpropagation. Today we will explore how neural networks learn from data.' },
  { id: 't2', time: '15:30', text: 'Activation functions introduce non-linearity. Without them, the network would just be a linear transformation regardless of depth.' },
  { id: 't3', time: '32:18', text: 'In this segment, we discuss how backpropagation works. The key idea is to propagate the error signal backward through the network.' },
  { id: 't4', time: '45:00', text: 'The vanishing gradient problem occurs when gradients become extremely small as they are propagated backward through many layers.' },
];

const sourceTypes = {
  pdf: { icon: FileText, color: '#E2795C' },
  video: { icon: Video, color: '#7C3AED' },
  slide: { icon: Presentation, color: '#5AAB86' },
  note: { icon: BookOpen, color: '#E0B23E' },
};

export function LearningWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { learningPath, loading } = useLearning();
  const [playing, setPlaying] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'I see you are studying backpropagation. Ask me anything about this topic!' },
  ]);

  if (loading || !learningPath) return <LoadingState label="Loading workspace..." />;

  const topic = learningPath.topics.find((t) => t.id === id) || learningPath.topics.find((t) => t.status === 'current');
  if (!topic) return <LoadingState label="Topic not found" />;

  const videoDoc = mockDocuments.find((d) => d.type === 'video');

  const handleSend = () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setChatMessage('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Great question about "${userMsg}". Based on the lecture at 32:18, the key concept here is that backpropagation uses the chain rule to compute gradients. The error signal flows backward through each layer, adjusting weights proportionally to their contribution.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <button onClick={() => navigate('/learning')} className="flex items-center gap-1 text-sm text-clay-500 hover:text-charcoal-700">
        <ArrowLeft size={16} />
        Back to Learning
      </button>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: Learning Material + Transcript */}
        <div className="space-y-4">
          {/* Video Player Placeholder */}
          <ClayCard className="p-0 overflow-hidden">
            <div className="relative aspect-video bg-charcoal-900 flex items-center justify-center rounded-clay-lg">
              <motion.div
                animate={playing ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <button onClick={() => setPlaying(!playing)} className="text-white">
                  {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
              </motion.div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '32%' }} />
                </div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>{videoDoc?.title}</span>
                  <span>15:30 / 48:00</span>
                </div>
              </div>
            </div>
          </ClayCard>

          {/* Transcript */}
          <ClayCard>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-charcoal-900">Transcript</h3>
              <ClayBadge variant="info">Auto-generated</ClayBadge>
            </div>
            <div className="space-y-2">
              {transcriptSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedTranscript(section.id)}
                  className={`flex w-full gap-3 rounded-clay p-3 text-left transition-all ${
                    selectedTranscript === section.id ? 'bg-violet-50 ring-2 ring-violet-200' : 'hover:bg-ivory-100'
                  }`}
                >
                  <span className="shrink-0 text-xs font-medium text-violet-600">{section.time}</span>
                  <span className="text-sm text-charcoal-700">{section.text}</span>
                </button>
              ))}
            </div>
          </ClayCard>
        </div>

        {/* Right: AI Tutor + Source Context */}
        <div className="space-y-4">
          {/* AI Tutor Panel */}
          <ClayCard className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <Brain size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal-900">AI Tutor</p>
                <p className="text-xs text-clay-500">Ask about this lesson</p>
              </div>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                  <div
                    className={`inline-block max-w-[90%] rounded-clay p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white shadow-clay-raised'
                        : 'bg-ivory-100 text-charcoal-800 shadow-clay-pressed'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2 rounded-clay bg-ivory-100 p-2 shadow-clay-pressed">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your tutor..."
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-charcoal-800 placeholder:text-clay-400 focus:outline-none"
              />
              <ClayButton size="sm" onClick={handleSend} disabled={!chatMessage.trim()}>
                <Send size={14} />
              </ClayButton>
            </div>
          </ClayCard>

          {/* Source Context */}
          <ClayCard>
            <h3 className="mb-3 font-bold text-charcoal-900">Source Context</h3>
            {selectedTranscript ? (
              <div className="space-y-2">
                <p className="text-xs text-clay-500">Related sources for this section:</p>
                {mockDocuments.slice(0, 3).map((doc) => {
                  const config = sourceTypes[doc.type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => navigate(`/knowledge/${doc.id}`)}
                      className="flex w-full items-center gap-2 rounded-clay bg-ivory-100 p-3 text-left hover:bg-ivory-200"
                    >
                      <Icon size={16} style={{ color: config.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal-900">{doc.title}</p>
                        <p className="text-xs text-clay-500">
                          {doc.type === 'pdf' && `Page ${doc.sections?.[0]?.page || 1}`}
                          {doc.type === 'video' && doc.sections?.[0]?.timestamp}
                          {doc.type === 'slide' && `Slide ${doc.sections?.[0]?.slide || 1}`}
                          {doc.type === 'note' && `Page 1`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-clay-500">Select a transcript section to see related sources.</p>
            )}
          </ClayCard>

          {/* Related Materials */}
          {topic.materials && topic.materials.length > 0 && (
            <ClayCard>
              <h3 className="mb-3 font-bold text-charcoal-900">Lesson Materials</h3>
              <div className="space-y-2">
                {topic.materials.map((mat, i) => {
                  const config = sourceTypes[mat.type];
                  const Icon = config.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-clay bg-ivory-100 p-3">
                      <Icon size={16} style={{ color: config.color }} />
                      <span className="text-sm text-charcoal-700">{mat.title}</span>
                    </div>
                  );
                })}
              </div>
            </ClayCard>
          )}
        </div>
      </div>
    </div>
  );
}
