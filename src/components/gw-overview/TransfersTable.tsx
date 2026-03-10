import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { Transfer } from '../../data/gwOverviewMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  transfers: Transfer[];
}

const TransfersTable = ({ transfers }: Props) => (
  <DashboardCard>
    <DashboardHeader title="Transfers" />
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th color="slate.500">In</Th>
            <Th color="slate.500">Out</Th>
            <Th color="slate.500">Cost</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transfers.map((t, i) => (
            <Tr key={i} _hover={{ bg: 'whiteAlpha.50' }}>
              <Td color="brand.400" fontWeight="medium">{t.playerIn}</Td>
              <Td color="red.300" fontWeight="medium">{t.playerOut}</Td>
              <Td color="slate.400">{t.cost}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  </DashboardCard>
);

export default TransfersTable;
