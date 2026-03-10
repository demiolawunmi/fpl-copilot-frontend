import { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { Player } from '../../data/gwOverviewMocks';
import { getDifficultyColor } from '../../utils/difficulty';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  squad: Player[];
}

const CHIP = {
  imgAspect: '11 / 8',
  imgScale: 140,
  imgAnchor: 'bottom' as const,
  imgYOffset: 35,
  imgFit: 'contain' as const,
};

const PlayerChip = ({ player }: { player: Player }) => {
  const difficultyStyles = (() => {
    if (player.chipDifficulty !== undefined) {
      const color = getDifficultyColor(player.chipDifficulty);
      if (color === 'emerald') {
        return { bg: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.25)', color: 'brand.400' };
      }
      if (color === 'yellow') {
        return { bg: 'rgba(250, 204, 21, 0.2)', borderColor: 'rgba(250, 204, 21, 0.25)', color: 'yellow.300' };
      }
      return { bg: 'rgba(244, 63, 94, 0.2)', borderColor: 'rgba(244, 63, 94, 0.25)', color: 'red.300' };
    }
    return { bg: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.25)', color: 'brand.400' };
  })();

  const objectPos = CHIP.imgAnchor === 'top' ? 'top' : CHIP.imgAnchor === 'center' ? 'center' : 'bottom';
  const wrapperAlign = CHIP.imgAnchor === 'top' ? 'flex-start' : CHIP.imgAnchor === 'center' ? 'center' : 'flex-end';

  return (
    <Box w={{ base: '60px', sm: '81px' }}>
      <Box position="relative" overflow="hidden" borderWidth="1px" borderColor="whiteAlpha.300" borderTopRadius="lg" bg="rgba(51, 65, 85, 0.4)" style={{ aspectRatio: CHIP.imgAspect }}>
        {player.photoUrl ? (
          CHIP.imgFit === 'cover' ? (
            <Image
              src={player.photoUrl}
              alt={player.name}
              position="absolute"
              inset={0}
              w="full"
              h="full"
              objectFit="cover"
              objectPosition={objectPos}
              transform={`translateY(${CHIP.imgYOffset}%)`}
              loading="lazy"
            />
          ) : (
            <Flex w="full" h="full" align={wrapperAlign} justify="center">
              <Image
                src={player.photoUrl}
                alt={player.name}
                w="auto"
                objectFit="contain"
                objectPosition={objectPos}
                maxH={`${CHIP.imgScale}%`}
                transform={`translateY(${CHIP.imgYOffset}%)`}
                loading="lazy"
              />
            </Flex>
          )
        ) : (
          <Center h="full" w="full" fontSize="10px" fontWeight="bold" color="white" textTransform="uppercase">
            {player.name.slice(0, 3)}
          </Center>
        )}

        {player.isCaptain ? (
          <Center position="absolute" top="2px" right="2px" boxSize={4} borderRadius="full" bg="yellow.400" fontSize="8px" fontWeight="bold" color="black" zIndex={1}>
            C
          </Center>
        ) : null}
        {player.isViceCaptain ? (
          <Center position="absolute" top="2px" right="2px" boxSize={4} borderRadius="full" bg="slate.400" fontSize="8px" fontWeight="bold" color="black" zIndex={1}>
            V
          </Center>
        ) : null}
      </Box>

      <Box px={1} py={0.5} bg="rgba(15, 23, 42, 0.8)" borderLeftWidth="1px" borderRightWidth="1px" borderColor="whiteAlpha.300">
        <Text noOfLines={1} fontSize="10px" fontWeight="medium" color="white" textAlign="center" lineHeight="tight">
          {player.name}
        </Text>
      </Box>

      <Box px={3} py={0.5} borderWidth="1px" borderTopWidth="1px" borderColor={difficultyStyles.borderColor} borderBottomRadius="md" bg={difficultyStyles.bg} color={difficultyStyles.color}>
        {player.chipLabel ? (
          <Text fontSize="7px" fontWeight="semibold" opacity={0.8} textAlign="center" lineHeight="tight">
            {player.chipLabel}
          </Text>
        ) : null}
        <Text textAlign="center" fontSize="9px" fontWeight="bold">
          {player.chipLabel != null || player.chipDifficulty != null
            ? `${player.isCaptain ? (player.points * 2).toFixed(1) : player.points.toFixed(1)} xP`
            : player.isCaptain
              ? player.points * 2
              : player.points}
        </Text>
      </Box>
    </Box>
  );
};

const PitchRow = ({ players }: { players: Player[] }) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 2, sm: 4 }} spacingY={{ base: 2, sm: 3 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip key={p.name} player={p} />
    ))}
  </SimpleGrid>
);

const BenchRow = ({ players }: { players: Player[] }) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 2, sm: 4 }} spacingY={{ base: 2, sm: 3 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip key={p.name} player={p} />
    ))}
  </SimpleGrid>
);

const PitchCard = ({ squad }: Props) => {
  const [tab, setTab] = useState<'pitch' | 'table'>('pitch');

  const starters = squad.filter((p) => !p.isBench);
  const bench = squad.filter((p) => p.isBench);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  return (
    <DashboardCard>
      <Flex borderBottomWidth="1px" borderColor="whiteAlpha.100">
        {(['pitch', 'table'] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            flex="1"
            borderRadius="0"
            variant="ghost"
            py={3}
            fontSize="sm"
            fontWeight="semibold"
            textTransform="capitalize"
            color={tab === t ? 'brand.400' : 'slate.400'}
            borderBottomWidth="2px"
            borderBottomColor={tab === t ? 'brand.400' : 'transparent'}
            _hover={{ color: 'white', bg: 'transparent' }}
          >
            {t}
          </Button>
        ))}
      </Flex>

      {tab === 'pitch' ? (
        <Box
          position="relative"
          px={{ base: 3, sm: 6, lg: 8 }}
          py={{ base: 4, sm: 6 }}
          style={{ background: 'repeating-linear-gradient(180deg, #1a3d1a 0px, #1a3d1a 60px, #1f4a1f 60px, #1f4a1f 120px)' }}
        >
          <PitchLines />
          <Stack position="relative" spacing={5} align="center">
            <PitchRow players={gk} />
            <PitchRow players={def} />
            <PitchRow players={mid} />
            <PitchRow players={fwd} />
            <Box mt={2} w="full" rounded="xl" bg="rgba(15, 23, 42, 0.8)" px={4} py={3}>
              <Text mb={2} textAlign="center" fontSize="10px" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color="slate.500">
                Bench
              </Text>
              <BenchRow players={bench} />
            </Box>
          </Stack>
        </Box>
      ) : (
        <Center py={20} color="slate.500" fontSize="sm">
          Table view coming soon
        </Center>
      )}
    </DashboardCard>
  );
};

function PitchLines() {
  return (
    <Box pointerEvents="none" position="absolute" inset={{ base: 3, sm: 4 }}>
      <Box position="absolute" inset={0} rounded="lg" borderWidth="1px" borderColor="whiteAlpha.300" />
      <Box position="absolute" left={0} right={0} top="50%" h="1px" bg="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="50%" h="112px" w="112px" transform="translate(-50%, -50%)" rounded="full" borderWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="50%" h="6px" w="6px" transform="translate(-50%, -50%)" rounded="full" bg="whiteAlpha.300" />
      <Box position="absolute" left="50%" top="22%" w="24%" h="8%" transform="translateX(-50%)" roundedBottom="full" borderWidth="1px" borderTopWidth="0" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" bottom="22%" w="24%" h="8%" transform="translateX(-50%)" roundedTop="full" borderWidth="1px" borderBottomWidth="0" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top={0} h="22%" w="44%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderBottomWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top={0} h="12%" w="24%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderBottomWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" top="16%" h="6px" w="6px" transform="translate(-50%, -50%)" rounded="full" bg="whiteAlpha.300" />
      <Box position="absolute" left="50%" bottom={0} h="22%" w="44%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderTopWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" bottom={0} h="12%" w="24%" transform="translateX(-50%)" borderLeftWidth="1px" borderRightWidth="1px" borderTopWidth="1px" borderColor="whiteAlpha.200" />
      <Box position="absolute" left="50%" bottom="16%" h="6px" w="6px" transform="translate(-50%)" rounded="full" bg="whiteAlpha.300" />
    </Box>
  );
}

export default PitchCard;

