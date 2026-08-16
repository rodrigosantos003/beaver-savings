import { river } from "@/lib/palette";

const wavePath =
  "M0 40 C360 90 720 0 1080 40 C1260 60 1380 50 1440 40 V120 H0 Z";

export function RiverWaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${river[50]} 0%, ${river[100]} 45%, ${river[200]}80 100%)`,
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-48">
        <div className="river-wave-track absolute bottom-0 h-full w-[200%]">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-full w-1/2"
          >
            <path d={wavePath} fill={river[200]} fillOpacity={0.55} />
          </svg>
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-1/2 h-full w-1/2"
          >
            <path d={wavePath} fill={river[200]} fillOpacity={0.55} />
          </svg>
        </div>

        <div className="river-wave-track river-wave-track-slow absolute bottom-0 h-[85%] w-[200%]">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-full w-1/2"
          >
            <path d={wavePath} fill={river[300]} fillOpacity={0.35} />
          </svg>
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-1/2 h-full w-1/2"
          >
            <path d={wavePath} fill={river[300]} fillOpacity={0.35} />
          </svg>
        </div>

        <div className="river-wave-track river-wave-track-reverse absolute bottom-0 h-[70%] w-[200%]">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-full w-1/2"
          >
            <path d={wavePath} fill={river[400]} fillOpacity={0.2} />
          </svg>
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-1/2 h-full w-1/2"
          >
            <path d={wavePath} fill={river[400]} fillOpacity={0.2} />
          </svg>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:h-20"
      />
    </div>
  );
}
