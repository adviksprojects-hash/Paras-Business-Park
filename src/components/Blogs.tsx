import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight, X, Sparkles, RefreshCw, Tag } from 'lucide-react';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  cover_image: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  created_at: string;
}

export function Blogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blogs');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Error loading blogs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))];

  const filteredBlogs = blogs.filter((blog) => {
    if (selectedCategory === 'All') return true;
    return blog.category === selectedCategory;
  });

  return (
    <section id='blogs' className='py-24 bg-neutral-950 text-white relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold mb-4'>
            <BookOpen className='w-4 h-4' />
            Official Updates & Articles
          </div>
          <h2 className='text-4xl sm:text-5xl font-extrabold tracking-tight mb-4'>
            Paras Business Park Blogs
          </h2>
          <p className='text-gray-400 text-lg'>
            Discover the latest news, commercial investment trends, architectural highlights, and lifestyle updates in Solapur.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className='flex flex-wrap items-center justify-center gap-2 mt-8'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className='py-20 text-center flex flex-col items-center justify-center gap-3 text-gray-400'>
            <RefreshCw className='w-8 h-8 animate-spin text-primary' />
            <span>Loading latest articles from administration...</span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className='py-20 text-center text-gray-400 bg-neutral-900 rounded-3xl border border-neutral-800 p-8'>
            <BookOpen className='w-12 h-12 text-neutral-600 mx-auto mb-3' />
            <h3 className='text-xl font-bold text-white'>No blog articles found</h3>
            <p className='text-sm text-gray-500 mt-1'>
              Articles posted via the Admin Panel will automatically appear here.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {filteredBlogs.map((blog, idx) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className='bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl'
              >
                <div>
                  <div className='relative h-56 w-full overflow-hidden'>
                    <img
                      src={blog.cover_image || '/building1.jpg'}
                      alt={blog.title}
                      loading='lazy'
                      decoding='async'
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/building1.jpg';
                      }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent' />
                    <span className='absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/70 backdrop-blur-md text-primary border border-primary/30 flex items-center gap-1.5'>
                      <Tag className='w-3 h-3' />
                      {blog.category}
                    </span>
                  </div>

                  <div className='p-6 space-y-3'>
                    <div className='flex items-center gap-4 text-xs text-gray-400'>
                      <span className='flex items-center gap-1.5'>
                        <Calendar className='w-3.5 h-3.5 text-primary' />
                        {new Date(blog.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className='flex items-center gap-1.5'>
                        <User className='w-3.5 h-3.5 text-primary' />
                        {blog.author || 'Admin'}
                      </span>
                    </div>

                    <h3 className='text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2'>
                      {blog.title}
                    </h3>

                    <p className='text-gray-400 text-sm line-clamp-3 leading-relaxed'>
                      {blog.excerpt || blog.content.slice(0, 140) + '...'}
                    </p>
                  </div>
                </div>

                <div className='p-6 pt-0'>
                  <button
                    onClick={() => setActiveBlog(blog)}
                    className='w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-primary text-gray-200 hover:text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 group/btn'
                  >
                    Read Full Article
                    <ArrowRight className='w-4 h-4 transition-transform group-hover/btn:translate-x-1' />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Full Article Reader Modal */}
      <AnimatePresence>
        {activeBlog && (
          <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-neutral-900 border border-neutral-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative'
            >
              <button
                onClick={() => setActiveBlog(null)}
                className='absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white rounded-full transition-colors'
              >
                <X className='w-6 h-6' />
              </button>

              <div className='relative h-64 sm:h-80 w-full overflow-hidden'>
                <img
                  src={activeBlog.cover_image || '/building1.jpg'}
                  alt={activeBlog.title}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/building1.jpg';
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent' />
                <div className='absolute bottom-6 left-6 right-6'>
                  <span className='px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white mb-3 inline-block'>
                    {activeBlog.category}
                  </span>
                  <h2 className='text-2xl sm:text-3xl font-bold text-white leading-tight'>
                    {activeBlog.title}
                  </h2>
                </div>
              </div>

              <div className='p-6 sm:p-8 space-y-6'>
                <div className='flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800 text-xs sm:text-sm text-gray-400'>
                  <div className='flex items-center gap-4'>
                    <span className='flex items-center gap-1.5'>
                      <Calendar className='w-4 h-4 text-primary' />
                      {new Date(activeBlog.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <User className='w-4 h-4 text-primary' />
                      {activeBlog.author}
                    </span>
                  </div>
                </div>

                <div className='prose prose-invert max-w-none text-gray-300 text-base leading-relaxed space-y-4 whitespace-pre-line'>
                  {activeBlog.content}
                </div>

                <div className='pt-6 border-t border-neutral-800 flex items-center justify-between'>
                  <span className='text-xs text-gray-500'>
                    Published by Paras Business Park Solapur
                  </span>
                  <button
                    onClick={() => setActiveBlog(null)}
                    className='px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold transition-all'
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
