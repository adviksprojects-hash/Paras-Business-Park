const bannerItems = [
  {
    id: 'feature-investment',
    image: '/Feture Investment.png',
    title: 'Feature Investment',
  },
  {
    id: 'flats',
    image: '/flats.png',
    title: 'Luxury 2 & 3 BHK Flats',
  },
  {
    id: 'shops-and-office',
    image: '/Shops and Office.png',
    title: 'Commercial Shops & Offices',
  },
];

// Replicated to guarantee seamless continuous infinite loop across all screen sizes
const marqueeList = [
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
  ...bannerItems,
];

export function Hero() {
  const handleRedirectToBookings = () => {
    const bookingsElement = document.getElementById('bookings');
    if (bookingsElement) {
      bookingsElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#bookings';
    }
  };

  return (
    <section
      id='home'
      className='w-full pt-24 sm:pt-28 pb-10 sm:pb-12 bg-gradient-to-b from-purple-50/40 via-white to-gray-50/60 overflow-hidden'
    >
      {/* Relative container with subtle Left & Right edge blur light */}
      <div className='relative w-full overflow-hidden select-none py-2'>
        {/* Subtle Left Soft Edge Fade */}
        <div className='absolute left-0 top-0 bottom-0 w-12 sm:w-20 lg:w-28 z-20 pointer-events-none bg-gradient-to-r from-white/90 via-white/40 to-transparent' />

        {/* Subtle Right Soft Edge Fade */}
        <div className='absolute right-0 top-0 bottom-0 w-12 sm:w-20 lg:w-28 z-20 pointer-events-none bg-gradient-to-l from-white/90 via-white/40 to-transparent' />

        {/* Continuous Moving Images Track (Right-to-Left Infinite Loop) */}
        <div className='animate-marquee-horizontal flex w-max'>
          {/* First track */}
          <div className='flex shrink-0 items-center gap-5 sm:gap-7 pr-5 sm:pr-7'>
            {marqueeList.map((item, idx) => (
              <a
                key={`track1-${item.id}-${idx}`}
                href='#bookings'
                onClick={(e) => {
                  e.preventDefault();
                  handleRedirectToBookings();
                }}
                className='block shrink-0 cursor-pointer group focus:outline-none'
                title={`${item.title} - Click to Book`}
              >
                <div className='relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border border-gray-200/90 hover:border-amber-500/60 bg-white'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-[350px] sm:h-[420px] md:h-[480px] lg:h-[530px] w-auto object-contain select-none pointer-events-none'
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
              </a>
            ))}
          </div>

          {/* Second track (identical clone for seamless infinite loop) */}
          <div className='flex shrink-0 items-center gap-5 sm:gap-7 pr-5 sm:pr-7' aria-hidden='true'>
            {marqueeList.map((item, idx) => (
              <a
                key={`track2-${item.id}-${idx}`}
                href='#bookings'
                onClick={(e) => {
                  e.preventDefault();
                  handleRedirectToBookings();
                }}
                className='block shrink-0 cursor-pointer group focus:outline-none'
                title={`${item.title} - Click to Book`}
                tabIndex={-1}
              >
                <div className='relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border border-gray-200/90 hover:border-amber-500/60 bg-white'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='h-[350px] sm:h-[420px] md:h-[480px] lg:h-[530px] w-auto object-contain select-none pointer-events-none'
                    loading='lazy'
                    draggable={false}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
