import { Box, Button, Divider, Flex, HStack, Switch, Text } from '@chakra-ui/react';
import { DashboardCard } from '../ui/dashboard';

interface Props {
  sandboxMode: boolean;
  onToggleSandboxMode: () => void;
  onUndo: () => void;
  onReset: () => void;
  onApply: () => void;
  canUndo: boolean;
}

const SandboxControls = ({
  sandboxMode,
  onToggleSandboxMode,
  onUndo,
  onReset,
  onApply,
  canUndo,
}: Props) => {
  return (
    <DashboardCard px={5} py={4}>
      <Flex wrap="wrap" align="center" gap={4}>
        <HStack spacing={3}>
          <Text fontSize="sm" color="slate.400">
            Sandbox Mode
          </Text>
          <Switch isChecked={sandboxMode} onChange={onToggleSandboxMode} colorScheme="green" />
        </HStack>

        <Divider orientation="vertical" h={6} borderColor="whiteAlpha.200" display={{ base: 'none', md: 'block' }} />

        <Button
          onClick={onUndo}
          isDisabled={!canUndo}
          variant="outline"
          size="sm"
          borderColor="whiteAlpha.200"
          color={canUndo ? 'slate.200' : 'slate.600'}
          _hover={canUndo ? { bg: 'whiteAlpha.100', color: 'white' } : undefined}
        >
          ↶ Undo
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          borderColor="whiteAlpha.200"
          color="slate.200"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          ⟲ Reset
        </Button>

        <Button
          onClick={onApply}
          variant="outline"
          size="sm"
          borderColor="rgba(16, 185, 129, 0.22)"
          color="brand.400"
          _hover={{ bg: 'rgba(16, 185, 129, 0.12)', color: 'brand.300' }}
        >
          ✓ Apply to Team
        </Button>
      </Flex>
    </DashboardCard>
  );
};

export default SandboxControls;
