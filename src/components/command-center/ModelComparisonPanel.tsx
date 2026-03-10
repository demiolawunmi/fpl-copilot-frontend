import { Badge, Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Text } from '@chakra-ui/react';
import type { ModelSource } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  models: ModelSource[];
}

const ModelComparisonPanel = ({ models }: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Model Sources" description="Data blending & predictions" />
      <Box px={5} py={4}>
        <Stack spacing={3}>
          {models.map((model) => (
            <Box key={model.id} display="flex" alignItems="center" justifyContent="space-between" gap={3}>
              <Text fontSize="sm" color="slate.200">{model.name}</Text>
              {model.weight !== undefined ? (
                <Badge px={2} py={1} textTransform="none" borderRadius="md" bg="whiteAlpha.100" color="brand.400" borderWidth="1px" borderColor="whiteAlpha.200">
                  {model.weight}%
                </Badge>
              ) : null}
            </Box>
          ))}
        </Stack>
        <Box mt={4}>
          <Text mb={2} fontSize="xs" color="slate.400">Blend Ratio (Coming Soon)</Text>
          <Slider defaultValue={70} isDisabled>
            <SliderTrack bg="whiteAlpha.100">
              <SliderFilledTrack bg="brand.400" />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Box mt={1} display="flex" justifyContent="space-between" fontSize="10px" color="slate.500">
            <Text>100% AIrsenal</Text>
            <Text>100% ELO</Text>
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default ModelComparisonPanel;
