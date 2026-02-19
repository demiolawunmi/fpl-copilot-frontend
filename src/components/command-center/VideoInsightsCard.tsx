import type { VideoInsight } from '../../data/commandCenterMocks';

interface Props {
  videos: VideoInsight[];
}

const VideoInsightsCard = ({ videos }: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Gameweek Videos
        </h2>
        <p className="text-xs text-slate-400 mt-1">Curated FPL content</p>
      </div>
      <div className="px-5 py-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-2 pb-3 border-b border-slate-800 last:border-0 last:pb-0"
            >
              <p className="text-sm font-semibold text-white">{video.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{video.source}</span>
                <span>•</span>
                <span>{video.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-medium rounded border border-slate-700 bg-slate-800/40 text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoInsightsCard;
