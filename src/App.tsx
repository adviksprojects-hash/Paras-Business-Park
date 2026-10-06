import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Features } from './components/Features';
import { Gallery } from './components/Gallery';
import { Amenities } from './components/Amenities';
import { SitePlans } from './components/SitePlans';
import { Location } from './components/Location';
import { Bookings } from './components/Bookings';
import { Contact } from './components/Contact';
import { Blogs } from './components/Blogs';
import { Footer } from './components/Footer';

const AdminPanel = lazy(() =>
  import('./components/AdminPanel').then((module) => ({
    default: module.AdminPanel,
  }))
);

function PageLoading() {
  return (
    <div className='min-h-screen bg-neutral-900 flex items-center justify-center text-white'>
      <div className='flex flex-col items-center gap-3'>
        <div className='w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin' />
        <span className='text-xs text-gray-400 tracking-wider uppercase font-semibold'>
          Loading Admin Portal...
        </span>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Gallery />
      <Amenities />
      <SitePlans />
      <Location />
      <Bookings />
      <Contact />
      <Blogs />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route
          path='/admin'
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminPanel />
            </Suspense>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
