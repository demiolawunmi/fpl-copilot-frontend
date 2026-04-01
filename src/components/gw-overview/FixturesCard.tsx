import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import type { Fixture } from "../../data/gwOverviewMocks";
import { DashboardCard, DashboardHeader, cardScrollSx } from "../ui/dashboard";

interface Props {
  fixtures: Fixture[];
  isCurrentGw?: boolean; // true => newest→oldest by default
  heightPx?: number; // computed height to match pitch card bottom
}

type Order = "newest" | "oldest";

/* ── team badge (real image or fallback colored circle) ── */
const Badge = ({ abbr, color, badge }: { abbr: string; color: string; badge?: string }) => {
  const [failed, setFailed] = useState(false);
  if (badge && !failed) {
    return (
      <Image
        src={badge}
        alt={abbr}
        boxSize={8}
        objectFit="contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Flex
      boxSize={8}
      flexShrink={0}
      align="center"
      justify="center"
      borderRadius="full"
      fontSize="10px"
      fontWeight="bold"
      color="white"
      bg={color}
    >
      {abbr}
    </Flex>
  );
};

function toTime(f: Fixture) {
  // Prefer dateISO if you add it; fallback to Date.parse(date) if not.
  // (But Date.parse("Sat 15 Feb") is not reliable across browsers — add dateISO!)
  return f.dateISO ? Date.parse(f.dateISO) : Date.parse(f.date);
}

export default function FixturesCard({ fixtures, isCurrentGw = true, heightPx }: Props) {
  // Default behavior:
  // - current GW: newest → oldest
  // - old GW: oldest → newest
  const defaultOrder: Order = isCurrentGw ? "newest" : "oldest";
  const [order, setOrder] = useState<Order>(defaultOrder);

  // If isCurrentGw changes (user switches GW), reset to the new default
  // (Optional) If you DON'T want it to reset, remove this memo/logic.
  useEffect(() => {
    setOrder(defaultOrder);
  }, [defaultOrder]);

  const { groupKeys, grouped } = useMemo(() => {
    // group by display date
    const grouped = fixtures.reduce<Record<string, Fixture[]>>((acc, f) => {
      (acc[f.date] ??= []).push(f);
      return acc;
    }, {});

    // compute a representative timestamp per date group (min or max)
    const keyToTime = new Map<string, number>();
    for (const [date, arr] of Object.entries(grouped)) {
      const times = arr.map(toTime).filter((t) => Number.isFinite(t));
      // pick earliest time in group as group anchor
      keyToTime.set(date, times.length ? Math.min(...times) : 0);
    }

    const groupKeys = Object.keys(grouped).sort((a, b) => {
      const ta = keyToTime.get(a) ?? 0;
      const tb = keyToTime.get(b) ?? 0;
      return order === "newest" ? tb - ta : ta - tb;
    });

    // Also sort matches inside each date by kickoff time
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => {
        const ta = toTime(a);
        const tb = toTime(b);
        return order === "newest" ? tb - ta : ta - tb;
      });
    }

    return { groupKeys, grouped };
  }, [fixtures, order]);

  return (
    <DashboardCard
      display="flex"
      flexDirection="column"
      h={heightPx ? `${heightPx}px` : "520px"}
    >
      <DashboardHeader
        title="Fixtures"
        action={
          <HStack spacing={2}>
            <Text fontSize="xs" color="slate.500">
              Order
            </Text>
            <Button
              type="button"
              size="xs"
              variant="outline"
              borderColor="whiteAlpha.200"
              color="slate.200"
              _hover={{ bg: "whiteAlpha.100" }}
              onClick={() => setOrder((o) => (o === "newest" ? "oldest" : "newest"))}
            >
              {order === "newest" ? "Newest → Oldest" : "Oldest → Newest"}
            </Button>
          </HStack>
        }
      />

      <Box flex="1" overflow="auto" sx={cardScrollSx}>
        {groupKeys.map((date) => {
          const matches = grouped[date];
          return (
            <Box key={date}>
              {/* date header */}
              <Box px={5} py={2} bgGradient="linear(to-r, slate.800, slate.900)">
                <Text fontSize="xs" fontWeight="semibold" color="slate.400">
                  {date}
                </Text>
              </Box>

              {matches.map((m, i) => (
                <Flex
                  key={`${date}-${i}`}
                  align="center"
                  gap={3}
                  px={5}
                  py={3}
                  borderBottomWidth="1px"
                  borderColor="whiteAlpha.100"
                  _hover={{ bg: "whiteAlpha.50" }}
                >
                  {/* home */}
                  <Badge abbr={m.homeAbbr} color={m.homeColor} badge={m.homeBadge} />
                  <Text
                    w="20"
                    noOfLines={1}
                    textAlign="right"
                    fontSize="sm"
                    color="slate.300"
                  >
                    {m.homeTeam}
                  </Text>

                  {/* score */}
                  <Box
                    mx={2}
                    minW="56px"
                    rounded="lg"
                    bg="whiteAlpha.100"
                    px={3}
                    py={1}
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="white">
                      {m.homeScore} – {m.awayScore}
                    </Text>
                  </Box>

                  {/* away */}
                  <Text w="20" noOfLines={1} fontSize="sm" color="slate.300">
                    {m.awayTeam}
                  </Text>
                  <Badge abbr={m.awayAbbr} color={m.awayColor} badge={m.awayBadge} />

                  {/* chevron */}
                  <Icon as={FiChevronRight} boxSize={4} color="slate.600" ml="auto" />
                </Flex>
              ))}
            </Box>
          );
        })}
      </Box>
    </DashboardCard>
  );
}
