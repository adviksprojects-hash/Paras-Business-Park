import { motion } from 'framer-motion';
import { useRef } from 'react';

interface Item {
  image: string;
  title: string;
  description: string;
  area?: string;
  features?: string[];
}

interface MovingCardsProps {
  items: Item[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'slow';
  className?: string;
  onItemClick?: (item: Item) => void;
}

export function MovingCards({
  items,
  direction = 'left',
  speed = 'fast',
  className,
  onItemClick,
}: MovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSpeed = speed === 'fast' ? 25 : 50;

  // Calculate total width of items
  const itemWidth = 375; // 3:4 ratio with height of 500px
  const gap = 24; // 6 units in Tailwind (gap-6)
  const totalWidth = (itemWidth + gap) * items.length;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height: '520px' }} // Add extra space for the hover effect
    >
      <div className='flex absolute left-0 animate-none'>
        <motion.div
          animate={{
            x: [-totalWidth / 2, -totalWidth],
          }}
          transition={{
            duration: scrollSpeed,
            repeat: Infinity,
            ease: 'linear',
          }}
          className='flex gap-6'
        >
          {[...items, ...items].map((item, idx) => (
            <motion.div
              key={idx}
              onClick={() => onItemClick?.(item)}
              className='relative group w-[375px] h-[500px] overflow-hidden rounded-xl cursor-pointer flex-shrink-0'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading='lazy'
                decoding='async'
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='absolute bottom-0 p-6 text-white'>
                  <h3 className='text-2xl font-bold mb-2'>{item.title}</h3>
                  <p className='text-gray-200'>{item.description}</p>
                  {item.area && (
                    <p className='mt-2 text-purple-300'>Area: {item.area}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          animate={{
            x: [0, -totalWidth / 2],
          }}
          transition={{
            duration: scrollSpeed,
            repeat: Infinity,
            ease: 'linear',
          }}
          className='flex gap-6'
        >
          {[...items, ...items].map((item, idx) => (
            <motion.div
              key={`clone-${idx}`}
              onClick={() => onItemClick?.(item)}
              className='relative group w-[375px] h-[500px] overflow-hidden rounded-xl cursor-pointer flex-shrink-0'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading='lazy'
                decoding='async'
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='absolute bottom-0 p-6 text-white'>
                  <h3 className='text-2xl font-bold mb-2'>{item.title}</h3>
                  <p className='text-gray-200'>{item.description}</p>
                  {item.area && (
                    <p className='mt-2 text-purple-300'>Area: {item.area}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
