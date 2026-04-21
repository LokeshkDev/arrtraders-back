import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import './Blog.css';

const blogData = [
  {
    title: 'How to Choose the Best Organic Dates',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    date: 'April 10, 2026',
    author: 'Admin'
  },
  {
    title: 'Top 5 Healthy Nuts for Daily Nutrition',
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=600',
    date: 'April 08, 2026',
    author: 'Admin'
  },
  {
    title: 'The Benefits of Raw Artisan Honey',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    date: 'April 05, 2026',
    author: 'Admin'
  }
];

const Blog = () => {
  return (
    <section className="blog-section section-padding">
      <div className="container-custom">
        <div className="section-title">
          <span>Our News</span>
          <h2>Latest Blog Posts</h2>
        </div>

        <div className="grid-responsive-3">
          {blogData.map((item, idx) => (
            <div key={idx} className="blog-card-organio animated fadeInUp">
              <div className="blog-img-wrap">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="blog-info-organio">
                <div className="blog-meta">
                  <span><Calendar size={14} /> {item.date}</span>
                  <span><User size={14} /> {item.author}</span>
                </div>
                <h3>{item.title}</h3>
                <a href="#" className="read-more-btn">
                  Read More <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
