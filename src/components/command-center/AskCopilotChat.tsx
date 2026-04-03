import { useState } from 'react';
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import type { CopilotHybridResultPayload } from '../../api/backend';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  hybridPayload: CopilotHybridResultPayload | null;
  // Blend apply phase used to present pending state to the user
  applyPhase?: 'idle' | 'submitting' | 'queued' | 'running' | 'completed' | 'failed';
}

const AskCopilotChat = ({ hybridPayload, applyPhase = 'idle' }: Props) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your FPL Copilot. Ask me squad or transfer questions.\n\nIf AI insights are not available, apply a model blend from the AI Sandbox to generate AI-powered recommendations.",
    },
  ]);

  let backendAnswer: string | null = null;
  if (hybridPayload?.ask_copilot) {
    const { answer, rationale } = hybridPayload.ask_copilot;
    const rationaleText = rationale.length > 0 ? '\n\nKey points:\n' + rationale.map((r, i) => `${i + 1}. ${r}`).join('\n') : '';
    
    // Check for valid-zero (empty recommended_transfers but not degraded)
    const isValidZero = hybridPayload.recommended_transfers && hybridPayload.recommended_transfers.length === 0 && !hybridPayload.degraded_mode?.is_degraded;
    
    const validZeroNote = isValidZero
      ? 'Note: The model produced no confident transfer suggestions (valid zero).\n\n'
      : '';

    backendAnswer = `${validZeroNote}${answer}${rationaleText}`;
  }

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');

    setTimeout(() => {
      let response = '';

      if (backendAnswer) {
        response = backendAnswer;
      } else if (hybridPayload?.degraded_mode?.is_degraded) {
        const code = hybridPayload.degraded_mode.code || 'UNKNOWN';
        const msg = hybridPayload.degraded_mode.message || 'The assistant could not produce reliable model suggestions.';
        response = `AI insights are degraded (code: ${code}). ${msg}`;
      } else if (applyPhase === 'submitting' || applyPhase === 'queued' || applyPhase === 'running') {
        response = 'A model blend is currently in progress...';
      } else {
        response = 'No AI insights available yet. Apply a model blend to get AI-powered recommendations.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 300);
  };

  return (
    <DashboardCard display="flex" flexDirection="column">
      <DashboardHeader title="Ask Copilot" description="Get AI-powered advice" />
      <Box px={5} py={4} maxH="20rem" overflowY="auto" flex="1" sx={cardScrollSx}>
        <Stack spacing={3}>
          {messages.map((msg, idx) => (
            <FlexMessage key={idx} role={msg.role} content={msg.content} />
          ))}
        </Stack>
      </Box>
      <Box px={5} py={4} borderTopWidth="1px" borderColor="whiteAlpha.100">
        <HStack spacing={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            size="sm"
          />
          <Button onClick={handleSend} size="sm" variant="outline" borderColor="rgba(16, 185, 129, 0.22)" color="brand.400" _hover={{ bg: 'rgba(16, 185, 129, 0.12)' }}>
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
