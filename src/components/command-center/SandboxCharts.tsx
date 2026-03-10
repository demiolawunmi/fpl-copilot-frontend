import { Box, Stack, Text } from '@chakra-ui/react';
import type { EnhancedPlayer } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  squad: EnhancedPlayer[];
}

const SandboxCharts = ({ squad }: Props) => {
  const starters = squad.filter((p) => !p.isBench);
  const byPosition = {
    DEF: starters.filter((p) => p.position === 'DEF').reduce((sum, p) => sum + p.xPts, 0),
    MID: starters.filter((p) => p.position === 'MID').reduce((sum, p) => sum + p.xPts, 0),
    FWD: starters.filter((p) => p.position === 'FWD').reduce((sum, p) => sum + p.xPts, 0),
  };

  const totalXPts = Object.values(byPosition).reduce((sum, val) => sum + val, 0);

  return (
    <DashboardCard>
      <DashboardHeader title="Charts & Analytics" />
      <Stack px={5} py={4} spacing={4}>
        <Box>
          <Text mb={2} fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.400">
            Team xPts by Position
          </Text>
          <Stack spacing={2}>
            {(Object.entries(byPosition) as [string, number][]).map(([pos, xPts]) => {
              const pct = totalXPts > 0 ? (xPts / totalXPts) * 100 : 0;
              return (
                <Box key={pos} display="flex" alignItems="center" gap={3}>
                  <Text w={8} fontSize="xs" color="slate.300">{pos}</Text>
                  <Box flex="1" h={6} bg="whiteAlpha.100" borderRadius="md" overflow="hidden" position="relative">
                    <Box h="full" w={`${pct}%`} bg="rgba(16, 185, 129, 0.3)" borderRightWidth="2px" borderColor="brand.400" />
                    <Text position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" fontSize="xs" fontWeight="semibold" color="white">
                      {xPts.toFixed(1)} xPts
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box pt={4} borderTopWidth="1px" borderColor="whiteAlpha.100">
          <Text fontSize="xs" color="slate.500" textAlign="center" fontStyle="italic">
            More charts coming soon: xPts trends, fixture difficulty, transfer impact
          </Text>
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default SandboxCharts;
