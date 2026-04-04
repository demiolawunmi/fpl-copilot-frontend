import { useState } from 'react';
import { Box, Button, HStack, List, ListItem, Text } from '@chakra-ui/react';
import type { CommandCenterAISummary } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader } from '../ui/dashboard';

interface Props {
  summary: CommandCenterAISummary;
  /** Re-run the model blend to refresh AI summary (same as Apply Blend in AI Sandbox). */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  disableRefresh?: boolean;
}

const AICommandSummary = ({ summary, onRefresh, isRefreshing = false, disableRefresh = false }: Props) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <DashboardCard>
      <DashboardHeader
        title={summary.title}
        description={`AI-powered insights for GW ${summary.gameweek}`}
        action={
          <Button
            size="xs"
            variant="outline"
            borderColor="whiteAlpha.200"
            color="slate.300"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            _disabled={{ opacity: 0.45, cursor: 'not-allowed' }}
            onClick={onRefresh}
            isDisabled={disableRefresh || !onRefresh}
            isLoading={isRefreshing}
            loadingText="Refreshing"
          >
            Refresh
          </Button>
        }
      />

      <Box px={5} py={4}>
        <List spacing={4}>
          {summary.bullets.map((bullet, idx) => (
            <ListItem key={idx}>
              <Box display="flex" flexDirection="column" gap={2}>
                <HStack align="flex-start" spacing={3}>
                  <Dot tone={bullet.tone} />
                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" color="slate.200" lineHeight="shorter">
                      {bullet.text}
                    </Text>
                    <Button
                      mt={1}
                      variant="link"
                      size="xs"
                      color="brand.400"
                      _hover={{ color: 'brand.300' }}
                      onClick={() => toggleExpand(idx)}
                    >
                      {expandedIndex === idx ? '▼ Hide details' : '▶ Why?'}
                    </Button>
                  </Box>
                </HStack>

                {expandedIndex === idx ? (
                  <Box ml={8} pl={4} borderLeftWidth="2px" borderColor="whiteAlpha.200">
                    <Text fontSize="xs" color="slate.400" lineHeight="tall">
                      {bullet.why}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </DashboardCard>
  );
};

function Dot({ tone }: { tone: 'good' | 'info' | 'warn' }) {
  const bg = tone === 'good' ? 'brand.400' : tone === 'warn' ? 'yellow.400' : 'sky.400';
  return <Box mt={2} boxSize={2} borderRadius="full" bg={bg} flexShrink={0} />;
}

export default AICommandSummary;
