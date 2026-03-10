import { Button, Stack } from '@chakra-ui/react';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  onAutoCaptain: () => void;
  onAutoBench: () => void;
  onRollTransfer: () => void;
  onRunOptimization: () => void;
}

const QuickActions = ({ onAutoCaptain, onAutoBench, onRollTransfer, onRunOptimization }: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Quick Actions" />
      <Stack px={5} py={4} spacing={3}>
        <Button onClick={onAutoCaptain} justifyContent="flex-start" variant="outline" borderColor="whiteAlpha.200" color="slate.200" _hover={{ bg: 'whiteAlpha.100', color: 'white' }}>
          ⚡ Auto-pick Captain (Highest xPts)
        </Button>
        <Button onClick={onAutoBench} justifyContent="flex-start" variant="outline" borderColor="whiteAlpha.200" color="slate.200" _hover={{ bg: 'whiteAlpha.100', color: 'white' }}>
          🔄 Auto-pick Bench Order
        </Button>
        <Button onClick={onRunOptimization} justifyContent="flex-start" variant="outline" borderColor="rgba(59, 130, 246, 0.22)" color="blue.300" _hover={{ bg: 'rgba(59, 130, 246, 0.12)', color: 'blue.200' }}>
          🧠 Run AIrsenal Optimization
        </Button>
        <Button onClick={onRollTransfer} justifyContent="flex-start" variant="outline" borderColor="rgba(16, 185, 129, 0.22)" color="brand.400" _hover={{ bg: 'rgba(16, 185, 129, 0.12)', color: 'brand.300' }}>
          💡 Explore Transfers (Go to Sandbox)
        </Button>
      </Stack>
    </DashboardCard>
  );
};

export default QuickActions;
