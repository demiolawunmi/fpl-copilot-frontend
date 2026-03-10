import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { GWInfo } from '../../data/gwOverviewMocks';

interface Props {
  info: GWInfo;
  onPrev?: () => void;
  onNext?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
}

const GWHeader = ({ info, onPrev, onNext, disablePrev, disableNext }: Props) => (
  <Flex align="center" justify="space-between" gap={4}>
    <IconButton
      aria-label="Previous gameweek"
      icon={<FiChevronLeft size={20} />}
      onClick={onPrev}
      isDisabled={disablePrev}
      variant="ghost"
      bg="whiteAlpha.100"
      color={disablePrev ? 'slate.500' : 'white'}
      _hover={{ bg: 'whiteAlpha.200' }}
    />

    <Box textAlign="center" flex="1">
      <Heading size="lg">Gameweek {info.gameweek}</Heading>
      <Text mt={1} fontSize="sm" color="slate.400">
        {info.teamName} · {info.manager} · ID {info.teamId}
      </Text>
    </Box>

    <IconButton
      aria-label="Next gameweek"
      icon={<FiChevronRight size={20} />}
      onClick={onNext}
      isDisabled={disableNext}
      variant="ghost"
      bg="whiteAlpha.100"
      color={disableNext ? 'slate.500' : 'white'}
      _hover={{ bg: 'whiteAlpha.200' }}
    />
  </Flex>
);

export default GWHeader;
