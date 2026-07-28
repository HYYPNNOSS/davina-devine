"use client";

import { useEffect, useState, use } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.slug === unwrappedParams.slug);
        setPost(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unwrappedParams.slug]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[150px] flex justify-center">
         <div className="w-[30px] h-[30px] border-2 border-[var(--color-olive-green)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[150px] text-center px-[29px]">
        <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[40px] italic mb-[17px]">Entry not found</h1>
        <Link href="/blog" className="text-[13px] font-medium border-b border-[var(--color-warm-black)] pb-[2px]">RETURN TO JOURNAL</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[120px] pb-[100px]">
      <article className="max-w-[800px] mx-auto px-[29px]">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-[50px]">
          <Link href="/blog" className="inline-flex items-center gap-[8px] text-[11px] uppercase tracking-widest font-medium opacity-50 hover:opacity-100 transition-opacity mb-[33px]">
            <ArrowLeft size={14} /> Back to Journal
          </Link>
          <p className="text-[13px] uppercase tracking-widest opacity-60 mb-[17px] font-medium">
            {new Date(post.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[42px] md:text-[60px] italic leading-[1.1] text-[var(--color-warm-black)] mb-[33px]">
            {post.title}
          </h1>
          
          {post.imageUrl && (
            <div className="w-full aspect-video md:aspect-[21/9] relative rounded-[5px] overflow-hidden mb-[50px]">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none prose-p:text-[16px] prose-p:leading-[1.8] prose-p:text-[var(--color-warm-black)]/80 prose-headings:font-[family-name:var(--font-cardinal-fruit)] prose-headings:italic prose-headings:font-normal whitespace-pre-wrap">
            {post.content}
          </div>
        </motion.div>
      </article>
    </main>
  );
}
