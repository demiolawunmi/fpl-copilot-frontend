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
  /** When provided, player chips become clickable for swap / selection. */
  onPlayerClick?: (player: Player) => void;
  /** ID of the currently selected player (highlighted). */
  selectedPlayerId?: number | null;
  /** Hint text shown when a player is selected. */
  swapHint?: string;
  /** Set a starter as captain (single-tap the C badge). */
  onSetCaptain?: (player: Player) => void;
  /** Set a starter as vice-captain (single-tap the V badge). */
  onSetViceCaptain?: (player: Player) => void;
}

const CHIP: {
  imgAspect: string;
  imgScale: number;
  imgAnchor: 'top' | 'center' | 'bottom';
  imgYOffset: number;
  imgFit: 'cover' | 'contain';
} = {
  imgAspect: '11 / 8',
  imgScale: 140,
  imgAnchor: 'bottom',
  imgYOffset: 35,
  imgFit: 'contain',
};

const PlayerChip = ({
  player,
  onClick,
  isSelected,
  onCaptainClick,
  onViceCaptainClick,
}: {
  player: Player;
  onClick?: () => void;
  isSelected?: boolean;
  onCaptainClick?: () => void;
  onViceCaptainClick?: () => void;
}) => {
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
    <Box
      position="relative"
      w={{ base: '60px', sm: '81px' }}
      cursor={onClick ? 'pointer' : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'blue.400',
        outlineOffset: '2px',
      }}
      transition="transform 0.15s, box-shadow 0.15s"
      transform={isSelected ? 'scale(1.08)' : undefined}
      boxShadow={isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.7), 0 0 12px rgba(59, 130, 246, 0.35)' : undefined}
      borderRadius="lg"
      _hover={onClick ? { transform: isSelected ? 'scale(1.08)' : 'scale(1.04)' } : undefined}
    >
      <Box position="relative" overflow="hidden" borderWidth="1px" borderColor={isSelected ? 'blue.400' : 'whiteAlpha.300'} borderTopRadius="lg" bg="rgba(51, 65, 85, 0.4)" style={{ aspectRatio: CHIP.imgAspect }}>
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

      </Box>

      {/* Captain / Vice-Captain badges */}
      {player.isCaptain ? (
        <Center position="absolute" top="2px" right="2px" boxSize={4} borderRadius="full" bg="yellow.400" fontSize="8px" fontWeight="bold" color="black" zIndex={3}>
          C
        </Center>
      ) : player.isViceCaptain ? (
        <Center position="absolute" top="2px" right="2px" boxSize={4} borderRadius="full" bg="slate.400" fontSize="8px" fontWeight="bold" color="black" zIndex={3}>
          V
        </Center>
      ) : !player.isBench && (onCaptainClick || onViceCaptainClick) ? (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', top: 2, right: 2, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 10 }}
        >
          {onCaptainClick && (
            <button
              type="button"
              onClick={onCaptainClick}
              style={{
                width: 18, height: 18, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)',
                fontSize: 8, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#facc15'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >
              C
            </button>
          )}
          {onViceCaptainClick && (
            <button
              type="button"
              onClick={onViceCaptainClick}
              style={{
                width: 18, height: 18, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)',
                fontSize: 8, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#94a3b8'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >
              V
            </button>
          )}
        </div>
      ) : null}

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

const PitchRow = ({
  players,
  onPlayerClick,
  selectedPlayerId,
  onSetCaptain,
  onSetViceCaptain,
}: {
  players: Player[];
  onPlayerClick?: (p: Player) => void;
  selectedPlayerId?: number | null;
  onSetCaptain?: (p: Player) => void;
  onSetViceCaptain?: (p: Player) => void;
}) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 2, sm: 4 }} spacingY={{ base: 2, sm: 3 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip
        key={p.name}
        player={p}
        onClick={onPlayerClick ? () => onPlayerClick(p) : undefined}
        isSelected={selectedPlayerId != null && p.id === selectedPlayerId}
        onCaptainClick={onSetCaptain ? () => onSetCaptain(p) : undefined}
        onViceCaptainClick={onSetViceCaptain ? () => onSetViceCaptain(p) : undefined}
      />
    ))}
  </SimpleGrid>
);

const BenchRow = ({
  players,
  onPlayerClick,
  selectedPlayerId,
}: {
  players: Player[];
  onPlayerClick?: (p: Player) => void;
  selectedPlayerId?: number | null;
}) => (
  <SimpleGrid columns={Math.max(players.length, 1)} spacingX={{ base: 2, sm: 4 }} spacingY={{ base: 2, sm: 3 }} w="full" placeItems="center">
    {players.map((p) => (
      <PlayerChip
        key={p.name}
        player={p}
        onClick={onPlayerClick ? () => onPlayerClick(p) : undefined}
        isSelected={selectedPlayerId != null && p.id === selectedPlayerId}
      />
    ))}
  </SimpleGrid>
);

const PitchCard = ({ squad, onPlayerClick, selectedPlayerId, swapHint, onSetCaptain, onSetViceCaptain }: Props) => {
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
            {swapHint && selectedPlayerId != null && (
              <Text
                textAlign="center"
                fontSize="xs"
                fontWeight="medium"
                color="blue.300"
                bg="rgba(59, 130, 246, 0.1)"
                px={3}
                py={1}
                borderRadius="md"
              >
                {swapHint}
              </Text>
            )}
            <PitchRow players={gk} onPlayerClick={onPlayerClick} selectedPlayerId={selectedPlayerId} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} />
            <PitchRow players={def} onPlayerClick={onPlayerClick} selectedPlayerId={selectedPlayerId} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} />
            <PitchRow players={mid} onPlayerClick={onPlayerClick} selectedPlayerId={selectedPlayerId} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} />
            <PitchRow players={fwd} onPlayerClick={onPlayerClick} selectedPlayerId={selectedPlayerId} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} />
            <Box mt={2} w="full" rounded="xl" bg="rgba(15, 23, 42, 0.8)" px={4} py={3}>
              <Text mb={2} textAlign="center" fontSize="10px" fontWeight="semibold" textTransform="uppercase" letterSpacing="widest" color="slate.500">
                Bench
              </Text>
              <BenchRow players={bench} onPlayerClick={onPlayerClick} selectedPlayerId={selectedPlayerId} />
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
