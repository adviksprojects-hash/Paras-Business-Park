import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Phone, MessageCircle, ArrowRight, RefreshCw, X, User, Tag, IndianRupee } from 'lucide-react';

interface BookingUnit {
  id: number | string;
  title: string;
  unit_type: string;
  tag: string;
  price?: string;
  image: string;
  features: string[];
  description?: string;
  whatsapp_number?: string;
}

const defaultUnits: BookingUnit[] = [
  {
    id: 1,
    title: 'Retail Shops & Showrooms',
    unit_type: 'Shops / Showroom',
    tag: 'High Footfall',
    price: '₹ 20 Lakhs Onwards',
    image: '/gallary/store.jpg',
    features: [
      'Ground & 1st Floor prime road visibility',
      'Double-height glass front facades',
      'Adjacent to 3-screen multiplex & food court',
      'Ample basement & surface customer parking',
    ],
    description: 'Prime road-facing commercial shops and retail spaces designed for maximum customer visibility and high business turnover.',
    whatsapp_number: '+918888466667',
  },
  {
    id: 2,
    title: 'Luxurious 2 BHK Residences',
    unit_type: '2 BHK Residence',
    tag: 'Premium Living',
    price: '₹ 35 Lakhs Onwards',
    image: '/building1.jpg',
    features: [
      'Spacious master bedrooms & living halls',
      'Private balconies with panoramic views',
      'Designer entrance lobby & high-speed lifts',
      '24/7 biometric security & CCTV surveillance',
    ],
    description: 'Elegant 2 BHK modern homes equipped with private balcony access and high-end construction quality.',
    whatsapp_number: '+918888466667',
  },
  {
    id: 3,
    title: 'Luxurious 3 BHK Residences',
    unit_type: '3 BHK Residence',
    tag: 'Grand Lifestyle',
    price: '₹ 50 Lakhs Onwards',
    image: '/building2.jpg',
    features: [
      'Grand living & dining spaces',
      'Premium fixtures & private access zones',
      'Abundant natural light & ventilation',
      'Reserved multi-level vehicle parking',
    ],
    description: 'Expansive 3 BHK residences offering luxury lifestyle amenities in the heart of Solapur.',
    whatsapp_number: '+918888466667',
  },
  {
    id: 4,
    title: 'Corporate Office Spaces',
    unit_type: 'Corporate Office',
    tag: 'Business Hub',
    price: '₹ 18 Lakhs Onwards',
    image: '/gallary/office.jpg',
    features: [
      'Flexible modular floor plates',
      '100% generator power backup for uninterrupted work',
      'Fiber-optic high-speed connectivity',
      'Conference facilities & cafeteria access',
    ],
    description: 'Sophisticated corporate suites and offices tailored for modern enterprise and IT work environments.',
    whatsapp_number: '+918888466667',
  },
];

export function Bookings() {
  const [units, setUnits] = useState<BookingUnit[]>(defaultUnits);
  const [isLoading, setIsLoading] = useState(false);

  // Quick Booking Modal State
  const [bookingModalUnit, setBookingModalUnit] = useState<BookingUnit | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBookingUnits();
  }, []);

  const fetchBookingUnits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/booking-units');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.units && data.units.length > 0) {
          setUnits(data.units);
        }
      }
    } catch (err) {
      console.log('Using default booking units:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBookingModal = (unit: BookingUnit) => {
    setBookingModalUnit(unit);
    setClientName('');
    setClientPhone('');
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          phone: `+91 ${cleanPhone}`,
          unit_type: bookingModalUnit?.title || 'General Space',
          message: `Booking request for ${bookingModalUnit?.title} (${bookingModalUnit?.unit_type}) - Price: ${bookingModalUnit?.price || 'Standard'}`,
        }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || 'Failed to submit booking request');

      setSubmitSuccess(true);
      setClientName('');
      setClientPhone('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppInquiry = (unit: BookingUnit) => {
    const rawNumber = (unit.whatsapp_number || '+918888466667').replace(/[^0-9]/g, '');
    const priceText = unit.price ? ` (Estimated: ${unit.price})` : '';
    const message = `Hello, I would like to inquire about booking "${unit.title}" (${unit.unit_type})${priceText} at Paras Business Park, Solapur. Please share the pricing, floor plans, and booking process.`;
    const url = `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id='bookings' className='py-24 bg-neutral-900 text-white relative overflow-hidden'>
      {/* Background Ambient Glow */}
      <div className='absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl pointer-events-none' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Section Header */}
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold mb-4'>
            <Sparkles className='w-4 h-4' />
            Direct Developer Booking & Inquiries
          </div>
          <h2 className='text-4xl sm:text-5xl font-extrabold tracking-tight mb-4'>
            Book Your Space at Paras Business Park
          </h2>
          <p className='text-gray-400 text-lg leading-relaxed'>
            Choose your preferred commercial shop, showroom, corporate office, or luxury 2 & 3 BHK residence. Click <strong>Book Space</strong> to submit a quick booking request or inquire directly on WhatsApp.
          </p>
        </div>

        {/* Dynamic Booking Unit Cards */}
        {isLoading && units.length === 0 ? (
          <div className='py-20 text-center flex flex-col items-center justify-center gap-3 text-gray-400'>
            <RefreshCw className='w-8 h-8 animate-spin text-primary' />
            <span>Loading available spaces...</span>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            {units.map((unit) => {
              const featuresList = Array.isArray(unit.features) ? unit.features : [];

              return (
                <motion.div
                  key={unit.id}
                  whileHover={{ translateY: -8 }}
                  transition={{ duration: 0.2 }}
                  className='bg-neutral-800/90 border border-neutral-700/80 hover:border-primary/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group'
                >
                  <div>
                    <div className='relative h-52 w-full overflow-hidden'>
                      <img
                        src={unit.image || '/gallary/store.jpg'}
                        alt={unit.title}
                        loading='lazy'
                        decoding='async'
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/gallary/store.jpg';
                        }}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30' />
                      <span className='absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-primary border border-primary/30'>
                        {unit.tag || 'Available'}
                      </span>
                    </div>

                    <div className='p-6 space-y-4'>
                      <div>
                        <span className='text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1'>
                          {unit.unit_type}
                        </span>
                        <h3 className='text-xl font-bold text-white group-hover:text-primary transition-colors'>
                          {unit.title}
                        </h3>

                        {/* Optional Price Display */}
                        {unit.price && (
                          <div className='mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-bold'>
                            <IndianRupee className='w-4 h-4' />
                            <span>{unit.price}</span>
                          </div>
                        )}
                      </div>

                      {unit.description && (
                        <p className='text-gray-400 text-xs line-clamp-2 leading-relaxed'>
                          {unit.description}
                        </p>
                      )}

                      {featuresList.length > 0 && (
                        <ul className='space-y-2 text-xs text-gray-300 pt-2 border-t border-neutral-700/60'>
                          {featuresList.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className='flex items-start gap-2'>
                              <Check className='w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5' />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className='p-6 pt-0 space-y-2.5'>
                    {/* Primary Button: Request to Book Modal Form */}
                    <button
                      onClick={() => handleOpenBookingModal(unit)}
                      className='w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:via-amber-400 hover:to-orange-400 text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/35 hover:shadow-orange-500/60 hover:scale-[1.02] cursor-pointer'
                    >
                      <Sparkles className='w-4 h-4' />
                      Book Space
                    </button>

                    {/* Secondary WhatsApp Button */}
                    <button
                      onClick={() => openWhatsAppInquiry(unit)}
                      className='w-full py-2.5 px-4 rounded-2xl bg-neutral-700/80 hover:bg-green-600 text-gray-200 hover:text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer'
                    >
                      <MessageCircle className='w-3.5 h-3.5' />
                      WhatsApp Inquiry
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Booking Modal (Name & Mobile No Form) */}
      <AnimatePresence>
        {bookingModalUnit && (
          <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-neutral-800 border border-neutral-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative'
            >
              <button
                onClick={() => setBookingModalUnit(null)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-neutral-900/60 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>

              <div className='text-center space-y-2'>
                <div className='w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/30 mb-2'>
                  <Sparkles className='w-7 h-7' />
                </div>
                <h3 className='text-2xl font-bold text-white'>Request Booking</h3>
                <p className='text-xs text-amber-400 font-semibold uppercase tracking-wider'>
                  {bookingModalUnit.title} ({bookingModalUnit.unit_type})
                </p>
                {bookingModalUnit.price && (
                  <p className='text-xs text-gray-300 font-medium'>
                    Price: <span className='text-white font-bold'>{bookingModalUnit.price}</span>
                  </p>
                )}
              </div>

              {submitSuccess ? (
                <div className='text-center py-6 space-y-4'>
                  <div className='w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto text-green-400 shadow-lg shadow-green-500/20'>
                    <Check className='w-8 h-8' />
                  </div>
                  <h4 className='text-xl font-bold text-white'>Booking Request Received!</h4>
                  <p className='text-gray-300 text-sm'>
                    Your request for <strong className='text-white'>{bookingModalUnit.title}</strong> has been forwarded directly to our admin team. We will call you shortly.
                  </p>
                  <button
                    onClick={() => setBookingModalUnit(null)}
                    className='w-full py-3.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 hover:from-green-400 hover:to-emerald-400 text-white font-extrabold text-base rounded-xl shadow-lg shadow-green-500/40 hover:shadow-green-500/60 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer'
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className='space-y-4'>
                  {errorMessage && (
                    <div className='p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center'>
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-1.5'>
                      Full Name *
                    </label>
                    <div className='relative'>
                      <User className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                      <input
                        type='text'
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder='Enter your full name'
                        className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-1.5'>
                      Mobile Number (10 Digits) *
                    </label>
                    <div className='flex items-stretch rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900 focus-within:border-primary transition-colors'>
                      <div className='flex items-center gap-1.5 px-3.5 bg-neutral-800 border-r border-neutral-700 text-gray-300 font-semibold text-sm select-none'>
                        <Phone className='w-4 h-4 text-primary' />
                        <span>+91</span>
                      </div>
                      <input
                        type='tel'
                        required
                        maxLength={10}
                        value={clientPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setClientPhone(digitsOnly);
                        }}
                        placeholder='9876543210'
                        className='w-full bg-transparent px-3.5 py-2.5 text-white text-sm focus:outline-none tracking-wider placeholder:text-neutral-500'
                      />
                    </div>
                    <div className='flex items-center justify-between text-[11px] text-gray-400 mt-1 px-1'>
                      <span>Enter 10-digit Indian mobile number</span>
                      <span className={clientPhone.length === 10 ? 'text-green-400 font-semibold' : 'text-gray-400'}>
                        {clientPhone.length}/10 digits
                      </span>
                    </div>
                  </div>

                  <p className='text-xs text-gray-400 text-center'>
                    Your details will be sent directly to the Paras Business Park administration desk.
                  </p>

                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:via-amber-400 hover:to-orange-400 text-white font-extrabold rounded-xl shadow-xl shadow-orange-500/40 hover:shadow-orange-500/70 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 text-base cursor-pointer'
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className='w-5 h-5 animate-spin text-white' />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Sparkles className='w-5 h-5 text-white animate-pulse' />
                        Request to Booking
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
