import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import type { VideoInsight } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  videos: VideoInsight[];
}

const VideoInsightsStrip = ({ videos }: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Gameweek Videos" description="Curated FPL content" />
      <Box px={5} py={4}>
        <HStack spacing={4} overflowX="auto" pb={2} sx={cardScrollSx} align="stretch">
          {videos.map((video) => (
            <Box key={video.id} minW="18rem" maxW="18rem" flexShrink={0}>
              <Stack h="full" spacing={2} p={4} borderRadius="xl" bg="rgba(30, 41, 59, 0.4)" borderWidth="1px" borderColor="whiteAlpha.200">
                <Text fontSize="sm" fontWeight="semibold" color="white" noOfLines={2}>
                  {video.title}
                </Text>
                <HStack spacing={2} fontSize="xs" color="slate.400">
                  <Text>{video.source}</Text>
                  <Text>•</Text>
                  <Text>{video.duration}</Text>
                </HStack>
                <HStack spacing={1.5} flexWrap="wrap" mt="auto">
                  {video.tags.map((tag) => (
                    <Box key={tag} px={2} py={0.5} fontSize="10px" fontWeight="medium" borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200" bg="whiteAlpha.100" color="slate.300">
                      {tag}
                    </Box>
                  ))}
                </HStack>
              </Stack>
            </Box>
          ))}
        </HStack>
      </Box>
    </DashboardCard>
  );
};

export default VideoInsightsStrip;
