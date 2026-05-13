import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Calendar, User as UserIcon, Clock, ArrowLeft } from 'lucide-react';
import { blogs as blogsApi } from '../api/endpoints';
import './BlogPage.css';

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    blogsApi.get(id)
      .then((p) => { if (!cancelled) setPost(p); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="container blog-loading"><Loader2 className="spin" size={20} /> Loading…</div>;
  if (error || !post) return (
    <div className="container blog-empty">
      <p>{error || 'Post not found.'}</p>
      <Link to="/blog" className="btn btn-primary">Back to Journal</Link>
    </div>
  );

  // very simple paragraph rendering with line breaks; supports HTML if present
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(post.body);

  return (
    <div className="container blog-detail">
      <Link to="/blog" className="back-btn"><ArrowLeft size={15} /> Back to Journal</Link>
      {post.coverImage && <img src={post.coverImage} alt={post.title} className="blog-detail-cover" />}
      <span className="blog-card-cat">{post.category}</span>
      <h1>{post.title}</h1>
      <div className="blog-detail-meta">
        <span><UserIcon size={12} /> {post.author}</span>
        <span><Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span><Clock size={12} /> {post.readingTimeMin} min read</span>
      </div>
      {post.excerpt && <p className="blog-detail-excerpt">{post.excerpt}</p>}
      {looksLikeHtml ? (
        <div className="blog-detail-body" dangerouslySetInnerHTML={{ __html: post.body }} />
      ) : (
        <div className="blog-detail-body">
          {post.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
      {post.tags?.length > 0 && (
        <div className="blog-detail-tags">
          {post.tags.map((t) => <span key={t} className="badge badge-orange">{t}</span>)}
        </div>
      )}
    </div>
  );
}
