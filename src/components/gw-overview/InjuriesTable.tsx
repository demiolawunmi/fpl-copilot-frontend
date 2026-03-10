import {
  Badge,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { Injury } from '../../data/gwOverviewMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  injuries: Injury[];
}

const statusPalette: Record<Injury['status'], { bg: string; color: string }> = {
  Injured: { bg: 'rgba(248, 113, 113, 0.12)', color: 'red.300' },
  Suspended: { bg: 'rgba(251, 146, 60, 0.12)', color: 'orange.300' },
  Doubtful: { bg: 'rgba(250, 204, 21, 0.12)', color: 'yellow.300' },
};

const InjuriesTable = ({ injuries }: Props) => (
  <DashboardCard>
    <DashboardHeader title="Injuries & Suspensions" />
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th color="slate.500">Player</Th>
            <Th color="slate.500">Team</Th>
            <Th color="slate.500">Status</Th>
            <Th color="slate.500">Return</Th>
          </Tr>
        </Thead>
        <Tbody>
          {injuries.map((inj, i) => {
            const palette = statusPalette[inj.status];
            return (
              <Tr key={i} _hover={{ bg: 'whiteAlpha.50' }}>
                <Td color="white" fontWeight="medium">
                  {inj.player}
                </Td>
                <Td color="slate.400">{inj.team}</Td>
                <Td>
                  <Badge
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    textTransform="none"
                    bg={palette.bg}
                    color={palette.color}
                  >
                    {inj.status}
                  </Badge>
                </Td>
                <Td color="slate.400">{inj.returnDate}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  </DashboardCard>
);

export default InjuriesTable;

