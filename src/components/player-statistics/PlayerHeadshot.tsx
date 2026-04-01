import { useState } from 'react';
import { Box, Center, Image } from '@chakra-ui/react';
import { getPlayerPhotoUrl } from '../../api/fpl/fpl';

type Size = 'sm' | 'md' | 'lg' | 'hero';

/** All sizes use 110x140 CDN path (confirmed working); only the rendered box size changes. */
const SIZE_MAP: Record<Size, { box: string; fontSize: string; photoSize: '110x140' }> = {
  sm: { box: '28px', fontSize: '9px', photoSize: '110x140' },
  md: { box: '36px', fontSize: '10px', photoSize: '110x140' },
  lg: { box: '56px', fontSize: '12px', photoSize: '110x140' },
  hero: { box: '96px', fontSize: '16px', photoSize: '110x140' },
};

interface PlayerHeadshotProps {
  code: number;
  name: string;
  size?: Size;
}

const PlayerHeadshot = ({ code, name, size = 'md' }: PlayerHeadshotProps) => {
  const [failed, setFailed] = useState(false);
  const cfg = SIZE_MAP[size];

  if (!code || failed) {
    return (
      <Center
        boxSize={cfg.box}
        flexShrink={0}
        borderRadius="full"
        bg="slate.700"
        fontSize={cfg.fontSize}
        fontWeight="bold"
        color="white"
        textTransform="uppercase"
      >
        {name.slice(0, 3)}
      </Center>
    );
  }

  return (
    <Box
      boxSize={cfg.box}
      flexShrink={0}
      borderRadius="full"
      overflow="hidden"
      bg="rgba(51, 65, 85, 0.4)"
    >
      <Image
        src={getPlayerPhotoUrl(code, cfg.photoSize)}
        alt={name}
        w="full"
        h="full"
        objectFit="cover"
        objectPosition="top center"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </Box>
  );
};

export default PlayerHeadshot;
