import { useState, useEffect, useRef, useCallback } from 'react';

interface BannerItem {
  id: string;
  image: string;
  title: string;
}

const bannerItems: BannerItem[] = [
  {
    id: 'feature-investment',
    image: '/feature-investment.jpg',
    title: 'Feature Investment',
  },
  {
    id: 'flats',
    image: '/flats.jpg',
    title: 'Luxury 2 & 3 BHK Flats',
  },
  {
    id: 'shops-and-office',
    image: '/shops-and-office.jpg',
    title: 'Commercial Shops & Offices',
  },
];

// Replicated 6 times to provide ample buffer for seamless infinite drag in both directions
const carouselList: BannerItem[] = [
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
];

export function Hero() {
  const [isImagesReady, setIsImagesReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const item0Ref = useRef<HTMLAnchorElement>(null);
  const item3Ref = useRef<HTMLAnchorElement>(null);

  const currentOffsetRef = useRef(0);
  const setWidthRef = useRef(0);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const movedDistanceRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const isHoveredRef = useRef(false);

  // Measure one complete set width (item 3 offset - item 0 offset)
  const updateSetWidth = useCallback(() => {
    if (item0Ref.current && item3Ref.current) {
      const dist = item3Ref.current.offsetLeft - item0Ref.current.offsetLeft;
      if (dist > 0) {
        setWidthRef.current = dist;
      }
    }
  }, []);

  // Preload unique banner images
  useEffect(() => {
    let loadedCount = 0;
    const urls = bannerItems.map((b) => b.image);

    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
      const onDone = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          setIsImagesReady(true);
        }
      };
      if (img.complete) {
        onDone();
      } else {
        img.onload = onDone;
        img.onerror = onDone;
      }
    });
  }, []);

  // Update set width on layout changes and resize
  useEffect(() => {
    if (!isImagesReady) return;
    updateSetWidth();

    const handleResize = () => {
      updateSetWidth();
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(updateSetWidth, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isImagesReady, updateSetWidth]);

  // Unified RequestAnimationFrame loop for auto-motion, drag physics & momentum
  useEffect(() => {
    let animId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      const setWidth = setWidthRef.current;

      if (setWidth > 0 && !isDraggingRef.current) {
        // Momentum coasting after a finger/mouse flick
        if (Math.abs(velocityRef.current) > 0.08) {
          currentOffsetRef.current += velocityRef.current * (dt * 1000);
          velocityRef.current *= 0.93; // Smooth friction deceleration
        } else {
          velocityRef.current = 0;
          // Auto-scroll pace: faster on mobile for lively continuous flow
          if (!isHoveredRef.current) {
            const isMobile = window.innerWidth < 640;
            const autoSpeed = isMobile ? 85 : 95; // pixels per second
            currentOffsetRef.current -= autoSpeed * dt;
          }
        }

        // Seamless infinite wrap in both directions
        while (currentOffsetRef.current <= -setWidth) {
          currentOffsetRef.current += setWidth;
        }
        while (currentOffsetRef.current > 0) {
          currentOffsetRef.current -= setWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${currentOffsetRef.current}px, 0, 0)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Pointer Drag Handlers (works seamlessly for Touch, Mouse, and Stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = currentOffsetRef.current;
    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    movedDistanceRef.current = 0;
    velocityRef.current = 0;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const deltaX = currentX - dragStartXRef.current;
    movedDistanceRef.current = Math.abs(deltaX);

    // Calculate instantaneous release velocity
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (currentX - lastPointerXRef.current) / dt;
    }
    lastPointerXRef.current = currentX;
    lastTimeRef.current = now;

    let newOffset = dragStartOffsetRef.current + deltaX;
    const setWidth = setWidthRef.current;

    if (setWidth > 0) {
      while (newOffset <= -setWidth) newOffset += setWidth;
      while (newOffset > 0) newOffset -= setWidth;
    }

    currentOffsetRef.current = newOffset;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${newOffset}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Redirect directly to Bookings section
  const handleRedirectToBookings = () => {
    const bookingsElement = document.getElementById('bookings');
    if (bookingsElement) {
      bookingsElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#bookings';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the user was dragging/swiping images, don't trigger the click redirect
    if (movedDistanceRef.current > 8) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    handleRedirectToBookings();
  };

  return (
    <section
      id='home'
      className='w-full pt-24 sm:pt-28 pb-10 sm:pb-12 bg-gradient-to-b from-purple-50/40 via-white to-gray-50/60 overflow-hidden'
    >
      {/* Interactive Drag & Continuous Carousel Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        className='relative w-full overflow-hidden select-none py-2 min-h-[350px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[530px] flex items-center cursor-grab active:cursor-grabbing touch-pan-y'
      >
        {/* Subtle Left Soft Edge Fade */}
        <div className='absolute left-0 top-0 bottom-0 w-12 sm:w-20 lg:w-28 z-20 pointer-events-none bg-gradient-to-r from-white/90 via-white/40 to-transparent' />

        {/* Subtle Right Soft Edge Fade */}
        <div className='absolute right-0 top-0 bottom-0 w-12 sm:w-20 lg:w-28 z-20 pointer-events-none bg-gradient-to-l from-white/90 via-white/40 to-transparent' />

        {/* Continuous Interactive Track (controlled by touch, mouse drag, and smooth auto-play) */}
        <div
          ref={trackRef}
          className={`flex w-max shrink-0 items-center gap-4 sm:gap-6 transition-opacity duration-500 will-change-transform ${
            isImagesReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {carouselList.map((item, idx) => {
            const isItem0 = idx === 0;
            const isItem3 = idx === 3;

            return (
              <a
                key={`${item.id}-${idx}`}
                ref={isItem0 ? item0Ref : isItem3 ? item3Ref : undefined}
                href='#bookings'
                onClick={handleCardClick}
                className='block shrink-0 cursor-pointer group focus:outline-none'
                title={`${item.title} - Click to Book`}
              >
                <div className='relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border border-gray-200/90 hover:border-amber-500/60 bg-white'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-[340px] sm:h-[400px] md:h-[460px] lg:h-[500px] w-auto object-contain select-none pointer-events-none'
                    loading='eager'
                    decoding='async'
                    draggable={false}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
