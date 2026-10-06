import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export function ParallaxScroll({
  images,
}: {
  images: {
    url: string;
    title: string;
  }[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start start', 'end start'],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const rows = [
    {
      translate: translateFirst,
      images: images.slice(0, 3),
    },
    {
      translate: translateSecond,
      images: images.slice(3, 6),
    },
    {
      translate: translateThird,
      images: images.slice(6, 9),
    },
  ];

  return (
    <div ref={gridRef} className='relative h-[140vh] py-10 overflow-hidden'>
      <div className='grid grid-cols-1 gap-10 w-full h-full'>
        {rows.map((row, idx) => (
          <motion.div
            key={idx}
            style={{ y: row.translate }}
            className='grid grid-cols-1 md:grid-cols-3 gap-10 px-10'
          >
            {row.images.map((image, imageIdx) => (
              <div
                key={imageIdx}
                className='relative h-[300px] rounded-lg overflow-hidden group'
              >
                <img
                  src={image.url}
                  alt={image.title}
                  loading='lazy'
                  decoding='async'
                  className='object-cover w-full h-full'
                />
                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                  <h3 className='text-white text-2xl font-bold'>
                    {image.title}
                  </h3>
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
