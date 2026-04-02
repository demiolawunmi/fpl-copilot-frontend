import { useState, useMemo } from 'react';
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import type { CopilotHybridResultPayload } from '../../api/backend';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  hybridPayload: CopilotHybridResultPayload | null;
}

const AskCopilotChat = ({ hybridPayload }: Props) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm your FPL Copilot. Ask me questions like:\n\n• Why is Palmer recommended as captain?\n• Should I transfer out Saka?\n• What's the risk of this move?",
    },
  ]);

  const backendAnswer = useMemo(() => {
    if (!hybridPayload?.ask_copilot) return null;
    const { answer, rationale } = hybridPayload.ask_copilot;
    const rationaleText = rationale.length > 0 ? '\n\nKey points:\n' + rationale.map((r, i) => `${i + 1}. ${r}`).join('\n') : '';
    return `${answer}${rationaleText}`;
  }, [hybridPayload]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');

    setTimeout(() => {
      const response = backendAnswer ??
        "Based on your sandbox state and current squad, here's my recommendation:\n\n✓ Palmer is your best captain choice (7.8 xPts)\n✓ Consider benching Saka due to injury\n⚠ Risk: Limited bench depth if injuries occur\n\n[Apply a model blend to get AI-powered insights!]";
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
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
