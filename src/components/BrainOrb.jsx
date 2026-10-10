import { useEffect, useRef, useState } from 'react';
import { useScrollY, prefersReducedMotion } from '../hooks/useScrollY';

// Tracks pointer position over `ref`'s element, as a -0.5..0.5 offset
// from center on each axis. Used for the mouse-tilt effect.
function usePointerTilt() {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setOffset({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    };
    const onLeave = () => setOffset({ x: 0, y: 0 });

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return [ref, offset];
}

// A glassmorphic "floating" brain — the SMARA brain+hands mark inside a
// frosted glass panel, surrounded by soft drifting color blobs. Tilts in
// real 3D (CSS perspective) toward the cursor and gently toward scroll
// position, with a continuous idle float for life even at rest.
function BrainOrb() {
  const [ref, pointer] = usePointerTilt();
  const scrollY = useScrollY();
  const reduceMotion = prefersReducedMotion();

  const scrollTilt = reduceMotion ? 0 : Math.min(scrollY * 0.02, 8);
  const rotateX = reduceMotion ? 0 : pointer.y * -22 + scrollTilt;
  const rotateY = reduceMotion ? 0 : pointer.x * 22;

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96">
      {/* drifting aurora blobs */}
      <div aria-hidden className="absolute -inset-12 -z-10">
        <div className="absolute left-2 top-4 h-40 w-40 rounded-full bg-violet-400/60 blur-3xl animate-blob-float-a" />
        <div className="absolute right-0 top-14 h-32 w-32 rounded-full bg-sky-400/55 blur-3xl animate-blob-float-b" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/45 blur-3xl animate-blob-float-a" />
        <div className="absolute bottom-10 right-4 h-28 w-28 rounded-full bg-amber-300/45 blur-3xl animate-blob-float-b" />
      </div>

      {/* idle bob (vertical only — kept on its own layer so it never fights the tilt transform) */}
      <div className={reduceMotion ? '' : 'animate-orb-float'}>
        {/* pointer/scroll tilt (real 3D via perspective) */}
        <div
          ref={ref}
          style={{ perspective: '1000px' }}
          className="flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72"
        >
          <div
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.2s ease-out',
            }}
            className="flex h-full w-full items-center justify-center rounded-[2.5rem] border border-white/70 bg-white/40 shadow-[0_35px_70px_-25px_rgba(109,40,217,0.45)] backdrop-blur-xl"
          >
            <img
              src="/logo-mark.png"
              alt="SMARA — brain cradled by caring hands"
              className="h-40 w-40 object-contain sm:h-56 sm:w-56"
              style={{ filter: 'drop-shadow(0 10px 26px rgba(109, 40, 217, 0.35))' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrainOrb;
