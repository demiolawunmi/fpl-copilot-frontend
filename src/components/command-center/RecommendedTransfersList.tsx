import { useState } from 'react';
import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import type { RecommendedTransferItem } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  transfers: RecommendedTransferItem[];
  onApplyTransfer: (playerInId: number, playerOutId: number) => void;
}

const RecommendedTransfersList = ({ transfers, onApplyTransfer }: Props) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <DashboardCard>
      <DashboardHeader title="Recommended Transfers" description="AI-suggested moves for this gameweek" />
      <Stack px={5} py={4} spacing={3} maxH="24rem" overflowY="auto" sx={cardScrollSx}>
        {transfers.length === 0 ? (
          <Box py={2}>
            <Text fontSize="sm" color="slate.400">
              No transfer recommendations available yet. Try applying a model blend to generate suggestions.
            </Text>
          </Box>
        ) : null}
        {transfers.map((transfer, idx) => (
          <Box key={idx} pb={3} borderBottomWidth={idx === transfers.length - 1 ? '0' : '1px'} borderColor="whiteAlpha.100">
            <HStack align="center" justify="space-between" gap={3}>
              <HStack spacing={3} minW={0} flex="1" align="center">
                <HStack spacing={2} minW={0}>
                  <Text fontSize="sm" fontWeight="semibold" color="red.300">{transfer.playerOut.name}</Text>
                  <Text color="slate.600">→</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="brand.400">{transfer.playerIn.name}</Text>
                </HStack>
                <Badge px={2} py={1} fontSize="10px" textTransform="none" borderRadius="md" bg="rgba(16, 185, 129, 0.12)" color="brand.400" borderWidth="1px" borderColor="rgba(16, 185, 129, 0.22)">
                  +{transfer.xPtsDelta.toFixed(1)} xPts
                </Badge>
              </HStack>
              <Button
                onClick={() => onApplyTransfer(transfer.playerIn.id, transfer.playerOut.id)}
                size="xs"
                variant="outline"
                borderColor="rgba(16, 185, 129, 0.22)"
                color="brand.400"
                _hover={{ bg: 'rgba(16, 185, 129, 0.12)' }}
              >
                Apply
              </Button>
            </HStack>

            <HStack mt={2} spacing={4} fontSize="xs" color="slate.400" wrap="wrap">
              <Text>OUT: £{transfer.playerOut.price}m • {transfer.playerOut.team}</Text>
              <Text>IN: £{transfer.playerIn.price}m • {transfer.playerIn.team}</Text>
            </HStack>

            <Button mt={2} onClick={() => toggleExpand(idx)} variant="link" size="xs" color="brand.400" _hover={{ color: 'brand.300' }}>
              {expandedIndex === idx ? '▼ Hide rationale' : '▶ Why this?'}
            </Button>

            {expandedIndex === idx ? (
              <Box mt={2} pl={4} borderLeftWidth="2px" borderColor="whiteAlpha.200">
                <Text fontSize="xs" color="slate.300" lineHeight="tall">{transfer.why}</Text>
              </Box>
            ) : null}
          </Box>
        ))}
      </Stack>
    </DashboardCard>
  );
};

export default RecommendedTransfersList;
