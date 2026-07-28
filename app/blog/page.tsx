"use client";

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[150px] pb-[100px] px-[29px]">
      <div className="max-w-[1440px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-[80px]">
          <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[60px] md:text-[80px] italic leading-none text-[var(--color-warm-black)] mb-[17px]">
            The Journal
          </h1>
          <p className="text-[15px] opacity-60 uppercase tracking-widest max-w-[500px] mx-auto">
            Insights, clinic news, and the art of aesthetics.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-[100px]">
            <div className="w-[30px] h-[30px] border-2 border-[var(--color-olive-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center opacity-50 py-[100px]">No journal entries available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[33px]">
            {posts.map((post, idx) => (
              <motion.article 
                key={post.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.8, ease: "easeOut" } }
                }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] rounded-[5px] overflow-hidden bg-[var(--color-stone)]/30 mb-[25px]">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-warm-black)]/20">
                      <Image 
                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" 
                        alt="Fallback" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-multiply" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <p className="text-[11px] uppercase tracking-widest opacity-50 mb-[13px] font-medium">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h2 className="text-[24px] font-medium leading-[1.2] mb-[13px] group-hover:text-[var(--color-olive-green)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[15px] opacity-70 leading-[1.6] line-clamp-3 mb-[25px]">
                    {post.content}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-[8px] text-[13px] font-medium border-b border-[var(--color-warm-black)] pb-[2px] w-fit hover:opacity-70 transition-opacity">
                    READ ARTICLE <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
