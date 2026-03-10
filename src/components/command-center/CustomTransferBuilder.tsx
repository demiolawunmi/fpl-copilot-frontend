import { Box, Button, Input, Stack, Text } from '@chakra-ui/react';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  onTransfer: (playerInId: number, playerOutId: number) => void;
}

const CustomTransferBuilder = (_props: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Custom Transfer Builder" />
      <Stack px={5} py={4} spacing={4}>
        <Box>
          <Text mb={2} fontSize="xs" color="slate.400">Player Out</Text>
          <Input placeholder="Search your squad..." isDisabled size="sm" />
        </Box>
        <Box>
          <Text mb={2} fontSize="xs" color="slate.400">Player In</Text>
          <Input placeholder="Search all players..." isDisabled size="sm" />
        </Box>
        <Button isDisabled variant="outline" borderColor="whiteAlpha.200" color="slate.500">
          Make Transfer (Coming Soon)
        </Button>
      </Stack>
    </DashboardCard>
  );
};

export default CustomTransferBuilder;
