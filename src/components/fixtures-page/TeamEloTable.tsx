import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { TeamFixtureRatingsRow } from '../../types/fixturesRatings';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  teams: TeamFixtureRatingsRow[];
}

export default function TeamEloTable({ teams }: Props) {
  return (
    <DashboardCard>
      <DashboardHeader
        title="Team ratings"
        description="ClubElo from /api/fdr/elo; mean Copilot FDR across the matrix window from /api/fdr/team."
      />
      <TableContainer overflow="auto" sx={cardScrollSx} maxH={{ base: '280px', md: 'none' }}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th
                color="slate.500"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Team
              </Th>
              <Th
                isNumeric
                color="slate.500"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Elo
              </Th>
              <Th
                isNumeric
                color="slate.500"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Custom FDR (Elo)
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {teams.map((row) => {
              const vals = row.eloBasedFdr.filter((x) => x != null) as number[];
              const fallbackAvg =
                vals.length > 0
                  ? vals.reduce((a, b) => a + b, 0) / vals.length
                  : null;
              const customDisplay =
                row.eloFdrSummary != null ? row.eloFdrSummary : fallbackAvg;

              return (
                <Tr key={row.shortName} _hover={{ bg: 'whiteAlpha.50' }}>
                  <Td color="slate.200" fontWeight="medium">
                    {row.shortName}
                  </Td>
                  <Td
                    isNumeric
                    fontFamily="mono"
                    color={row.elo == null ? 'slate.500' : 'white'}
                  >
                    {row.elo == null ? '—' : row.elo.toFixed(0)}
                  </Td>
                  <Td
                    isNumeric
                    fontFamily="mono"
                    color={customDisplay == null ? 'slate.500' : 'slate.200'}
                  >
                    {customDisplay == null ? (
                      <Text as="span" color="slate.500">
                        —
                      </Text>
                    ) : (
                      customDisplay.toFixed(2)
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
}
