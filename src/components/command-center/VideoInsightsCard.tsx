import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import type { VideoInsight } from '../../data/commandCenterMocks';
import { DashboardCard, DashboardHeader, cardScrollSx } from '../ui/dashboard';

interface Props {
  videos: VideoInsight[];
}

const VideoInsightsCard = ({ videos }: Props) => {
  return (
    <DashboardCard>
      <DashboardHeader title="Gameweek Videos" description="Curated FPL content" />
      <Stack px={5} py={4} spacing={3} maxH="20rem" overflowY="auto" sx={cardScrollSx}>
        {videos.map((video, idx) => (
          <Box key={video.id} pb={3} borderBottomWidth={idx === videos.length - 1 ? '0' : '1px'} borderColor="whiteAlpha.100">
            <Text fontSize="sm" fontWeight="semibold" color="white">{video.title}</Text>
            <HStack mt={2} spacing={2} fontSize="xs" color="slate.400">
              <Text>{video.source}</Text>
              <Text>•</Text>
              <Text>{video.duration}</Text>
            </HStack>
            <HStack mt={2} spacing={1.5} flexWrap="wrap">
              {video.tags.map((tag) => (
                <Box key={tag} px={2} py={0.5} fontSize="10px" fontWeight="medium" borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200" bg="whiteAlpha.100" color="slate.300">
                  {tag}
                </Box>
              ))}
            </HStack>
          </Box>
        ))}
      </Stack>
    </DashboardCard>
  );
};

export default VideoInsightsCard;
