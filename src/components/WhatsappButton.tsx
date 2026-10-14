import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SocialItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  tooltip: string;
  brandColor: string;
  hoverGlow: string;
  iconSize: string;
  hasNotification?: boolean;
}

const WhatsAppButton = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);

  const phoneNumber = '+918888466667';
  const whatsappMessage = 'Hello, I would like to enquire about Paras Business Park.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setIsAdminPage(true);
    }

    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isAdminPage) return null;

  const socials: SocialItem[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/paras_business_park?igsh=azN2ZnlodHZ6Z3M=9',
      icon: '/instagram.png',
      tooltip: 'Follow on Instagram',
      brandColor: 'hover:border-pink-500',
      hoverGlow: 'hover:shadow-pink-500/40',
      iconSize: 'w-6 h-6 sm:w-6.5 sm:h-6.5',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61571490455673&mibextid=ZbWKwL',
      icon: '/facebook.png',
      tooltip: 'Connect on Facebook',
      brandColor: 'hover:border-blue-600',
      hoverGlow: 'hover:shadow-blue-500/40',
      iconSize: 'w-6 h-6 sm:w-6.5 sm:h-6.5',
    },
    {
      id: 'twitter',
      name: 'Twitter (X)',
      url: 'https://x.com/ParasBizzPark',
      icon: '/twitter.png',
      tooltip: 'Follow on Twitter (X)',
      brandColor: 'hover:border-neutral-900',
      hoverGlow: 'hover:shadow-neutral-600/40',
      iconSize: 'w-6 h-6 sm:w-6.5 sm:h-6.5',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCpyV-jPoe5CPt6UA_CYcZEg',
      icon: '/youtube.png',
      tooltip: 'Subscribe on YouTube',
      brandColor: 'hover:border-red-600',
      hoverGlow: 'hover:shadow-red-500/40',
      iconSize: 'w-6 h-6 sm:w-6.5 sm:h-6.5',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: whatsappUrl,
      icon: '/gallary/WhatsApp.svg',
      tooltip: 'Chat on WhatsApp',
      brandColor: 'hover:border-green-600',
      hoverGlow: 'hover:shadow-green-500/50',
      iconSize: 'w-7 h-7 sm:w-8 sm:h-8',
      hasNotification: true,
    },
  ];

  return (
    <aside
      aria-label='Direct Social & Contact Links'
      className='fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto select-none'
    >
      {socials.map((item, index) => {
        const isWhatsApp = item.id === 'whatsapp';

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.3 }}
            className='relative group flex items-center'
          >
            {/* Tooltip on the left */}
            <span className='absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-neutral-900/95 text-white text-xs font-bold tracking-wide backdrop-blur-md shadow-2xl border border-neutral-700/80 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50'>
              {item.tooltip}
            </span>

            {/* Direct Link Button */}
            <a
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={item.name}
              className={`relative flex items-center justify-center rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-115 active:scale-95 cursor-pointer ${
                isWhatsApp
                  ? 'w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#1fb855] text-white border-2 border-white/80'
                  : `w-11 h-11 sm:w-12 sm:h-12 bg-white/95 hover:bg-white border-2 border-gray-200/90 ${item.brandColor}`
              } ${item.hoverGlow}`}
            >
              <img
                src={item.icon}
                alt={item.name}
                className={`${item.iconSize} object-contain transition-transform duration-200 group-hover:scale-105 pointer-events-none`}
              />

              {/* Notification Badge on WhatsApp */}
              {item.hasNotification && showNotification && (
                <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md animate-bounce'>
                  1
                </span>
              )}
            </a>
          </motion.div>
        );
      })}
    </aside>
  );
};

export default WhatsAppButton;
