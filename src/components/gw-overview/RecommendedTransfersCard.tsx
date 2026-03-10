import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp, FiChevronRight } from 'react-icons/fi';
import type { RecommendedTransfer, RecommendedTransferPlayer } from '../../data/gwOverviewMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  transfers: RecommendedTransfer[];
  heightPx?: number;
}

const PlayerInfo = ({
  player,
  direction,
}: {
  player: RecommendedTransferPlayer;
  direction: 'in' | 'out';
}) => (
  <HStack align="center" spacing={2.5} minW={0}>
    <Flex
      h={7}
      w={7}
      flexShrink={0}
      align="center"
      justify="center"
      borderRadius="full"
      bg={direction === 'in' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(248, 113, 113, 0.12)'}
      color={direction === 'in' ? 'brand.400' : 'red.300'}
    >
      <Icon as={direction === 'in' ? FiArrowUp : FiArrowDown} boxSize={3.5} />
    </Flex>
    <Box minW={0}>
      <Text noOfLines={1} fontSize="sm" fontWeight="medium" color="white">
        {player.name}
      </Text>
      <Text fontSize="11px" color="slate.500">
        {player.team} · {player.position} · {player.price}
      </Text>
    </Box>
  </HStack>
);

const RecommendedTransfersCard = ({ transfers, heightPx }: Props) => (
  <DashboardCard display="flex" flexDirection="column" h={heightPx ? `${heightPx}px` : undefined}>
    <DashboardHeader title="Recommended Transfers" />

    <Stack spacing={0} flex="1" overflow="auto" sx={cardScrollSx}>
      {transfers.map((t, i) => (
        <Box
          key={i}
          px={5}
          py={4}
          borderBottomWidth={i === transfers.length - 1 ? '0' : '1px'}
          borderColor="whiteAlpha.100"
          _hover={{ bg: 'whiteAlpha.50' }}
        >
          <Flex align="center" justify="space-between" gap={4}>
            <Stack spacing={2.5} minW={0} flex="1">
              <PlayerInfo player={t.playerIn} direction="in" />
              <PlayerInfo player={t.playerOut} direction="out" />
            </Stack>

            <Stack align="center" spacing={1} flexShrink={0}>
              <Text fontSize="10px" textTransform="uppercase" color="slate.500">
                xPts
              </Text>
              <Badge
                borderRadius="lg"
                px={2.5}
                py={1}
                textTransform="none"
                bg="rgba(16, 185, 129, 0.12)"
                color="brand.400"
                borderWidth="1px"
                borderColor="rgba(16, 185, 129, 0.22)"
              >
                +{t.xPointsDiff.toFixed(1)}
              </Badge>
            </Stack>
          </Flex>

          <Flex mt={3} align="center" justify="space-between" gap={3}>
            <Text fontSize="11px" color="slate.500" lineHeight="short" noOfLines={1} flex="1">
              {t.rationale}
            </Text>

            <HStack spacing={2} flexShrink={0}>
              <Button
                size="xs"
                variant="outline"
                borderColor="rgba(16, 185, 129, 0.22)"
                color="brand.400"
                _hover={{ bg: 'rgba(16, 185, 129, 0.12)' }}
              >
                Apply
              </Button>
              <Button size="xs" variant="ghost" isDisabled color="slate.600">
                <FiChevronRight size={16} />
              </Button>
            </HStack>
          </Flex>
        </Box>
      ))}
    </Stack>
  </DashboardCard>
);

export default RecommendedTransfersCard;
