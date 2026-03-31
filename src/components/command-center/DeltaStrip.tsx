import { Badge, HStack, Text, Wrap, WrapItem } from '@chakra-ui/react';
import type { EnhancedPlayer } from '../../data/commandCenterMocks';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  realSquad: EnhancedPlayer[];
  sandboxSquad: EnhancedPlayer[];
  bank: number;
  bankDelta: number;
  freeTransfers: number;
  sandboxTransfersMade: number;
}

const DeltaStrip = ({ realSquad, sandboxSquad, bank, bankDelta, freeTransfers, sandboxTransfersMade }: Props) => {
  const realXPts = realSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const sandboxXPts = sandboxSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const xPtsDelta = sandboxXPts - realXPts;

  const realNext5 = realXPts * 5;
  const sandboxNext5 = sandboxXPts * 5;
  const next5Delta = sandboxNext5 - realNext5;

  const currentBank = Number((bank + bankDelta).toFixed(1));
  const hasChanges = Math.abs(xPtsDelta) > 0.01 || Math.abs(next5Delta) > 0.01 || Math.abs(bankDelta) > 0.001 || sandboxTransfersMade > 0;

  const extraTransfers = Math.max(0, sandboxTransfersMade - freeTransfers);
  const hitCost = extraTransfers * 4;

  const deltaColor = (value: number) => (value > 0 ? 'brand.400' : value < 0 ? 'red.300' : 'slate.400');

  return (
    <DashboardCard px={5} py={4}>
      <Wrap spacing={6} align="center">
        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">
              GW xPts
            </Text>
            <Text fontSize="sm" color="slate.400">
              {realXPts.toFixed(1)}
            </Text>
            <Text color="slate.600">→</Text>
            <Text fontSize="sm" fontWeight="bold" color="white">
              {sandboxXPts.toFixed(1)}
            </Text>
            {Math.abs(xPtsDelta) > 0.01 ? (
              <Text fontSize="xs" fontWeight="bold" color={deltaColor(xPtsDelta)}>
                {xPtsDelta > 0 ? '+' : ''}
                {xPtsDelta.toFixed(1)}
              </Text>
            ) : null}
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">
              Next 5 GWs
            </Text>
            <Text fontSize="sm" color="slate.400">
              {realNext5.toFixed(1)}
            </Text>
            <Text color="slate.600">→</Text>
            <Text fontSize="sm" fontWeight="bold" color="white">
              {sandboxNext5.toFixed(1)}
            </Text>
            {Math.abs(next5Delta) > 0.01 ? (
              <Text fontSize="xs" fontWeight="bold" color={deltaColor(next5Delta)}>
                {next5Delta > 0 ? '+' : ''}
                {next5Delta.toFixed(1)}
              </Text>
            ) : null}
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">
              Bank
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={currentBank < 0 ? 'red.300' : 'brand.400'}>
              £{currentBank.toFixed(1)}m
              {Math.abs(bankDelta) > 0.001 ? (
                <Text as="span" fontSize="xs" ml={1} color={deltaColor(bankDelta)}>
                  ({bankDelta > 0 ? '+' : ''}
                  {bankDelta.toFixed(1)}m)
                </Text>
              ) : null}
            </Text>
          </HStack>
        </WrapItem>

        <WrapItem>
          <HStack spacing={2}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="slate.500">
              Transfers
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={sandboxTransfersMade > freeTransfers ? 'red.300' : 'brand.400'}>
              {sandboxTransfersMade}/{freeTransfers}
            </Text>
            {hitCost > 0 && (
              <Badge colorScheme="red" fontSize="10px" px={2} py={0.5} borderRadius="md">
                −{hitCost} pts hit
              </Badge>
            )}
          </HStack>
        </WrapItem>

        {!hasChanges ? (
          <WrapItem ms={{ base: 0, xl: 'auto' }}>
            <Text fontSize="xs" color="slate.500" fontStyle="italic">
              No changes yet
            </Text>
          </WrapItem>
        ) : null}
      </Wrap>
    </DashboardCard>
  );
};

export default DeltaStrip;
