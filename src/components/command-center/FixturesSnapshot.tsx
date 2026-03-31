import { Badge, HStack, Stack, Text } from '@chakra-ui/react';
import type { FixtureItem } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  fixtures: FixtureItem[];
}

const getDifficultyStyle = (difficulty: number) => {
  if (difficulty === 1) return { bg: 'rgba(16, 185, 129, 0.12)', color: 'brand.400', borderColor: 'rgba(16, 185, 129, 0.22)' };
  if (difficulty === 2) return { bg: 'rgba(34, 197, 94, 0.12)', color: 'green.300', borderColor: 'rgba(34, 197, 94, 0.22)' };
  if (difficulty === 3) return { bg: 'rgba(100, 116, 139, 0.12)', color: 'slate.300', borderColor: 'rgba(100, 116, 139, 0.22)' };
  if (difficulty === 4) return { bg: 'rgba(251, 146, 60, 0.12)', color: 'orange.300', borderColor: 'rgba(251, 146, 60, 0.22)' };
  return { bg: 'rgba(248, 113, 113, 0.12)', color: 'red.300', borderColor: 'rgba(248, 113, 113, 0.22)' };
};

const FixturesSnapshot = ({ fixtures }: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Fixtures Snapshot" description="Upcoming fixtures for your squad" />
      <Stack px={5} py={4} spacing={2} maxH="20rem" overflowY="auto" sx={cardScrollSx}>
        {fixtures.map((fixture, idx) => {
          const style = getDifficultyStyle(fixture.difficulty);
          return (
            <HStack
              key={idx}
              justify="space-between"
              gap={3}
              px={3}
              py={2}
              borderRadius="lg"
              bg="rgba(30, 41, 59, 0.3)"
              _hover={{ bg: 'rgba(30, 41, 59, 0.6)' }}
            >
              <HStack spacing={2} minW={0} flex="1">
                <Badge
                  px={2}
                  py={1}
                  fontSize="10px"
                  textTransform="none"
                  bg={style.bg}
                  color={style.color}
                  borderWidth="1px"
                  borderColor={style.borderColor}
                  borderRadius="md"
                >
                  {fixture.difficulty}
                </Badge>
                <Text fontSize="xs" color="slate.400">
                  GW{fixture.gameweek}
                </Text>
                <Text noOfLines={1} fontSize="sm" fontWeight="medium" color="white">
                  {fixture.home ? 'vs' : '@'} {fixture.opponentAbbr}
                </Text>
              </HStack>
            </HStack>
          );
        })}
      </Stack>
    </DashboardCard>
  );
};

export default FixturesSnapshot;
