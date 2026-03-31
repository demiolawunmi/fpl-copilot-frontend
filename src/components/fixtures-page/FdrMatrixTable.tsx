import {
  Box,
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

function cellBg(difficulty: number | null): string {
  if (difficulty == null) return 'whiteAlpha.50';
  const tier = Math.round(difficulty);
  if (tier <= 2) return 'rgba(16, 185, 129, 0.18)';
  if (tier === 3) return 'rgba(234, 179, 8, 0.16)';
  return 'rgba(244, 63, 94, 0.16)';
}

function formatCellValue(d: number | null, mode: Mode): string {
  if (d == null) return '—';
  if (mode === 'elo') return d.toFixed(1);
  return String(Math.round(d));
}

type Mode = 'official' | 'elo';

interface Props {
  title: string;
  description?: string;
  gameweekIds: number[];
  teams: TeamFixtureRatingsRow[];
  mode: Mode;
}

export default function FdrMatrixTable({
  title,
  description,
  gameweekIds,
  teams,
  mode,
}: Props) {
  const values = (row: TeamFixtureRatingsRow) =>
    mode === 'official' ? row.officialFdr : row.eloBasedFdr;

  return (
    <DashboardCard>
      <DashboardHeader
        title={title}
        description={description}
      />
      <TableContainer overflow="auto" sx={cardScrollSx}>
        <Table variant="simple" size="sm" minW="max-content" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <Thead>
            <Tr>
              <Th
                position="sticky"
                left={0}
                zIndex={2}
                bg="slate.800"
                px={3}
                py={2.5}
                color="slate.400"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
                borderBottomWidth="1px"
                borderColor="whiteAlpha.100"
              >
                Team
              </Th>
              {gameweekIds.map((gw) => (
                <Th
                  key={gw}
                  px={2}
                  py={2.5}
                  textAlign="center"
                  color="slate.400"
                  fontSize="xs"
                  fontWeight="semibold"
                  whiteSpace="nowrap"
                  borderBottomWidth="1px"
                  borderColor="whiteAlpha.100"
                >
                  GW {gw}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {teams.map((row) => (
              <Tr key={row.shortName} _hover={{ bg: 'whiteAlpha.30' }}>
                <Td
                  position="sticky"
                  left={0}
                  zIndex={1}
                  bg="slate.900"
                  px={3}
                  py={2}
                  borderBottomWidth="1px"
                  borderColor="whiteAlpha.100"
                  fontWeight="medium"
                  color="slate.200"
                  whiteSpace="nowrap"
                >
                  {row.shortName}
                </Td>
                {values(row).map((d, i) => (
                  <Td
                    key={`${row.shortName}-${gameweekIds[i]}`}
                    px={1.5}
                    py={1.5}
                    textAlign="center"
                    borderBottomWidth="1px"
                    borderColor="whiteAlpha.100"
                  >
                    <Box
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      minW="32px"
                      minH="28px"
                      px={2}
                      borderRadius="md"
                      bg={cellBg(d)}
                      borderWidth="1px"
                      borderColor="whiteAlpha.100"
                    >
                      <Text
                        as="span"
                        fontWeight="bold"
                        color={d == null ? 'slate.500' : 'white'}
                        fontSize="xs"
                      >
                        {formatCellValue(d, mode)}
                      </Text>
                    </Box>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
}
