import { useEffect, useState } from 'react';
import { Box, Button, HStack, Input, Stack, Text, useToast } from '@chakra-ui/react';
import type {
  CopilotBlendSubmitRequest,
  CopilotHybridResultPayload,
} from '../../api/backend';
import { isApiError, postCopilotChat } from '../../api/backend';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  hybridPayload: CopilotHybridResultPayload | null;
  /** Last blend job input (from live submit or loaded snapshot) — required for live chat context. */
  blendInput?: CopilotBlendSubmitRequest | null;
  applyPhase?: 'idle' | 'submitting' | 'queued' | 'running' | 'completed' | 'failed';
}

const WELCOME =
  "👋 Hi! I'm your FPL Copilot. After you apply a model blend, you can ask follow-up questions here — answers use your saved blend context and the live LLM.";

const AskCopilotChat = ({ hybridPayload, blendInput = null, applyPhase = 'idle' }: Props) => {
  const toast = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: WELCOME },
  ]);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME }]);
  }, [hybridPayload?.correlation_id]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!hybridPayload || !blendInput) {
      toast({
        title: 'No blend context',
        description: 'Apply a model blend in the AI Sandbox first (or load a saved session).',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (applyPhase === 'submitting' || applyPhase === 'queued' || applyPhase === 'running') {
      toast({
        title: 'Blend in progress',
        description: 'Wait for the current blend to finish before chatting.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const priorForApi = messages.slice(1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    void (async () => {
      try {
        const res = await postCopilotChat({
          schema_version: blendInput.schema_version,
          correlation_id: hybridPayload.correlation_id,
          message: trimmed,
          messages: priorForApi,
          blend_input: blendInput,
          blend_result: hybridPayload,
        });
        setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      } catch (err) {
        let detail = 'Could not reach the assistant. Try again.';
        if (isApiError(err)) {
          if (err.status === 503) {
            const body = err.details as { detail?: string } | undefined;
            detail = typeof body?.detail === 'string' ? body.detail : 'The LLM is unavailable.';
          } else if (err.bodyText) {
            detail = err.bodyText;
          }
        }
        toast({
          title: 'Chat failed',
          description: detail,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry — ${detail}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  };

  const canChat =
    hybridPayload != null &&
    blendInput != null &&
    applyPhase !== 'submitting' &&
    applyPhase !== 'queued' &&
    applyPhase !== 'running';

  return (
    <DashboardCard display="flex" flexDirection="column">
      <DashboardHeader title="Ask Copilot" description="Live follow-ups using your blend context" />
      <Box px={5} py={4} maxH="20rem" overflowY="auto" flex="1" sx={cardScrollSx}>
        <Stack spacing={3}>
          {messages.map((msg, idx) => (
            <FlexMessage key={idx} role={msg.role} content={msg.content} />
          ))}
          {loading ? (
            <Text fontSize="xs" color="slate.500" px={1}>
              Thinking…
            </Text>
          ) : null}
        </Stack>
      </Box>
      <Box px={5} py={4} borderTopWidth="1px" borderColor="whiteAlpha.100">
        <HStack spacing={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={canChat ? 'Ask a question…' : 'Apply a blend to enable chat'}
            size="sm"
            isDisabled={loading}
          />
          <Button
            onClick={handleSend}
            size="sm"
            variant="outline"
            borderColor="rgba(16, 185, 129, 0.22)"
            color="brand.400"
            _hover={{ bg: 'rgba(16, 185, 129, 0.12)' }}
            isLoading={loading}
            isDisabled={loading || !canChat}
          >
            Send
          </Button>
        </HStack>
      </Box>
    </DashboardCard>
  );
};

const FlexMessage = ({ role, content }: { role: 'user' | 'assistant'; content: string }) => (
  <Box display="flex" justifyContent={role === 'user' ? 'flex-end' : 'flex-start'}>
    <Box
      maxW="85%"
      px={3}
      py={2}
      borderRadius="lg"
      fontSize="sm"
      whiteSpace="pre-line"
      bg={role === 'user' ? 'rgba(16, 185, 129, 0.18)' : 'whiteAlpha.100'}
      color={role === 'user' ? 'green.100' : 'slate.200'}
      borderWidth="1px"
      borderColor={role === 'user' ? 'rgba(16, 185, 129, 0.28)' : 'whiteAlpha.200'}
    >
      <Text whiteSpace="pre-line">{content}</Text>
    </Box>
  </Box>
);

export default AskCopilotChat;
