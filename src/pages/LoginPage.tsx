import {
  Button,
  Container,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';
import { DashboardCard } from '../components/ui/dashboard';

const LoginPage = () => {
  const [input, setInput] = useState('');
  const { setTeamId } = useTeamId();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTeamId(trimmed);
    navigate('/', { replace: true });
  };

  return (
    <Container
      maxW="lg"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={12}
    >
      <DashboardCard w="full" p={{ base: 6, md: 8 }}>
        <Stack as="form" onSubmit={handleSubmit} spacing={6}>
          <Stack spacing={2} textAlign="center">
            <Heading size="lg">FPL Copilot</Heading>
            <Text fontSize="sm" color="slate.400">
              Enter your FPL Team ID to get started
            </Text>
          </Stack>

          <FormControl>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 123456"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              size="lg"
            />
          </FormControl>

          <Button
            type="submit"
            size="lg"
            colorScheme="green"
            bg="brand.500"
            _hover={{ bg: 'brand.400' }}
          >
            Continue
          </Button>
        </Stack>
      </DashboardCard>
    </Container>
  );
};

export default LoginPage;
