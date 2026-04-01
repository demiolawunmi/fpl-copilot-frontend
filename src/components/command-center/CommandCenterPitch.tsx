import { Box, Button, Center, Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { EnhancedPlayer } from '../../data/commandCenterMocks';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  squad: EnhancedPlayer[];
  onSetCaptain: (playerId: number) => void;
}

const CommandCenterPitch = ({ squad, onSetCaptain }: Props) => {
  const navigate = useNavigate();
  const starters = squad.filter((p) => !p.isBench);
  const bench = squad.filter((p) => p.isBench);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  const handlePlayerClick = (player: EnhancedPlayer) => {
    const id = player?.id;
    if (id == null || typeof id !== 'number' || Number.isNaN(id)) return;
    navigate(`/players/${id}`);
  };

  return (
    <DashboardCard>
      <Flex borderBottomWidth="1px" borderColor="whiteAlpha.100">
        <Button flex="1" borderRadius="0" variant="ghost" py={3} fontSize="sm" fontWeight="semibold" color="brand.400" borderBottomWidth="2px" borderBottomColor="brand.400" _hover={{ bg: 'transparent' }}>
          Pitch View
        </Button>
      </Flex>

      <Box position="relative" px={{ base: 3, sm: 6, lg: 8 }} py={{ base: 4, sm: 6 }} style={{ background: 'repeating-linear-gradient(180deg, #1a3d1a 0px, #1a3d1a 60px, #1f4a1f 60px, #1f4a1f 120px)' }}>
        <PitchLines />
        <Stack position="relative" spacing={5} align="center">
          <PitchRow players={gk} onSetCaptain={onSetCaptain} onPlayerClick={handlePlayerClick} />
          <PitchRow players={def} onSetCaptain={onSetCaptain} onPlayerClick={handlePlayerClick} />
          <PitchRow players={mid} onSetCaptain={onSetCaptain} onPlayerClick={handlePlayerClick} />
          <PitchRow players={fwd} onSetCaptain={onSetCaptain} onPlayerClick={handlePlayerClick} />
          <Box mt={2} w="full" rounded="xl" bg="rgba(15, 23, 42, 0.8)" px={4} py={3}>
            <Text mb={2} textAlign="center" fontSize="10px" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color="slate.500">Bench</Text>
            <BenchRow players={bench} onPlayerClick={handlePlayerClick} />
          </Box>
        </Stack>
      </Box>
    </DashboardCard>
  );
};

const PitchRow = ({ players, onSetCaptain, onPlayerClick }: { players: EnhancedPlayer[]; onSetCaptain: (id: number) => void; onPlayerClick?: (player: EnhancedPlayer) => void }) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 3, sm: 6 }} spacingY={{ base: 3, sm: 4 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip key={p.id} player={p} onSetCaptain={onSetCaptain} onPlayerClick={onPlayerClick} />
    ))}
  </SimpleGrid>
);

const BenchRow = ({ players, onPlayerClick }: { players: EnhancedPlayer[]; onPlayerClick?: (player: EnhancedPlayer) => void }) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 3, sm: 6 }} spacingY={{ base: 3, sm: 4 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip key={p.id} player={p} onPlayerClick={onPlayerClick} />
    ))}
  </SimpleGrid>
);

const PlayerChip = ({ player, onSetCaptain, onPlayerClick }: { player: EnhancedPlayer; onSetCaptain?: (id: number) => void; onPlayerClick?: (player: EnhancedPlayer) => void }) => {
  const minutesColor = player.minutesRisk === 'Safe' ? 'brand.400' : player.minutesRisk === 'Risk' ? 'orange.300' : 'slate.400';
  const injuryBadge = player.injuryStatus !== 'Available';
  const chipBg = player.injuryStatus === 'Injured'
    ? 'red.800'
    : player.injuryStatus === 'Doubtful'
      ? 'orange.700'
      : player.injuryStatus === 'Suspended'
        ? 'yellow.700'
        : 'slate.700';
  const chipBorder = player.injuryStatus === 'Injured'
    ? 'red.500'
    : player.injuryStatus === 'Doubtful'
      ? 'orange.400'
      : player.injuryStatus === 'Suspended'
        ? 'yellow.400'
        : 'whiteAlpha.300';
  const handleClick = () => {
    if (onPlayerClick) onPlayerClick(player);
    if (onSetCaptain) onSetCaptain(player.id);
  };
  const isClickable = Boolean(onPlayerClick || onSetCaptain);

  return (
    <Stack spacing={1} align="center" w={{ base: '84px', sm: '96px' }}>
      <Box position="relative">
        <Center
          h={10}
          w={10}
          rounded="full"
          borderWidth="2px"
          borderColor={chipBorder}
          bg={chipBg}
          fontSize="10px"
          fontWeight="bold"
          color="white"
          textTransform="uppercase"
          cursor={isClickable ? 'pointer' : 'default'}
          onClick={isClickable ? handleClick : undefined}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={isClickable ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          } : undefined}
          _focusVisible={{ outline: 'none', ring: 2, ringColor: 'brand.400', ringOffset: 2, ringOffsetColor: 'gray.900' }}
          transition="all 0.2s"
        >
          {player.name.slice(0, 3)}
        </Center>
        {player.isCaptain ? <Center position="absolute" top="-4px" right="-4px" boxSize={4} rounded="full" bg="yellow.400" fontSize="8px" fontWeight="bold" color="black">C</Center> : null}
        {player.isViceCaptain ? <Center position="absolute" top="-4px" right="-4px" boxSize={4} rounded="full" bg="slate.400" fontSize="8px" fontWeight="bold" color="black">V</Center> : null}
        {injuryBadge ? <Center position="absolute" bottom="-4px" right="-4px" boxSize={3} rounded="full" bg="red.500" fontSize="8px" fontWeight="bold" color="white">!</Center> : null}
      </Box>
      <Text w="full" noOfLines={1} textAlign="center" fontSize="11px" fontWeight="medium" color="white" lineHeight="tight">{player.name}</Text>
      <HStack spacing={1}>
        <Box rounded="md" bg="rgba(16, 185, 129, 0.2)" px={1.5} py={0.5} fontSize="10px" fontWeight="bold" color="brand.400">
          {player.xPts.toFixed(1)}
        </Box>
        <Text fontSize="9px" fontWeight="medium" color={minutesColor} title={`Minutes risk: ${player.minutesRisk}`}>
          {player.minutesRisk === 'Safe' ? '✓' : player.minutesRisk === 'Risk' ? '⚠' : '?'}
        </Text>
      </HStack>
    </Stack>
  );
};

function PitchLines() {
  return (
    <Box pointerEvents="none" position="absolute" inset={{ base: 3, sm: 4 }}>
      <Box position="absolute" inset={0} rounded="lg" borderWidth="1px" borderColor="whiteAlpha.300" />
      <Box position="absolute" left={0} right={0} top="50%" h="1px" bg="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="50%" h="112px" w="112px" transform="translate(-50%, -50%)" rounded="full" borderWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="50%" h="6px" w="6px" transform="translate(-50%, -50%)" rounded="full" bg="whiteAlpha.300" />
      <Box position="absolute" left="50%" top={0} h="22%" w="44%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderBottomWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top={0} h="12%" w="24%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderBottomWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="16%" h="6px" w="6px" transform="translateX(-50%)" rounded="full" bg="whiteAlpha.300" />
      <Box position="absolute" left="50%" bottom={0} h="22%" w="44%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderTopWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" bottom={0} h="12%" w="24%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderTopWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" bottom="16%" h="6px" w="6px" transform="translateX(-50%)" rounded="full" bg="whiteAlpha.300" />
    </Box>
  );
}

export default CommandCenterPitch;
