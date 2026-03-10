import { Badge, Box, HStack, Text, Tooltip, Wrap, WrapItem } from '@chakra-ui/react';
import type { TeamStatus } from '../../data/commandCenterMocks';
import { DashboardCard } from '../ui/dashboard';

interface StatusStripConfig {
  // Tooltip vertical offset in pixels (how far above the bar the tooltip appears)
  tooltipOffsetPx?: number;
  // Wildcard season split cutoff in ISO format. Default points to Dec 30 13:00 (year can be changed by config)
  wildcardCutoffIso?: string;
  // If true, show the special note about first/second wildcard timing in the tooltip
  showWildcardSeasonSplit?: boolean;
}

interface Props {
  status: TeamStatus;
  config?: StatusStripConfig;
}

const StatusStrip = ({ status, config }: Props) => {
  const chipNames = {
    wildcard: 'WC',
    freehit: 'FH',
    bboost: 'BB',
    tcaptain: 'TC',
  };

  const chipFull = {
    wildcard: 'Wildcard',
    freehit: 'Free Hit',
    bboost: 'Bench Boost',
    tcaptain: 'Triple Captain',
  } as const;

  const chipDesc: Record<string, string> = {
    wildcard: 'Replace your entire squad for this GW. Useful for fixture swings or large changes.',
    freehit: 'Temporarily replace your squad for one GW; your original squad returns after the GW.',
    bboost: 'Score points from your entire bench for a single GW (useful in double gameweeks).',
    tcaptain: 'Triple Captain: captain scores triple points for one GW (use on a premium double-gameweek).',
  };

  // Default configuration
  const defaultConfig: Required<StatusStripConfig> = {
    tooltipOffsetPx: 12, // how far above the bar the tooltip sits (px)
    wildcardCutoffIso: '2025-12-30T13:00:00', // default cutoff (changeable via config)
    showWildcardSeasonSplit: true,
  };

  const cfg = { ...defaultConfig, ...(config ?? {}) };

  const deadline = new Date(status.deadline);
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const deadlinePassed = deadline < now;

  // Wildcard cutoff handling — parse the configured cutoff
  let wildcardCutoffDate: Date | null = null;
  try {
    wildcardCutoffDate = cfg.wildcardCutoffIso ? new Date(cfg.wildcardCutoffIso) : null;
    if (wildcardCutoffDate && isNaN(wildcardCutoffDate.getTime())) wildcardCutoffDate = null;
  } catch {
    wildcardCutoffDate = null;
  }

  const isAfterWildcardCutoff = wildcardCutoffDate ? now >= wildcardCutoffDate : false;
  const wildcardCutoffLabel = wildcardCutoffDate
    ? wildcardCutoffDate.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : cfg.wildcardCutoffIso;

  return (
    <DashboardCard px={5} py={4}>
      <Wrap spacing={6} align="center">
        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">Free Transfers</Text>
            <Text fontSize="md" fontWeight="bold" color="white">{status.freeTransfers}</Text>
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">Bank</Text>
            <Text fontSize="md" fontWeight="bold" color="brand.400">£{status.bank.toFixed(1)}m</Text>
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">Team Value</Text>
            <Text fontSize="md" fontWeight="bold" color="white">£{status.teamValue.toFixed(1)}m</Text>
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2} align="center">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">Chips</Text>
            <HStack spacing={1.5}>
              {(Object.keys(chipNames) as Array<keyof typeof chipNames>).map((chipKey) => {
                const chip = status.chips[chipKey];
                const wildcardNote = cfg.showWildcardSeasonSplit && chipKey === 'wildcard'
                  ? isAfterWildcardCutoff
                    ? `After ${wildcardCutoffLabel}: first Wildcard is lost; second Wildcard is available.`
                    : `Second Wildcard becomes available after ${wildcardCutoffLabel}.`
                  : null;

                const tooltip = (
                  <Box color="white">
                    <HStack justify="space-between" align="start" spacing={2}>
                      <Text fontWeight="semibold" color="white">{chipFull[chipKey]}</Text>
                      <Text fontSize="xs" color={chip.available ? 'brand.300' : 'slate.400'}>
                        {chip.available ? 'Available' : 'Used'}
                      </Text>
                    </HStack>
                    <Text mt={2} fontSize="xs" color="slate.300">{chipDesc[chipKey]}</Text>
                    <Text mt={2} fontSize="11px" color="slate.300">
                      {chip.used ? `Used: ${chip.used}` : chip.available ? 'Can be used this GW' : 'Not available'}
                    </Text>
                    {wildcardNote ? (
                      <Text mt={2} fontSize="11px" color="whiteAlpha.900" fontWeight="medium">{wildcardNote}</Text>
                    ) : null}
                  </Box>
                );

                return (
                  <Tooltip key={chipKey} label={tooltip} hasArrow placement="top" openDelay={150} gutter={cfg.tooltipOffsetPx} bg="rgba(15, 23, 42, 0.96)" borderWidth="1px" borderColor="whiteAlpha.200" px={3} py={2}>
                    <Badge
                      px={2}
                      py={1}
                      fontSize="10px"
                      fontWeight="bold"
                      borderRadius="md"
                      textTransform="none"
                      cursor="default"
                      borderWidth="1px"
                      bg={chip.available ? 'rgba(16, 185, 129, 0.12)' : 'whiteAlpha.100'}
                      color={chip.available ? 'brand.400' : 'slate.500'}
                      borderColor={chip.available ? 'rgba(16, 185, 129, 0.22)' : 'whiteAlpha.200'}
                    >
                      {chipNames[chipKey]}
                    </Badge>
                  </Tooltip>
                );
              })}
            </HStack>
          </HStack>
        </WrapItem>

        <WrapItem ms={{ base: 0, xl: 'auto' }}>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">Deadline</Text>
            <Text fontSize="md" fontWeight="bold" color={deadlinePassed ? 'red.300' : 'yellow.300'}>
              {deadlinePassed ? 'Passed' : daysRemaining > 0 ? `${daysRemaining}d ${hoursRemaining % 24}h` : `${hoursRemaining}h`}
            </Text>
          </HStack>
        </WrapItem>
      </Wrap>
    </DashboardCard>
  );
};

export default StatusStrip;
