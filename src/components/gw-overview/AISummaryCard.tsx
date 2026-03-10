import { Badge, Box, Button, HStack, List, ListItem, Text } from "@chakra-ui/react";
import type { AISummary, AISummaryTone, GWInfo } from "../../data/gwOverviewMocks";
import { DashboardCard, DashboardHeader } from "../ui/dashboard";

type Props = {
    gwInfo: GWInfo;
    summary: AISummary;
};

export default function AiSummaryCard({ gwInfo, summary }: Props) {
    return (
        <DashboardCard as="section">
            <DashboardHeader
                title={summary.heading}
                description={`GW ${gwInfo.gameweek} • ${gwInfo.teamName} • ${gwInfo.manager} • ${gwInfo.teamId}`}
                action={
                    <Badge
                        borderRadius="full"
                        px={2}
                        py={1}
                        textTransform="none"
                        bg="whiteAlpha.100"
                        color="slate.300"
                        borderWidth="1px"
                        borderColor="whiteAlpha.200"
                    >
                        MVP
                    </Badge>
                }
            />

            <Box px={5} py={4}>
                <Text fontSize="sm" color="slate.300" lineHeight="tall">
                    {summary.intro}
                </Text>

                <List mt={4} spacing={3}>
                    {summary.items.map((item, idx) => (
                        <ListItem key={idx} display="flex" alignItems="flex-start" gap={3}>
                            <Dot tone={item.tone} />
                            <Text fontSize="sm" color="slate.200" lineHeight="shorter">
                                {item.text}
                            </Text>
                        </ListItem>
                    ))}
                </List>

                <HStack mt={5} justify="space-between" align="center" spacing={3}>
                    <Text fontSize="xs" color="slate.500">
                        {summary.footerHint ?? "More detail coming soon."}
                    </Text>
                    <Button size="sm" variant="outline" isDisabled borderColor="whiteAlpha.200" color="slate.500">
                        Refresh
                    </Button>
                </HStack>
            </Box>
        </DashboardCard>
    );
}

function Dot({ tone }: { tone: AISummaryTone }) {
    const bg = tone === "good" ? "brand.400" : tone === "warn" ? "yellow.400" : "sky.400";
    return <Box mt={2} boxSize={2} borderRadius="full" bg={bg} flexShrink={0} />;
}
