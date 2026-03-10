import {
  Badge,
  Center,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTeamId } from '../context/TeamIdContext';
import { useFplData } from '../hooks/useFplData';
import { DashboardCard } from '../components/ui/dashboard';

const HomePage = () => {
  const { teamId } = useTeamId();
  const fpl = useFplData(teamId);

  return (
    <Center flex="1" px={8} py={12}>
      <Stack spacing={6} align="center" textAlign="center" w="full" maxW="2xl">
        <Heading size="xl">Welcome to FPL Copilot</Heading>

        {fpl.loading ? (
          <Stack direction="row" align="center" spacing={3} color="slate.400">
            <Spinner color="brand.400" thickness="3px" />
            <Text fontSize="sm">Loading team info…</Text>
          </Stack>
        ) : null}

        {!fpl.loading && fpl.gwInfo ? (
          <DashboardCard w="full" maxW="xl" px={10} py={8}>
            <Stack spacing={4} align="center">
              <Text fontSize="lg" fontWeight="semibold" color="white">
                {fpl.gwInfo.teamName}
              </Text>
              <Text fontSize="sm" color="slate.400">
                {fpl.gwInfo.manager}
              </Text>
              <Badge
                borderRadius="full"
                px={4}
                py={1.5}
                fontSize="sm"
                fontFamily="mono"
                textTransform="none"
                bg="rgba(16, 185, 129, 0.12)"
                color="brand.300"
                borderWidth="1px"
                borderColor="rgba(16, 185, 129, 0.22)"
              >
                Team ID: {fpl.gwInfo.teamId}
              </Badge>
              <Text fontSize="xs" color="slate.500">
                Current Gameweek: {fpl.gwInfo.gameweek}
              </Text>
            </Stack>
          </DashboardCard>
        ) : null}

        {!fpl.loading && fpl.error ? (
          <Stack spacing={3} align="center">
            <Text color="slate.400">Team ID:</Text>
            <Badge
              borderRadius="xl"
              px={6}
              py={3}
              fontSize="2xl"
              fontFamily="mono"
              textTransform="none"
              bg="rgba(16, 185, 129, 0.12)"
              color="brand.300"
              borderWidth="1px"
              borderColor="rgba(16, 185, 129, 0.22)"
            >
              {teamId}
            </Badge>
            <Text fontSize="xs" color="yellow.300">
              ⚠ Couldn't reach FPL API — {fpl.error}
            </Text>
          </Stack>
        ) : null}
      </Stack>
    </Center>
  );
};

export default HomePage;
