import { HStack, Text, Wrap, WrapItem } from '@chakra-ui/react';
import type { EnhancedPlayer } from '../../data/commandCenterMocks';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  realSquad: EnhancedPlayer[];
  sandboxSquad: EnhancedPlayer[];
}

const DeltaStrip = ({ realSquad, sandboxSquad }: Props) => {
  const realXPts = realSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const sandboxXPts = sandboxSquad.filter((p) => !p.isBench).reduce((sum, p) => sum + p.xPts, 0);
  const xPtsDelta = sandboxXPts - realXPts;

  const realNext5 = realXPts * 5;
  const sandboxNext5 = sandboxXPts * 5;
  const next5Delta = sandboxNext5 - realNext5;

  const bankDelta: number = 0;
  const hasChanges = Math.abs(xPtsDelta) > 0.01 || Math.abs(next5Delta) > 0.01;

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
            {hasChanges ? (
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
            {hasChanges ? (
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
            <Text fontSize="sm" fontWeight="bold" color="brand.400">
              £0.5m
              {bankDelta !== 0 ? (
                <Text as="span" fontSize="xs" ml={1}>
                  ({bankDelta > 0 ? '+' : ''}
                  {bankDelta.toFixed(1)}m)
                </Text>
              ) : null}
            </Text>
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
