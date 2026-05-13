import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, User as UserIcon, Clock } from 'lucide-react';
import { blogs as blogsApi } from '../api/endpoints';
import './BlogPage.css';

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    blogsApi.list({ published: 'true' })
      .then((list) => { if (!cancelled) setPosts(list); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container blog-page">
      <header className="blog-header">
        <h1>BloomNest Journal</h1>
        <p>Floral inspiration, gift ideas, event planning tips and stories from our florists.</p>
      </header>

      {loading ? (
        <div className="blog-loading"><Loader2 className="spin" size={20} /> Loading posts…</div>
      ) : error ? (
        <p style={{ color: '#b91c1c' }}>{error}</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#888' }}>No posts published yet.</p>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="blog-card">
              {post.coverImage && <img src={post.coverImage} alt={post.title} className="blog-card-img" />}
              <div className="blog-card-body">
                <span className="blog-card-cat">{post.category}</span>
                <h2>{post.title}</h2>
                {post.excerpt && <p>{post.excerpt}</p>}
                <div className="blog-card-meta">
                  <span><UserIcon size={11} /> {post.author}</span>
                  <span><Calendar size={11} /> {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span><Clock size={11} /> {post.readingTimeMin} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
