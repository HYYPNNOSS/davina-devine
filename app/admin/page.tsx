"use client";

import { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon, Loader2, Edit2, X } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'blog' | 'reservations'>('services');
  
  // Services State
  const [services, setServices] = useState<any[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceWaxArea, setServiceWaxArea] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);

  // Blog State
  const [posts, setPosts] = useState<any[]>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');

  useEffect(() => {
    fetchServices();
    fetchPosts();
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const res = await fetch('/api/reservations');
    if (res.ok) setReservations(await res.json());
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    if (res.ok) setServices(await res.json());
  };

  const fetchPosts = async () => {
    const res = await fetch('/api/blog');
    if (res.ok) setPosts(await res.json());
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'service' | 'blog') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (data.url) {
          if (type === 'service') setServiceImage(data.url);
          else setBlogImage(data.url);
        }
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const url = '/api/services';
    const method = editingServiceId ? 'PUT' : 'POST';
    const body = {
      ...(editingServiceId && { id: editingServiceId }),
      name: serviceName,
      duration: serviceDuration,
      price: servicePrice,
      category: serviceCategory,
      description: serviceDescription,
      waxArea: serviceWaxArea,
      imageUrl: serviceImage,
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    cancelEdit();
    setIsLoading(false);
    fetchServices();
  };

  const handleEditClick = (service: any) => {
    setEditingServiceId(service.id);
    setServiceName(service.name || '');
    setServiceDuration(service.duration || '');
    setServicePrice(service.price || '');
    setServiceCategory(service.category || '');
    setServiceDescription(service.description || '');
    setServiceWaxArea(service.waxArea || '');
    setServiceImage(service.imageUrl || '');
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceDuration('');
    setServicePrice('');
    setServiceCategory('');
    setServiceDescription('');
    setServiceWaxArea('');
    setServiceImage('');
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    fetchServices();
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: blogTitle,
        content: blogContent,
        imageUrl: blogImage,
      }),
    });
    setBlogTitle('');
    setBlogContent('');
    setBlogImage('');
    setIsLoading(false);
    fetchPosts();
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
    fetchPosts();
  };
  const groupedReservations = reservations.reduce((acc, res) => {
    const date = res.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(res);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedReservations).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[120px] pb-[100px] px-[29px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-[50px] border-b border-[var(--color-stone)] pb-[33px]">
          <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[42px] md:text-[54px] italic leading-none text-[var(--color-warm-black)]">
            Admin Portal
          </h1>
          <p className="mt-[13px] text-[15px] opacity-60">Manage your clinic's services and journal entries.</p>
          
          <div className="flex gap-[17px] mt-[33px]">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-[25px] py-[10px] rounded-[5px] text-[13px] font-medium transition-colors ${
                activeTab === 'services' 
                  ? 'bg-[var(--color-warm-black)] text-[var(--color-creamy-white)]' 
                  : 'bg-[var(--color-stone)]/30 text-[var(--color-warm-black)] hover:bg-[var(--color-stone)]/50'
              }`}
            >
              SERVICES
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-[25px] py-[10px] rounded-[5px] text-[13px] font-medium transition-colors ${
                activeTab === 'blog' 
                  ? 'bg-[var(--color-warm-black)] text-[var(--color-creamy-white)]' 
                  : 'bg-[var(--color-stone)]/30 text-[var(--color-warm-black)] hover:bg-[var(--color-stone)]/50'
              }`}
            >
              JOURNAL
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-[25px] py-[10px] rounded-[5px] text-[13px] font-medium transition-colors ${
                activeTab === 'reservations' 
                  ? 'bg-[var(--color-warm-black)] text-[var(--color-creamy-white)]' 
                  : 'bg-[var(--color-stone)]/30 text-[var(--color-warm-black)] hover:bg-[var(--color-stone)]/50'
              }`}
            >
              RESERVATIONS
            </button>
          </div>
        </div>

        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-[50px]">
            {/* Add Service Form */}
            <div className="bg-white rounded-[10px] p-[29px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-stone)]/50 h-fit">
              <h2 className="text-[18px] font-medium mb-[25px]">{editingServiceId ? 'Edit Service' : 'Add New Service'}</h2>
              <form onSubmit={handleAddService} className="space-y-[17px]">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Service Name</label>
                  <input required value={serviceName} onChange={e => setServiceName(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="e.g. Signature Facial" />
                </div>
                <div className="grid grid-cols-2 gap-[13px]">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Duration</label>
                    <input required value={serviceDuration} onChange={e => setServiceDuration(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="60 min" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Price</label>
                    <input required value={servicePrice} onChange={e => setServicePrice(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="£75+" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Category</label>
                  <input value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="Facials, Waxing, etc." />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Description</label>
                  <textarea value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} rows={3} className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)] resize-none" placeholder="Brief description of the service..." />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Wax Area (If applicable)</label>
                  <input value={serviceWaxArea} onChange={e => setServiceWaxArea(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="e.g. Legs, Face, Arms" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Image (Optional)</label>
                  <label className="w-full flex items-center justify-center gap-[8px] border-2 border-dashed border-[var(--color-stone)] bg-[var(--color-creamy-white)] rounded-[5px] py-[25px] cursor-pointer hover:border-[var(--color-warm-black)] transition-colors">
                    {isUploading ? <Loader2 size={20} className="animate-spin text-[var(--color-warm-black)]/50" /> : <ImageIcon size={20} className="text-[var(--color-warm-black)]/50" />}
                    <span className="text-[13px] text-[var(--color-warm-black)]/60 font-medium">
                      {isUploading ? 'Uploading...' : serviceImage ? 'Image Selected' : 'Upload Cover'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'service')} disabled={isUploading} />
                  </label>
                  {serviceImage && <div className="mt-[13px] relative aspect-video rounded-[5px] overflow-hidden"><Image src={serviceImage} alt="Preview" fill className="object-cover" /></div>}
                </div>
                <div className="flex gap-[13px] mt-[25px]">
                  <button disabled={isLoading || isUploading} type="submit" className="flex-1 bg-[var(--color-olive-green)] text-[var(--color-warm-black)] font-medium text-[14px] py-[13px] rounded-[5px] hover:brightness-105 transition-all flex justify-center items-center gap-[8px]">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : editingServiceId ? <Edit2 size={16} /> : <Plus size={16} />}
                    {editingServiceId ? 'Update Service' : 'Add Service'}
                  </button>
                  {editingServiceId && (
                    <button type="button" onClick={cancelEdit} className="px-[20px] bg-[var(--color-stone)]/30 text-[var(--color-warm-black)] font-medium text-[14px] py-[13px] rounded-[5px] hover:bg-[var(--color-stone)]/50 transition-all flex justify-center items-center gap-[8px]">
                      <X size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Services List */}
            <div className="space-y-[13px]">
              {services.map((service, idx) => (
                <div key={service.id || idx} className="bg-white rounded-[10px] p-[17px] flex items-center gap-[17px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[var(--color-stone)]/30">
                  {service.imageUrl ? (
                    <div className="w-[60px] h-[60px] rounded-[5px] relative overflow-hidden shrink-0">
                      <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-[60px] h-[60px] rounded-[5px] bg-[var(--color-creamy-white)] border border-[var(--color-stone)] shrink-0 flex items-center justify-center">
                      <ImageIcon size={20} className="opacity-20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[15px] truncate">{service.name}</h3>
                    <p className="text-[13px] opacity-60 mt-[2px]">{service.duration} &middot; {service.price}</p>
                  </div>
                  {service.id && (
                    <div className="flex gap-[8px] shrink-0">
                      <button onClick={() => handleEditClick(service)} className="w-[36px] h-[36px] rounded-[5px] bg-[var(--color-creamy-white)] flex items-center justify-center text-[var(--color-warm-black)] hover:bg-[var(--color-stone)]/50 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteService(service.id)} className="w-[36px] h-[36px] rounded-[5px] bg-[var(--color-creamy-white)] flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {services.length === 0 && <p className="text-[14px] opacity-50 py-[50px] text-center">No services found. Add one to get started.</p>}
            </div>
          </motion.div>
        )}

        {activeTab === 'blog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-[50px]">
            {/* Add Post Form */}
            <div className="bg-white rounded-[10px] p-[29px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-stone)]/50 h-fit">
              <h2 className="text-[18px] font-medium mb-[25px]">Publish Entry</h2>
              <form onSubmit={handleAddPost} className="space-y-[17px]">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Title</label>
                  <input required value={blogTitle} onChange={e => setBlogTitle(e.target.value)} type="text" className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)]" placeholder="The Future of Skincare" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Content</label>
                  <textarea required value={blogContent} onChange={e => setBlogContent(e.target.value)} rows={5} className="w-full bg-[var(--color-creamy-white)] border border-[var(--color-stone)] rounded-[5px] px-[13px] py-[10px] text-[14px] outline-none focus:border-[var(--color-warm-black)] resize-none" placeholder="Write your thoughts..." />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[8px] block font-medium">Cover Image</label>
                  <label className="w-full flex items-center justify-center gap-[8px] border-2 border-dashed border-[var(--color-stone)] bg-[var(--color-creamy-white)] rounded-[5px] py-[25px] cursor-pointer hover:border-[var(--color-warm-black)] transition-colors">
                    {isUploading ? <Loader2 size={20} className="animate-spin text-[var(--color-warm-black)]/50" /> : <ImageIcon size={20} className="text-[var(--color-warm-black)]/50" />}
                    <span className="text-[13px] text-[var(--color-warm-black)]/60 font-medium">
                      {isUploading ? 'Uploading...' : blogImage ? 'Image Selected' : 'Upload Cover'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'blog')} disabled={isUploading} />
                  </label>
                  {blogImage && <div className="mt-[13px] relative aspect-video rounded-[5px] overflow-hidden"><Image src={blogImage} alt="Preview" fill className="object-cover" /></div>}
                </div>
                <button disabled={isLoading || isUploading} type="submit" className="w-full bg-[var(--color-warm-black)] text-[var(--color-creamy-white)] font-medium text-[14px] py-[13px] rounded-[5px] hover:opacity-90 transition-all flex justify-center items-center gap-[8px] mt-[25px]">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Publish Entry
                </button>
              </form>
            </div>

            {/* Posts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[17px] content-start">
              {posts.map((post, idx) => (
                <div key={post.id || idx} className="bg-white rounded-[10px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[var(--color-stone)]/30 group">
                  {post.imageUrl && (
                    <div className="w-full aspect-video relative">
                      <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <button onClick={() => handleDeletePost(post.id)} className="w-[40px] h-[40px] rounded-full bg-white text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center scale-75 group-hover:scale-100 shadow-xl">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="p-[17px]">
                    <p className="text-[11px] uppercase tracking-wider opacity-50 mb-[4px]">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</p>
                    <h3 className="font-medium text-[16px] leading-[1.3] mb-[8px] line-clamp-2">{post.title}</h3>
                    <p className="text-[13px] opacity-60 line-clamp-3 leading-[1.5]">{post.content}</p>
                    {!post.imageUrl && (
                       <button onClick={() => handleDeletePost(post.id)} className="mt-[13px] text-[12px] text-red-500 font-medium">Delete Post</button>
                    )}
                  </div>
                </div>
              ))}
              {posts.length === 0 && <p className="text-[14px] opacity-50 py-[50px] col-span-full text-center">No journal entries found.</p>}
            </div>
          </motion.div>
        )}

        {activeTab === 'reservations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[10px] p-[29px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[var(--color-stone)]/50">
            <h2 className="text-[18px] font-medium mb-[25px]">Recent Bookings</h2>
            <div className="space-y-[33px]">
              {sortedDates.map((date) => (
                <div key={date} className="relative">
                  <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-[8px] mb-[13px] border-b border-[var(--color-stone)]">
                    <h3 className="text-[14px] font-medium text-[var(--color-olive-green)] uppercase tracking-wider">
                      {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                  </div>
                  <div className="space-y-[13px]">
                    {groupedReservations[date].map((res: any, idx: number) => (
                      <div key={res.id || idx} className="bg-[var(--color-creamy-white)] rounded-[10px] p-[17px] flex flex-col md:flex-row md:items-center justify-between gap-[17px] border border-[var(--color-stone)]/30 ml-[13px] border-l-4 border-l-[var(--color-olive-green)]/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[8px] mb-[4px]">
                            <h3 className="font-medium text-[16px] truncate">{res.name}</h3>
                            <span className={`text-[10px] uppercase tracking-widest px-[8px] py-[2px] rounded-full font-medium ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {res.status || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-[14px] text-[var(--color-warm-black)]/70 mb-[8px]">{res.service} &middot; {res.guests} Guest(s)</p>
                          <div className="flex flex-col md:flex-row md:items-center gap-[4px] md:gap-[17px] text-[13px] opacity-60">
                            <span>{res.email}</span>
                            <span className="hidden md:inline">&middot;</span>
                            <span>{res.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {reservations.length === 0 && <p className="text-[14px] opacity-50 py-[50px] text-center">No reservations found.</p>}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
