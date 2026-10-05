import { useEffect, useState } from 'react';
import { Building2, Car, HardHat, Ship, Wrench, Zap, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import ServiceArt from './ServiceArt.jsx';

const ICONS = { Building2, Ship, HardHat, Zap, Wrench, Car };

const PROPERTY_VIDEOS = [
  '/property_video_01.mp4',
  '/property_video_02.mp4',
  '/property_video_03.mp4',
  '/property_video_04.mp4',
];

export default function ServiceCard({ service, onEnquire }) {
  const Icon = ICONS[service.icon] ?? Building2;
  const isProperty = service.title === 'Property Sale & Purchase';

  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    if (!isProperty) return;

    const timer = setInterval(() => {
      setCurrentVideo((current) => (current + 1) % PROPERTY_VIDEOS.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isProperty]);

  const previousVideo = () => {
    setCurrentVideo(
      (current) =>
        (current - 1 + PROPERTY_VIDEOS.length) % PROPERTY_VIDEOS.length
    );
  };

  const nextVideo = () => {
    setCurrentVideo(
      (current) => (current + 1) % PROPERTY_VIDEOS.length
    );
  };

  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-gold-400/60">

      <div className="relative aspect-[16/10] overflow-hidden">

        {isProperty ? (
          <>
            <video
              key={PROPERTY_VIDEOS[currentVideo]}
              src={PROPERTY_VIDEOS[currentVideo]}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent pointer-events-none" />

            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-navy-950/75 px-3 py-1.5 text-xs font-medium text-gold-300 backdrop-blur">
              <Play className="h-3.5 w-3.5 fill-current" />
              PROPERTY
            </div>

            <button
              type="button"
              onClick={previousVideo}
              aria-label="Previous property video"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-navy-950/70 p-2 text-white backdrop-blur transition hover:bg-navy-950"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={nextVideo}
              aria-label="Next property video"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-navy-950/70 p-2 text-white backdrop-blur transition hover:bg-navy-950"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {PROPERTY_VIDEOS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentVideo(index)}
                  aria-label={`Show property video ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentVideo
                      ? 'w-7 bg-gold-400'
                      : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <ServiceArt id={service.id} />

            <div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950/90 to-transparent"
              aria-hidden="true"
            />

            <span className="absolute bottom-3 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/50 bg-navy-950/80 text-gold-300">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-snug text-pearl">
          {service.title}
        </h3>

        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-mist">
          {service.description}
        </p>

        <button
          type="button"
          className="btn-outline mt-6 w-full"
          onClick={() => onEnquire(service.title)}
          aria-label={`Enquire now about ${service.title}`}
        >
          ENQUIRE NOW
        </button>
      </div>
    </article>
  );
}
