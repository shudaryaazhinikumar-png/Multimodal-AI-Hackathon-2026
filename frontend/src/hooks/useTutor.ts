import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ConversationMessage, SourceCitation } from '@/types';
import { getConversationHistory, getConversation, askTutor } from '@/services/api/tutorApi';

export function useTutor() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const data = await getConversationHistory();
    setConversations(data);
    if (data.length > 0) setActiveConversation(data[0]);
    setLoading(false);
  };

  const selectConversation = useCallback(async (id: string) => {
    setLoading(true);
    const conv = await getConversation(id);
    setActiveConversation(conv);
    setLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      setSending(true);

      const userMsg: ConversationMessage = {
        id: `m-${Date.now()}`,
        role: 'user',
        content: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveConversation((prev) => {
        const base = prev || {
          id: 'current-session',
          title: 'Study Session',
          messages: [],
          lastMessage: '',
          timestamp: 'Now',
        };
        return { ...base, messages: [...base.messages, userMsg] };
      });

      try {
        const convId = activeConversation?.id || 'current-session';
        const response = await askTutor(convId, question);

        const aiMsg: ConversationMessage = {
          id: `m-${Date.now() + 1}`,
          role: 'assistant',
          content: response.answer,
          citations: response.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: response.suggestedActions,
        };

        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, aiMsg],
                lastMessage: response.answer.slice(0, 60) + '...',
              }
            : prev
        );
      } catch (err: unknown) {
        const errorMsg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'An error occurred while generating the tutor response.';

        const errorAiMsg: ConversationMessage = {
          id: `m-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, errorAiMsg],
              }
            : prev
        );
      } finally {
        setSending(false);
      }
    },
    [activeConversation]
  );

  const newConversation = useCallback(() => {
    const conv: Conversation = {
      id: `c-${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      lastMessage: '',
      timestamp: 'Now',
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversation(conv);
  }, []);

  return {
    conversations,
    activeConversation,
    loading,
    sending,
    selectConversation,
    sendMessage,
    newConversation,
  };
}

export { type SourceCitation };
