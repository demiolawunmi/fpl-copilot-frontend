import { SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import type { GWStats } from '../../data/gwOverviewMocks';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  stats: GWStats;
}

const format = (n: number) => n.toLocaleString();

const StatsStrip = ({ stats }: Props) => {
  const items = [
    { label: 'Average', value: format(stats.average) },
    { label: 'Highest', value: format(stats.highest) },
    { label: 'GW Points', value: format(stats.gwPoints), highlight: true },
    { label: 'GW Rank', value: format(stats.gwRank) },
    { label: 'Overall Rank', value: format(stats.overallRank) },
  ];

  return (
    <SimpleGrid columns={{ base: 2, lg: 5 }} spacing={3}>
      {items.map((item) => (
        <DashboardCard key={item.label} px={4} py={3}>
          <Stat textAlign="center">
            <StatLabel fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.400">
              {item.label}
            </StatLabel>
            <StatNumber mt={1} fontSize="lg" color={item.highlight ? 'brand.400' : 'white'}>
              {item.value}
            </StatNumber>
          </Stat>
        </DashboardCard>
      ))}
    </SimpleGrid>
  );
};

export default StatsStrip;
