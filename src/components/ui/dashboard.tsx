import type { ReactNode } from 'react';
import { Box, Flex, Heading, Text, type BoxProps } from '@chakra-ui/react';

export const cardScrollSx = {
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(148, 163, 184, 0.35)',
    borderRadius: '999px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
};

export const surfaceBorderColor = 'whiteAlpha.200';
export const mutedTextColor = 'slate.400';
export const subtleTextColor = 'slate.500';

export function DashboardCard(props: BoxProps) {
  return (
    <Box
      bg="slate.900"
      borderWidth="1px"
      borderColor={surfaceBorderColor}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="xl"
      {...props}
    />
  );
}

type DashboardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  return (
    <Flex
      px={5}
      py={4}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      align="flex-start"
      justify="space-between"
      gap={3}
    >
      <Box minW={0}>
        {typeof title === 'string' ? (
          <Heading size="xs" textTransform="uppercase" letterSpacing="widest" color="white">
            {title}
          </Heading>
        ) : (
          title
        )}
        {description ? (
          <Text mt={1} fontSize="xs" color={mutedTextColor} noOfLines={2}>
            {description}
          </Text>
        ) : null}
      </Box>
      {action ? <Box flexShrink={0}>{action}</Box> : null}
    </Flex>
  );
}

