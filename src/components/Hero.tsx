import { motion } from 'framer-motion';
import { Spotlight } from './ui/spotlight';

export function Hero() {
  return (
    <section id='home' className='w-full pt-28 pb-12 bg-white'>
      <Spotlight className='w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-4'>
        <div className='w-full text-center flex justify-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full flex justify-center'
          >
            <div className='relative w-[90vw] max-w-[90vw] mx-auto overflow-hidden rounded-2xl shadow-2xl border border-gray-200 bg-black'>
              <video
                src='/Paras_Business_Park.mp4'
                poster='/building1.jpg'
                preload='metadata'
                autoPlay
                loop
                muted
                playsInline
                controls
                className='w-full h-auto object-cover max-h-[85vh] rounded-2xl'
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </Spotlight>
    </section>
  );
}



