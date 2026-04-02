import { Badge, Box, Button, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Text } from '@chakra-ui/react';
import type { ModelSource } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

type ApplyStatus = 'idle' | 'submitting' | 'queued' | 'running' | 'completed' | 'failed';

interface Props {
  models: ModelSource[];
  blendTotal: number;
  blendRemaining: number;
  isBlendInvalid: boolean;
  onModelWeightChange: (modelId: string, nextWeight: number) => void;
  applyStatus: ApplyStatus;
  statusMessage?: string;
  canRetry?: boolean;
  onApply: () => void;
}

const getStatusTone = (applyStatus: ApplyStatus) => {
  if (applyStatus === 'completed') return { bg: 'green.900', color: 'green.200', label: 'Completed' };
  if (applyStatus === 'failed') return { bg: 'red.900', color: 'red.200', label: 'Failed' };
  if (applyStatus === 'running') return { bg: 'blue.900', color: 'blue.200', label: 'Running' };
  if (applyStatus === 'queued' || applyStatus === 'submitting') return { bg: 'orange.900', color: 'orange.200', label: 'Pending' };
  return { bg: 'whiteAlpha.100', color: 'slate.300', label: 'Idle' };
};

const ModelComparisonPanel = ({
  models,
  blendTotal,
  blendRemaining,
  isBlendInvalid,
  onModelWeightChange,
  applyStatus,
  statusMessage,
  canRetry,
  onApply,
}: Props) => {
  const tone = getStatusTone(applyStatus);
  const isBusy = applyStatus === 'submitting' || applyStatus === 'queued' || applyStatus === 'running';
  const buttonLabel = applyStatus === 'failed' && canRetry ? 'Retry Apply' : 'Apply Blend';

  return (
    <DashboardCard>
      <DashboardHeader
        title="Model Sources"
        description="Data blending & predictions"
        action={(
          <Button
            size="sm"
            colorScheme={applyStatus === 'failed' ? 'red' : 'blue'}
            onClick={onApply}
            isDisabled={isBlendInvalid}
            _disabled={{
              opacity: 0.45,
              cursor: 'not-allowed',
            }}
            isLoading={isBusy}
            loadingText={applyStatus === 'submitting' ? 'Submitting' : 'Applying'}
          >
            {buttonLabel}
          </Button>
        )}
      />
      <Box px={5} py={4}>
        <Stack spacing={3}>
          {models.map((model) => (
            <Box key={model.id} borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="lg" bg="whiteAlpha.50" px={3} py={2}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                  <Text fontSize="sm" color="slate.200">{model.name}</Text>
                  <Badge px={2} py={1} textTransform="none" borderRadius="md" bg="whiteAlpha.100" color="brand.400" borderWidth="1px" borderColor="whiteAlpha.200">
                    {model.weight}%
                  </Badge>
                </Box>
                <Slider
                  value={model.weight}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(nextValue) => onModelWeightChange(model.id, nextValue)}
                >
                  <SliderTrack bg="whiteAlpha.100">
                    <SliderFilledTrack bg="brand.400" />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Stack>
            </Box>
          ))}

          <Box borderWidth="1px" borderColor={isBlendInvalid ? 'red.300' : 'whiteAlpha.200'} borderRadius="lg" bg={isBlendInvalid ? 'red.900' : 'whiteAlpha.50'} px={3} py={2}>
            <Stack spacing={1}>
              <Text fontSize="xs" color={isBlendInvalid ? 'red.200' : 'slate.400'}>
                Blend Total: {blendTotal}%
              </Text>
              <Text fontSize="xs" color={isBlendInvalid ? 'red.200' : 'slate.400'}>
                Remaining: {Math.max(0, blendRemaining)}%
              </Text>
              {isBlendInvalid ? (
                <Box borderWidth="1px" borderColor="red.300" borderRadius="md" bg="rgba(127, 29, 29, 0.65)" px={2} py={1.5}>
                  <Text fontSize="sm" color="red.100" fontWeight="semibold">
                    Total ratio cannot exceed 100%.
                  </Text>
                  <Text fontSize="xs" color="red.200">
                    Apply Blend is disabled until one or more source weights are reduced.
                  </Text>
                </Box>
              ) : null}
            </Stack>
          </Box>

          <Box borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="lg" bg="whiteAlpha.50" px={3} py={2}>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                <Text fontSize="xs" color="slate.400">Apply Status</Text>
                <Badge px={2} py={0.5} textTransform="none" borderRadius="md" bg={tone.bg} color={tone.color} borderWidth="1px" borderColor="whiteAlpha.200">
                  {tone.label}
                </Badge>
              </Box>
              <Text fontSize="sm" color={applyStatus === 'failed' ? 'red.200' : 'slate.200'}>
                {statusMessage ?? 'Apply to submit blend job and refresh model output.'}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </DashboardCard>
  );
};

export default ModelComparisonPanel;
