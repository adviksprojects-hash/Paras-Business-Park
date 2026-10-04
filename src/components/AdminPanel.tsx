import { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  Phone,
  MapPin,
  Trash2,
  CheckCircle,
  RefreshCw,
  LogOut,
  Search,
  MessageSquare,
  Shield,
  Eye,
  X,
  Plus,
  Edit,
  BookOpen,
  Store,
  Check,
  Tag,
  Calendar,
  User,
  Globe,
  Upload,
  Image as ImageIcon,
  IndianRupee,
  Clock,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  place: string;
  message: string;
  status: 'unread' | 'read' | 'contacted';
  created_at: string;
}

interface UserBookingRequest {
  id: number;
  name: string;
  phone: string;
  email?: string;
  unit_type: string;
  preferred_floor?: string;
  budget_range?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface BookingUnit {
  id: number;
  title: string;
  unit_type: string;
  tag: string;
  price?: string;
  image: string;
  features: string[];
  description: string;
  whatsapp_number: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminBlogPost {
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
  updated_at: string;
}

type AdminTab = 'user_bookings' | 'booking_units' | 'blogs' | 'contacts';

export function AdminPanel() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('user_bookings');

  // User Booking Requests (from "Request to Booking" form)
  const [bookingRequests, setBookingRequests] = useState<UserBookingRequest[]>([]);
  const [selectedBookingRequest, setSelectedBookingRequest] = useState<UserBookingRequest | null>(null);

  // Booking Units State (Editable Booking Sites)
  const [bookingUnits, setBookingUnits] = useState<BookingUnit[]>([]);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<BookingUnit | null>(null);
  const [unitForm, setUnitForm] = useState({
    title: '',
    unit_type: 'Shops / Showroom',
    tag: 'Available',
    price: '₹ 20 Lakhs',
    image: '/gallary/store.jpg',
    featuresText: 'Ground & 1st Floor prime road visibility\nDouble-height glass front facades\nAmple basement & surface customer parking',
    description: '',
    whatsapp_number: '+918888466667',
    display_order: 0,
    active: true,
  });

  // Blogs State
  const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<AdminBlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Commercial Real Estate',
    cover_image: '/building1.jpg',
    excerpt: '',
    content: '',
    author: 'Paras Business Park',
    published: true,
  });

  // Contacts State
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactInquiry | null>(null);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // File Upload Refs
  const unitImageInputRef = useRef<HTMLInputElement>(null);
  const blogImageInputRef = useRef<HTMLInputElement>(null);

  // Fetch all data on token mount
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const parseJsonSafe = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch {
        return {};
      }
    }
    return {};
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      if (!data.token) {
        throw new Error('Authentication token missing.');
      }

      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUsername('');
    setPassword('');
    setBookingRequests([]);
    setBookingUnits([]);
    setBlogs([]);
    setContacts([]);
  };

  const fetchAllData = async () => {
    if (!token) return;
    setIsLoading(true);
    setFetchError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, unitsRes, blogsRes, contactsRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/booking-units', { headers }),
        fetch('/api/admin/blogs', { headers }),
        fetch('/api/admin/contacts', { headers }),
      ]);

      if (
        bookingsRes.status === 401 ||
        bookingsRes.status === 403 ||
        unitsRes.status === 401 ||
        unitsRes.status === 403 ||
        blogsRes.status === 401 ||
        blogsRes.status === 403 ||
        contactsRes.status === 401 ||
        contactsRes.status === 403
      ) {
        handleLogout();
        return;
      }

      const bookingsData = await parseJsonSafe(bookingsRes);
      const unitsData = await parseJsonSafe(unitsRes);
      const blogsData = await parseJsonSafe(blogsRes);
      const contactsData = await parseJsonSafe(contactsRes);

      setBookingRequests(bookingsData.bookings || []);
      setBookingUnits(unitsData.units || []);
      setBlogs(blogsData.blogs || []);
      setContacts(contactsData.contacts || []);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch admin dashboard records');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Read File from Device as Base64 Data URL
  const handleDeviceFileUpload = (
    file: File,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // USER BOOKING REQUESTS HANDLERS
  // ----------------------------------------------------
  const handleUpdateBookingRequestStatus = async (
    id: number,
    newStatus: 'pending' | 'contacted' | 'confirmed' | 'cancelled'
  ) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update booking status');

      setBookingRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedBookingRequest?.id === id) {
        setSelectedBookingRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBookingRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking request?')) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete booking request');
      setBookingRequests((prev) => prev.filter((b) => b.id !== id));
      if (selectedBookingRequest?.id === id) setSelectedBookingRequest(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // BOOKING UNITS (SITES) CRUD HANDLERS
  // ----------------------------------------------------
  const openNewUnitModal = () => {
    setEditingUnit(null);
    setUnitForm({
      title: '',
      unit_type: 'Shops / Showroom',
      tag: 'Available',
      price: '₹ 20 Lakhs',
      image: '/gallary/store.jpg',
      featuresText: 'Prime road-facing visibility\nModern facade design\nDedicated visitor parking\n24/7 Security & Power Backup',
      description: '',
      whatsapp_number: '+918888466667',
      display_order: bookingUnits.length + 1,
      active: true,
    });
    setIsUnitModalOpen(true);
  };

  const openEditUnitModal = (unit: BookingUnit) => {
    setEditingUnit(unit);
    const featuresStr = Array.isArray(unit.features) ? unit.features.join('\n') : '';
    setUnitForm({
      title: unit.title,
      unit_type: unit.unit_type,
      tag: unit.tag || 'Available',
      price: unit.price || '',
      image: unit.image || '/gallary/store.jpg',
      featuresText: featuresStr,
      description: unit.description || '',
      whatsapp_number: unit.whatsapp_number || '+918888466667',
      display_order: unit.display_order || 0,
      active: unit.active !== undefined ? unit.active : true,
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.title.trim() || !unitForm.unit_type.trim()) {
      alert('Please provide a space title and unit type.');
      return;
    }

    const payload = {
      title: unitForm.title,
      unit_type: unitForm.unit_type,
      tag: unitForm.tag,
      price: unitForm.price,
      image: unitForm.image,
      features: unitForm.featuresText.split('\n').map((f) => f.trim()).filter(Boolean),
      description: unitForm.description,
      whatsapp_number: unitForm.whatsapp_number,
      display_order: parseInt(String(unitForm.display_order) || '0', 10),
      active: unitForm.active,
    };

    try {
      const url = editingUnit
        ? `/api/admin/booking-units/${editingUnit.id}`
        : '/api/admin/booking-units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save booking space');

      if (editingUnit) {
        setBookingUnits((prev) => prev.map((u) => (u.id === editingUnit.id ? data.unit : u)));
      } else {
        setBookingUnits((prev) => [...prev, data.unit]);
      }

      setIsUnitModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking space/site?')) return;
    try {
      const res = await fetch(`/api/admin/booking-units/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete booking space');
      setBookingUnits((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // BLOGS CRUD HANDLERS
  // ----------------------------------------------------
  const openNewBlogModal = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      category: 'Commercial Real Estate',
      cover_image: '/building1.jpg',
      excerpt: '',
      content: '',
      author: 'Paras Business Park',
      published: true,
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (blog: AdminBlogPost) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      category: blog.category,
      cover_image: blog.cover_image,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      published: blog.published,
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      alert('Please provide a title and content for the blog post.');
      return;
    }

    try {
      const url = editingBlog
        ? `/api/admin/blogs/${editingBlog.id}`
        : '/api/admin/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogForm),
      });

      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save blog');

      if (editingBlog) {
        setBlogs((prev) => prev.map((b) => (b.id === editingBlog.id ? data.blog : b)));
      } else {
        setBlogs((prev) => [data.blog, ...prev]);
      }

      setIsBlogModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog article?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete blog');
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // CONTACTS HANDLERS
  // ----------------------------------------------------
  const handleUpdateContactStatus = async (id: number, newStatus: 'unread' | 'read' | 'contacted') => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setContacts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedContact?.id === id) {
        setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered lists
  const filteredBookingRequests = bookingRequests.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.unit_type && item.unit_type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredUnits = bookingUnits.filter((u) =>
    u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.tag && u.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.place.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login Screen
  if (!token) {
    return (
      <div id='admin' className='min-h-screen bg-neutral-900 py-24 px-4 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl p-8'
        >
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary'>
              <Shield className='w-8 h-8' />
            </div>
            <h2 className='text-3xl font-bold text-white mb-2'>Admin Portal</h2>
            <p className='text-gray-400 text-sm'>
              Sign in to manage Booking Spaces, User Bookings, and Blogs in Neon DB
            </p>
          </div>

          {loginError && (
            <div className='mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center'>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Username / Email
              </label>
              <div className='relative'>
                <Mail className='w-5 h-5 text-gray-400 absolute left-3 top-3' />
                <input
                  type='email'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary'
                  placeholder='Enter admin email or username'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='w-5 h-5 text-gray-400 absolute left-3 top-3' />
                <input
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary'
                  placeholder='••••••••••••'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoggingIn}
              className='w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer'
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className='w-5 h-5 animate-spin' /> Authenticating...
                </>
              ) : (
                'Login to Admin Dashboard'
              )}
            </button>
          </form>

          <div className='mt-6 text-center border-t border-neutral-700/60 pt-4'>
            <a href='/' className='text-xs text-gray-400 hover:text-white transition-colors'>
              ← Back to Main Website
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <section id='admin' className='min-h-screen bg-neutral-900 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto space-y-8'>

        {/* Top Header */}
        <div className='bg-neutral-800/90 backdrop-blur-md border border-neutral-700 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl'>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <h1 className='text-2xl sm:text-3xl font-bold text-white'>Paras Admin Management</h1>
              <span className='px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                Neon DB Live
              </span>
            </div>
            <p className='text-gray-400 text-sm'>
              Logged in as <span className='text-primary font-medium'>parasbusinesspark@gmail.com</span>
            </p>
          </div>

          <div className='flex items-center flex-wrap gap-3'>
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className='flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer'
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <a
              href='/'
              className='flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all'
            >
              <Globe className='w-4 h-4' />
              View Site
            </a>

            <button
              onClick={handleLogout}
              className='flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer'
            >
              <LogOut className='w-4 h-4' />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='flex items-center gap-3 border-b border-neutral-800 pb-4 overflow-x-auto'>
          <button
            onClick={() => {
              setActiveTab('user_bookings');
              setStatusFilter('all');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'user_bookings'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
            }`}
          >
            <Clock className='w-4 h-4' />
            User Booking Requests ({bookingRequests.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('booking_units');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'booking_units'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
            }`}
          >
            <Store className='w-4 h-4' />
            Booking Spaces / Sites ({bookingUnits.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('blogs');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'blogs'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
            }`}
          >
            <BookOpen className='w-4 h-4' />
            Blogs & Articles ({blogs.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('contacts');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700'
            }`}
          >
            <MessageSquare className='w-4 h-4' />
            Contact Messages ({contacts.length})
          </button>
        </div>

        {/* TAB 1: USER BOOKING REQUESTS (FROM MODAL) */}
        {activeTab === 'user_bookings' && (
          <div className='space-y-6'>
            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4'>
              <div className='relative w-full md:w-80'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search booking requests by name, phone...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary'
                />
              </div>

              <div className='flex items-center gap-2 w-full md:w-auto overflow-x-auto'>
                {(['all', 'pending', 'contacted', 'confirmed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl'>
              {filteredBookingRequests.length === 0 ? (
                <div className='p-16 text-center text-gray-400'>
                  <Clock className='w-12 h-12 mx-auto mb-3 text-neutral-600' />
                  <h3 className='text-lg font-semibold text-gray-300'>No booking requests found</h3>
                  <p className='text-sm text-gray-500'>
                    Requests submitted by visitors via the "Request to Booking" button will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-sm text-gray-300'>
                    <thead className='bg-neutral-900/90 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-neutral-700'>
                      <tr>
                        <th className='py-4 px-6'>Date & Time</th>
                        <th className='py-4 px-6'>Client Name</th>
                        <th className='py-4 px-6'>Mobile Number</th>
                        <th className='py-4 px-6'>Requested Space</th>
                        <th className='py-4 px-6'>Status</th>
                        <th className='py-4 px-6 text-right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-700/60'>
                      {filteredBookingRequests.map((item) => (
                        <tr key={item.id} className='hover:bg-neutral-700/40 transition-colors'>
                          <td className='py-4 px-6 whitespace-nowrap text-gray-400 text-xs'>
                            {new Date(item.created_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className='py-4 px-6 font-semibold text-white whitespace-nowrap'>
                            {item.name}
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap'>
                            <a
                              href={`tel:${item.phone}`}
                              className='flex items-center gap-1.5 text-green-400 hover:text-green-300 font-bold text-sm'
                            >
                              <Phone className='w-3.5 h-3.5' />
                              {item.phone}
                            </a>
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap'>
                            <span className='px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold'>
                              {item.unit_type}
                            </span>
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap'>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                                item.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : item.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : item.status === 'contacted'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <button
                                onClick={() =>
                                  handleUpdateBookingRequestStatus(
                                    item.id,
                                    item.status === 'confirmed' ? 'pending' : 'confirmed'
                                  )
                                }
                                title='Mark as Confirmed'
                                className='p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors cursor-pointer'
                              >
                                <CheckCircle className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDeleteBookingRequest(item.id)}
                                title='Delete Entry'
                                className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors cursor-pointer'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKING UNITS (EDITABLE BOOKING SITES) */}
        {activeTab === 'booking_units' && (
          <div className='space-y-6'>
            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='relative w-full sm:w-80'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search booking spaces (Shops, 2BHK)...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary'
                />
              </div>

              <button
                onClick={openNewUnitModal}
                className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all w-full sm:w-auto justify-center cursor-pointer'
              >
                <Plus className='w-4 h-4' /> Add Another Booking Site / Space
              </button>
            </div>

            {/* Booking Units Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {filteredUnits.map((unit) => {
                const featuresList = Array.isArray(unit.features) ? unit.features : [];

                return (
                  <div
                    key={unit.id}
                    className='bg-neutral-800/90 border border-neutral-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between'
                  >
                    <div>
                      <div className='relative h-48 w-full overflow-hidden'>
                        <img
                          src={unit.image || '/gallary/store.jpg'}
                          alt={unit.title}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/gallary/store.jpg';
                          }}
                        />
                        <div className='absolute top-3 left-3 flex items-center gap-2'>
                          <span className='px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-primary border border-primary/30'>
                            {unit.unit_type}
                          </span>
                        </div>
                        <div className='absolute top-3 right-3'>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              unit.active
                                ? 'bg-green-500/80 text-white'
                                : 'bg-neutral-700 text-gray-400'
                            }`}
                          >
                            {unit.active ? 'Active on Site' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      <div className='p-6 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-xl font-bold text-white'>{unit.title}</h3>
                          <span className='px-2.5 py-0.5 bg-neutral-700 text-primary text-xs rounded-full font-semibold'>
                            {unit.tag}
                          </span>
                        </div>

                        {unit.price && (
                          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold'>
                            <IndianRupee className='w-3.5 h-3.5' />
                            <span>Price: {unit.price}</span>
                          </div>
                        )}

                        {unit.description && (
                          <p className='text-gray-400 text-xs line-clamp-2 leading-relaxed'>
                            {unit.description}
                          </p>
                        )}

                        {featuresList.length > 0 && (
                          <div className='space-y-1.5 pt-2 border-t border-neutral-700/60'>
                            {featuresList.slice(0, 3).map((f, i) => (
                              <div key={i} className='text-xs text-gray-300 flex items-center gap-1.5'>
                                <Check className='w-3 h-3 text-primary flex-shrink-0' />
                                <span className='truncate'>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='p-6 pt-0 border-t border-neutral-700/60 mt-4 flex items-center justify-between'>
                      <span className='text-xs text-gray-500'>ID: #{unit.id}</span>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => openEditUnitModal(unit)}
                          className='px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer'
                        >
                          <Edit className='w-3.5 h-3.5' /> Edit Space
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer'
                          title='Delete Space'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BLOGS MANAGEMENT */}
        {activeTab === 'blogs' && (
          <div className='space-y-6'>
            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='relative w-full sm:w-80'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search blogs by title, category...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary'
                />
              </div>

              <button
                onClick={openNewBlogModal}
                className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all w-full sm:w-auto justify-center cursor-pointer'
              >
                <Plus className='w-4 h-4' /> Create New Blog Article
              </button>
            </div>

            {/* Blogs Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className='bg-neutral-800/90 border border-neutral-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between'
                >
                  <div>
                    <div className='relative h-44 w-full overflow-hidden'>
                      <img
                        src={blog.cover_image || '/building1.jpg'}
                        alt={blog.title}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/building1.jpg';
                        }}
                      />
                      <div className='absolute top-3 left-3 flex items-center gap-2'>
                        <span className='px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-primary border border-primary/30'>
                          {blog.category}
                        </span>
                      </div>
                      <div className='absolute top-3 right-3'>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            blog.published
                              ? 'bg-green-500/80 text-white'
                              : 'bg-amber-500/80 text-white'
                          }`}
                        >
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className='p-6 space-y-2'>
                      <div className='text-xs text-gray-400 flex items-center gap-2'>
                        <Calendar className='w-3.5 h-3.5' />
                        {new Date(blog.created_at).toLocaleDateString()}
                        <span>•</span>
                        <User className='w-3.5 h-3.5' />
                        {blog.author}
                      </div>
                      <h3 className='text-lg font-bold text-white line-clamp-2'>{blog.title}</h3>
                      <p className='text-gray-400 text-xs line-clamp-3 leading-relaxed'>
                        {blog.excerpt || blog.content.slice(0, 120)}
                      </p>
                    </div>
                  </div>

                  <div className='p-6 pt-0 border-t border-neutral-700/60 mt-4 flex items-center justify-between'>
                    <span className='text-xs text-gray-500'>ID: #{blog.id}</span>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => openEditBlogModal(blog)}
                        className='px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer'
                      >
                        <Edit className='w-3.5 h-3.5' /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT INQUIRIES */}
        {activeTab === 'contacts' && (
          <div className='space-y-6'>
            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 flex items-center justify-between gap-4'>
              <div className='relative w-full sm:w-80'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search contacts by name, email, place...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary'
                />
              </div>
            </div>

            <div className='bg-neutral-800/80 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl'>
              {filteredContacts.length === 0 ? (
                <div className='p-16 text-center text-gray-400'>
                  <MessageSquare className='w-12 h-12 mx-auto mb-3 text-neutral-600' />
                  <h3 className='text-lg font-semibold text-gray-300'>No contact messages found</h3>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-sm text-gray-300'>
                    <thead className='bg-neutral-900/90 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-neutral-700'>
                      <tr>
                        <th className='py-4 px-6'>Date</th>
                        <th className='py-4 px-6'>Name</th>
                        <th className='py-4 px-6'>Contact Info</th>
                        <th className='py-4 px-6'>Place</th>
                        <th className='py-4 px-6'>Message</th>
                        <th className='py-4 px-6'>Status</th>
                        <th className='py-4 px-6 text-right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-700/60'>
                      {filteredContacts.map((item) => (
                        <tr key={item.id} className='hover:bg-neutral-700/40 transition-colors'>
                          <td className='py-4 px-6 whitespace-nowrap text-gray-400 text-xs'>
                            {new Date(item.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className='py-4 px-6 font-semibold text-white whitespace-nowrap'>
                            {item.name}
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap'>
                            <div className='flex flex-col gap-0.5 text-xs'>
                              <a href={`mailto:${item.email}`} className='text-blue-400 hover:underline'>
                                {item.email}
                              </a>
                              <a href={`tel:${item.phone}`} className='text-gray-300 hover:text-white'>
                                {item.phone}
                              </a>
                            </div>
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap text-gray-300 text-xs'>
                            {item.place}
                          </td>
                          <td className='py-4 px-6 max-w-xs truncate text-gray-400 text-xs'>
                            {item.message}
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap'>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                                item.status === 'unread'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : item.status === 'contacted'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-neutral-700 text-gray-300 border-neutral-600'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className='py-4 px-6 whitespace-nowrap text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <button
                                onClick={() => {
                                  setSelectedContact(item);
                                  if (item.status === 'unread') handleUpdateContactStatus(item.id, 'read');
                                }}
                                className='p-2 bg-neutral-700 hover:bg-neutral-600 text-gray-200 rounded-lg transition-colors cursor-pointer'
                              >
                                <Eye className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateContactStatus(
                                    item.id,
                                    item.status === 'contacted' ? 'read' : 'contacted'
                                  )
                                }
                                className='p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors cursor-pointer'
                              >
                                <CheckCircle className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(item.id)}
                                className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors cursor-pointer'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Unit Modal (Add / Edit Booking Site with Device Image Upload & Optional Price) */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-neutral-800 border border-neutral-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8'
            >
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg'
              >
                <X className='w-6 h-6' />
              </button>

              <div className='flex items-center gap-3 border-b border-neutral-700 pb-4'>
                <Store className='w-6 h-6 text-primary' />
                <h3 className='text-2xl font-bold text-white'>
                  {editingUnit ? 'Edit Booking Space / Site' : 'Add New Booking Space / Site'}
                </h3>
              </div>

              <form onSubmit={handleSaveUnit} className='space-y-5'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Space Title *
                    </label>
                    <input
                      type='text'
                      required
                      value={unitForm.title}
                      onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                      placeholder='e.g. Retail Shops, 4 BHK Penthouse'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Unit Type / Category *
                    </label>
                    <input
                      type='text'
                      required
                      value={unitForm.unit_type}
                      onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })}
                      placeholder='e.g. Shops / Showroom, 2 BHK Residence, Office'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Price (Optional, e.g. ₹ 20 Lakhs, ₹ 35 Lakhs Onwards)
                    </label>
                    <div className='relative'>
                      <IndianRupee className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                      <input
                        type='text'
                        value={unitForm.price}
                        onChange={(e) => setUnitForm({ ...unitForm, price: e.target.value })}
                        placeholder='e.g. ₹ 20 Lakhs Onwards'
                        className='w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Badge Tag
                    </label>
                    <input
                      type='text'
                      value={unitForm.tag}
                      onChange={(e) => setUnitForm({ ...unitForm, tag: e.target.value })}
                      placeholder='e.g. High Footfall, Premium Living, Luxury'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                  </div>
                </div>

                {/* Device Image Upload + URL Option */}
                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Cover Image (Upload from Device or enter URL)
                  </label>
                  <div className='flex flex-col sm:flex-row items-center gap-3'>
                    <input
                      type='text'
                      value={unitForm.image}
                      onChange={(e) => setUnitForm({ ...unitForm, image: e.target.value })}
                      placeholder='/gallary/store.jpg, /building1.jpg or data:image/...'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                    <input
                      type='file'
                      ref={unitImageInputRef}
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDeviceFileUpload(file, (dataUrl) => {
                            setUnitForm((prev) => ({ ...prev, image: dataUrl }));
                          });
                        }
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => unitImageInputRef.current?.click()}
                      className='flex-shrink-0 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer'
                    >
                      <Upload className='w-4 h-4' /> Upload from Device
                    </button>
                  </div>

                  {unitForm.image && (
                    <div className='mt-3 flex items-center gap-3 p-2 bg-neutral-900 rounded-xl border border-neutral-700/60'>
                      <img
                        src={unitForm.image}
                        alt='Preview'
                        className='w-16 h-12 object-cover rounded-lg'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/gallary/store.jpg';
                        }}
                      />
                      <span className='text-xs text-gray-400 truncate'>Selected Image Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    WhatsApp Direct Inquiry Number
                  </label>
                  <input
                    type='text'
                    value={unitForm.whatsapp_number}
                    onChange={(e) => setUnitForm({ ...unitForm, whatsapp_number: e.target.value })}
                    placeholder='+918888466667'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Key Highlights / Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={unitForm.featuresText}
                    onChange={(e) => setUnitForm({ ...unitForm, featuresText: e.target.value })}
                    placeholder='Ground & 1st Floor prime road visibility&#10;Double-height glass front facades&#10;Ample customer parking'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Description / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={unitForm.description}
                    onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                    placeholder='Short overview of this commercial or residential space...'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary'
                  />
                </div>

                <div className='flex items-center justify-between pt-4 border-t border-neutral-700'>
                  <label className='flex items-center gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={unitForm.active}
                      onChange={(e) => setUnitForm({ ...unitForm, active: e.target.checked })}
                      className='w-5 h-5 rounded text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-300 font-medium'>
                      Display immediately on website
                    </span>
                  </label>

                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => setIsUnitModalOpen(false)}
                      className='px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-sm font-semibold cursor-pointer'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 cursor-pointer'
                    >
                      {editingUnit ? 'Update Space' : 'Save & Publish Space'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Modal (Create / Edit Article with Device Image Upload) */}
      <AnimatePresence>
        {isBlogModalOpen && (
          <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-neutral-800 border border-neutral-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8'
            >
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg'
              >
                <X className='w-6 h-6' />
              </button>

              <div className='flex items-center gap-3 border-b border-neutral-700 pb-4'>
                <BookOpen className='w-6 h-6 text-primary' />
                <h3 className='text-2xl font-bold text-white'>
                  {editingBlog ? 'Edit Blog Article' : 'Create New Blog Article'}
                </h3>
              </div>

              <form onSubmit={handleSaveBlog} className='space-y-5'>
                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Article Title *
                  </label>
                  <input
                    type='text'
                    required
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    placeholder='e.g. Paras Business Park Completes Facade Construction'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Category
                    </label>
                    <select
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    >
                      <option value='Commercial Real Estate'>Commercial Real Estate</option>
                      <option value='Luxury Residences'>Luxury Residences</option>
                      <option value='Investment Insights'>Investment Insights</option>
                      <option value='Construction Updates'>Construction Updates</option>
                      <option value='Retail & Entertainment'>Retail & Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                      Author
                    </label>
                    <input
                      type='text'
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                      placeholder='Paras Business Park Team'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                  </div>
                </div>

                {/* Device Image Upload + URL Option for Blogs */}
                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Cover Image (Upload from Device or enter URL)
                  </label>
                  <div className='flex flex-col sm:flex-row items-center gap-3'>
                    <input
                      type='text'
                      value={blogForm.cover_image}
                      onChange={(e) => setBlogForm({ ...blogForm, cover_image: e.target.value })}
                      placeholder='/building1.jpg or data:image/...'
                      className='w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary'
                    />
                    <input
                      type='file'
                      ref={blogImageInputRef}
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDeviceFileUpload(file, (dataUrl) => {
                            setBlogForm((prev) => ({ ...prev, cover_image: dataUrl }));
                          });
                        }
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => blogImageInputRef.current?.click()}
                      className='flex-shrink-0 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer'
                    >
                      <Upload className='w-4 h-4' /> Upload from Device
                    </button>
                  </div>

                  {blogForm.cover_image && (
                    <div className='mt-3 flex items-center gap-3 p-2 bg-neutral-900 rounded-xl border border-neutral-700/60'>
                      <img
                        src={blogForm.cover_image}
                        alt='Preview'
                        className='w-16 h-12 object-cover rounded-lg'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/building1.jpg';
                        }}
                      />
                      <span className='text-xs text-gray-400 truncate'>Selected Image Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Short Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                    placeholder='Brief summary shown on blog preview cards...'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase text-gray-300 mb-2'>
                    Full Blog Content *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    placeholder='Write your full article paragraphs here...'
                    className='w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary font-sans leading-relaxed'
                  />
                </div>

                <div className='flex items-center justify-between pt-4 border-t border-neutral-700'>
                  <label className='flex items-center gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={blogForm.published}
                      onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                      className='w-5 h-5 rounded text-primary focus:ring-primary'
                    />
                    <span className='text-sm text-gray-300 font-medium'>
                      Publish immediately on website
                    </span>
                  </label>

                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => setIsBlogModalOpen(false)}
                      className='px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-sm font-semibold cursor-pointer'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 cursor-pointer'
                    >
                      {editingBlog ? 'Update Article' : 'Publish Article'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
