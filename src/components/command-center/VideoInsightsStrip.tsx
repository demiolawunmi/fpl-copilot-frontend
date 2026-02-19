import type { VideoInsight } from '../../data/commandCenterMocks';

interface Props {
  videos: VideoInsight[];
}

const VideoInsightsStrip = ({ videos }: Props) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Gameweek Videos
        </h2>
        <p className="text-xs text-slate-400 mt-1">Curated FPL content</p>
      </div>
      <div className="px-5 py-4">
        {/* Horizontal scrolling container */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700 h-full">
                <p className="text-sm font-semibold text-white line-clamp-2">{video.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{video.source}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoInsightsStrip;
