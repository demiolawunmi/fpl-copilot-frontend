import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';

interface NavbarProps {
  teamName?: string | null;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/gw-overview', label: 'GW Overview' },
  { to: '/command-center', label: 'Command Center' },
  { to: '/players', label: 'Players' },
  { to: '/fixtures', label: 'Fixtures' },
];

const Navbar = ({ teamName }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId, clearTeamId } = useTeamId();

  const handleSignOut = () => {
    clearTeamId();
    navigate('/login', { replace: true });
  };

  return (
    <Box as="nav" bg="rgba(15, 23, 42, 0.92)" borderBottomWidth="1px" borderColor="whiteAlpha.200" boxShadow="lg">
      <Container maxW="8xl" px={{ base: 4, md: 6, xl: 10 }} py={4}>
        <Flex align="center" justify="space-between" gap={6} wrap="wrap">
          <Flex align="center" gap={{ base: 4, md: 8 }} wrap="wrap">
            <Text
              as={Link}
              to="/"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="wide"
              color="brand.400"
            >
              FPL Copilot
            </Text>

            <HStack spacing={2} wrap="wrap">
              {navLinks.map(({ to, label }) => {
                const isPlayersLink = to === '/players';
                const isActive = isPlayersLink
                  ? location.pathname === '/players' || location.pathname.startsWith('/players/')
                  : location.pathname === to;
                return (
                  <Button
                    key={to}
                    as={Link}
                    to={to}
                    size="sm"
                    variant="ghost"
                    color={isActive ? 'white' : 'slate.300'}
                    bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  >
                    {label}
                  </Button>
                );
              })}
            </HStack>
          </Flex>

          <HStack spacing={4} wrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
            {teamId ? (
              <Badge
                borderRadius="full"
                px={3}
                py={1.5}
                fontSize="xs"
                fontFamily="mono"
                colorScheme="green"
                variant="subtle"
                textTransform="none"
                bg="rgba(16, 185, 129, 0.12)"
                color="brand.300"
                borderWidth="1px"
                borderColor="rgba(16, 185, 129, 0.22)"
              >
                ID: {teamId} {teamName ? `| ${teamName}` : ''}
              </Badge>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              color="red.300"
              _hover={{ bg: 'rgba(248, 113, 113, 0.12)', color: 'red.200' }}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
