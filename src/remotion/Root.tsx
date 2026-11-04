import React from 'react';
import { Composition } from 'remotion';
import '../index.css';
import { AudiobookComposition } from './audiobook/AudiobookComposition';
import { AudiobookThumbnailComposition } from './audiobook/AudiobookThumbnailComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. High-Definition Audiobook Video Composition (1080p Full HD & 2K QHD 1440p) */}
      <Composition
        id="AudiobookVideo"
        component={AudiobookComposition as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={({ props }: { props: any }) => {
          const is2K = props?.resolution === '2k' || props?.resolution === '1440p';
          return {
            width: is2K ? 2560 : 1920,
            height: is2K ? 1440 : 1080,
          };
        }}
        defaultProps={{
          headerTitle: 'သူ့ကိုမှ ချစ်မိသူ',
          subheader: 'မြန်မာ့လူမှုဘဝ ဝတ္ထုရှည်ကြီး',
          authorName: 'ဒေါ်ခင်ဆွေဦး',
          episodeText: 'အစအဆုံး',
          themeId: 'floating-bubbles',
          loopDurationFrames: 600,
        }}
      />

      {/* 2. High-CTR Audiobook YouTube Thumbnail Composition (1920x1080 16:9 Full HD Crisp) */}
      <Composition
        id="AudiobookThumbnail"
        component={AudiobookThumbnailComposition as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          headerTitle: 'သူ့ကိုမှ ချစ်မိသူ',
          subheader: 'မြန်မာ့လူမှုဘဝ ဝတ္ထုရှည်ကြီး',
          authorName: 'ဒေါ်ခင်ဆွေဦး',
          episodeText: 'အစအဆုံး',
          themeId: 'floating-bubbles',
          layoutId: 'layout-1-split',
        }}
      />
    </>
  );
};
