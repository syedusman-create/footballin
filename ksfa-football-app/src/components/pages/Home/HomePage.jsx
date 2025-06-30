// src/components/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import FootballLoader from "../../common/FootballLoader.jsx";
import { useAdminCheck } from '../../../hooks/useAdminCheck';
import { useFirebaseAuth } from '../../../hooks/useFirebaseData';

const STATES = ['Karnataka', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'Kerala'];
const DIVISIONS = ['A_Division', 'B_Division', 'C_Division','U15', 'U21', 'U17'];

const HomePage = () => {
  // DigitalSerenity state
  const [mouseGradientStyle, setMouseGradientStyle] = useState({
    left: '0px',
    top: '0px',
    opacity: 0,
  });
  const [ripples, setRipples] = useState([]);

  // News/filter state
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [filterState, setFilterState] = useState("All");
  const [filterDivision, setFilterDivision] = useState("All");

  // Add News state
  const [showAddNews, setShowAddNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsState, setNewsState] = useState(STATES[0]);
  const [newsDivision, setNewsDivision] = useState(DIVISIONS[0]);
  const [newsLoading, setNewsLoading] = useState(false);

  // DigitalSerenity mouse gradient
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseGradientStyle({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        opacity: 1,
      });
    };
    const handleMouseLeave = () => {
      setMouseGradientStyle(prev => ({ ...prev, opacity: 0 }));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // DigitalSerenity ripple effect
  useEffect(() => {
    const handleClick = (e) => {
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Fetch news with filters
  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      const q = query(collection(db, "news"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setNews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingNews(false);
    };
    fetchNews();
  }, []);

  // Add news function
  const handleAddNews = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "news"), {
      title: newsTitle,
      content: newsContent,
      date: new Date().toISOString(),
      author: "Admin", // Replace with actual admin name if available
      state: newsState,
      division: newsDivision,
      imageUrl: "", // Add image upload logic if needed
    });
    setShowAddNews(false);
    setNewsTitle('');
    setNewsContent('');
    setNewsState(STATES[0]);
    setNewsDivision(DIVISIONS[0]);
    // Refresh news
    const q = query(collection(db, "news"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setNews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Delete news function
  const handleDeleteNews = async (id) => {
    await deleteDoc(doc(db, "news", id));
    setNews(news.filter(item => item.id !== id));
  };

  // DigitalSerenity CSS
  const pageStyles = `
    #mouse-gradient-react {
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      background-image: radial-gradient(circle, rgba(156, 163, 175, 0.05), rgba(107, 114, 128, 0.05), transparent 70%);
      transform: translate(-50%, -50%);
      will-change: left, top, opacity;
      transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
      z-index: 10;
    }
    @keyframes word-appear { 0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); } 50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
    @keyframes grid-draw { 0% { stroke-dashoffset: 1000; opacity: 0; } 50% { opacity: 0.3; } 100% { stroke-dashoffset: 0; opacity: 0.15; } }
    @keyframes pulse-glow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
    .grid-line { stroke: #94a3b8; stroke-width: 0.5; opacity: 0; stroke-dasharray: 5 5; stroke-dashoffset: 1000; animation: grid-draw 2s ease-out forwards; }
    .detail-dot { fill: #cbd5e1; opacity: 0; animation: pulse-glow 3s ease-in-out infinite; }
    .corner-element-animate { position: absolute; width: 40px; height: 40px; border: 1px solid rgba(203, 213, 225, 0.2); opacity: 0; animation: word-appear 1s ease-out forwards; }
    .floating-element-animate { position: absolute; width: 2px; height: 2px; background: #cbd5e1; border-radius: 50%; opacity: 0; animation: float 4s ease-in-out infinite; animation-play-state: running; }
    @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; } 25% { transform: translateY(-10px) translateX(5px); opacity: 0.6; } 50% { transform: translateY(-5px) translateX(-3px); opacity: 0.4; } 75% { transform: translateY(-15px) translateX(7px); opacity: 0.8; } }
    .ripple-effect { position: fixed; width: 4px; height: 4px; background: rgba(203, 213, 225, 0.6); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; animation: pulse-glow 1s ease-out forwards; z-index: 9999; }
    .word-animate { display: inline-block; opacity: 0; margin: 0 0.1em; transition: color 0.3s ease, transform 0.3s ease; }
    .word-animate:hover { color: #cbd5e1; transform: translateY(-2px); }
  `;

  // Animate hero words on mount
  useEffect(() => {
    const animateWords = () => {
      const wordElements = document.querySelectorAll('.word-animate');
      wordElements.forEach(word => {
        const delay = parseInt(word.getAttribute('data-delay')) || 0;
        setTimeout(() => {
          if (word) word.style.animation = 'word-appear 0.8s ease-out forwards';
        }, delay);
      });
    };
    const timeoutId = setTimeout(animateWords, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Filtered and sorted news
  const filteredNews = news
    .filter(item =>
      (filterState === "All" || item.state === filterState) &&
      (filterDivision === "All" || item.division === filterDivision)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Latest first
    .slice(0, 6); // Only show top 6

  // Admin check (replace with your actual admin logic if needed)
  const { user } = useFirebaseAuth();
  const isAdmin = useAdminCheck(user);

  return (
    <>
      <style>{pageStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100 font-primary overflow-hidden relative">
        {/* --- DigitalSerenity Background Elements --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="gridReactDarkResponsive" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridReactDarkResponsive)" />
          <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
          <line x1="50%" y1="0" x2="50%" y2="100%" className="grid-line" style={{ animationDelay: '2.5s', opacity: '0.05' }} />
          <line x1="0" y1="50%" x2="100%" y2="50%" className="grid-line" style={{ animationDelay: '3s', opacity: '0.05' }} />
          <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
          <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
          <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
          <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
          <circle cx="50%" cy="50%" r="1.5" className="detail-dot" style={{ animationDelay: '4s' }} />
        </svg>
        {/* Corner Elements */}
        <div className="corner-element-animate top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8" style={{ animationDelay: '4s' }}>
          <div className="absolute top-0 left-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8" style={{ animationDelay: '4.2s' }}>
          <div className="absolute top-0 right-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" style={{ animationDelay: '4.4s' }}>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8" style={{ animationDelay: '4.6s' }}>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        {/* Floating Dots */}
        <div className="floating-element-animate" style={{ top: '25%', left: '15%', animationDelay: '0.5s' }}></div>
        <div className="floating-element-animate" style={{ top: '60%', left: '85%', animationDelay: '1s' }}></div>
        <div className="floating-element-animate" style={{ top: '40%', left: '10%', animationDelay: '1.5s' }}></div>
        <div className="floating-element-animate" style={{ top: '75%', left: '90%', animationDelay: '2s' }}></div>
        {/* Mouse Gradient */}
        <div 
          id="mouse-gradient-react"
          className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
          style={{
            left: mouseGradientStyle.left,
            top: mouseGradientStyle.top,
            opacity: mouseGradientStyle.opacity,
          }}
        ></div>
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
          ></div>
        ))}
        {/* --- Hero Section --- */}
       <div className="relative w-full h-screen overflow-hidden">
  {/* Background Image */}
  <img
    src="/banner.jpeg"
    alt="KSFA Banner"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Overlay Content */}
  <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-slate-200 mb-2">
  <span className="word-animate" style={{ animationDelay: '0ms' }}>Indian</span>
  <span className="word-animate" style={{ animationDelay: '300ms' }}>football</span>
  <span className="word-animate" style={{ animationDelay: '600ms' }}>rises.</span>
</h2>

<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight leading-tight tracking-tight text-slate-50 mt-4 mb-2">
  <span className="word-animate" style={{ animationDelay: '900ms' }}>Finding</span>
  <span className="word-animate" style={{ animationDelay: '1150ms' }}>the</span>
  <span className="word-animate" style={{ animationDelay: '1350ms' }}>next</span>
  <span className="word-animate" style={{ animationDelay: '1550ms' }}>Chhetri.</span>
</h1>

<div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin text-slate-300 leading-relaxed tracking-wide mb-2">
  <span className="word-animate" style={{ animationDelay: '1800ms' }}>Many</span>
  <span className="word-animate" style={{ animationDelay: '2000ms' }}>leagues.</span>
  <span className="word-animate" style={{ animationDelay: '2200ms' }}>One</span>
  <span className="word-animate" style={{ animationDelay: '2400ms' }}>dream.</span>
  <span className="word-animate" style={{ animationDelay: '2600ms' }}>One</span>
  <span className="word-animate" style={{ animationDelay: '2800ms' }}>India.</span>
</div>

  </div>

  {/* Optional gradient overlay */}
  <div className="absolute inset-0 bg-black/40 z-0" />
</div>


        {/* --- Main HomePage Content --- */}
        <div className="relative z-10 p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Latest News</h2>
          <div className="flex gap-4 mb-6">
            <div className="news-btn-container">
              <select
                className="news-btn"
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
              >
                <option value="All">All States</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="news-btn-container">
              <select
                className="news-btn"
                value={filterDivision}
                onChange={e => setFilterDivision(e.target.value)}
              >
                <option value="All">All Divisions</option>
                {DIVISIONS.map(division => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
            </div>
          </div>
          {loadingNews ? (
            <FootballLoader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {filteredNews.map(item => (
    <div key={item.id} className="card">
      <div className="price">{item.title}</div>
      <div className="lists">
        <div className="list">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{item.content}</span>
        </div>
        <div className="list">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>{item.author} | {new Date(item.date).toLocaleString()}</span>
        </div>
      </div>
      <button className="action">Read More</button>
      {isAdmin && (
        <button
          className="text-red-500 mt-2"
          onClick={() => handleDeleteNews(item.id)}
        >
          Delete
        </button>
      )}
    </div>
  ))}
</div>
          )}
          {/* Add News button and form */}
          {isAdmin && (
            <button
              className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 mb-4"
              onClick={() => setShowAddNews(true)}
            >
              Add News
            </button>
          )}

          {showAddNews && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <form
                className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 w-full max-w-md"
                onSubmit={handleAddNews}
              >
                <h2 className="text-xl font-bold mb-2 text-green-800">Add News</h2>
                <input className="border p-2 rounded" placeholder="Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} required />
                <textarea className="border p-2 rounded" placeholder="Content" value={newsContent} onChange={e => setNewsContent(e.target.value)} required />

                {/* State Dropdown */}
                <select
                  className="border p-2 rounded"
                  value={newsState}
                  onChange={e => setNewsState(e.target.value)}
                  required
                >
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>

                {/* Division Dropdown */}
                <select
                  className="border p-2 rounded"
                  value={newsDivision}
                  onChange={e => setNewsDivision(e.target.value)}
                  required
                >
                  {DIVISIONS.map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>

                <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" type="submit">
                  Submit
                </button>
                <button type="button" className="text-red-500" onClick={() => setShowAddNews(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      {/* Uiverse.io Spacious74 Button CSS */}
      <style>{`
        /* Green Themed Uiverse Button */
.news-btn-container {
  position: relative;
  padding: 3px;
  background: linear-gradient(90deg, #059669, #22d3ee, #a7f3d0);
  border-radius: 0.9em;
  transition: all 0.4s ease;
  display: inline-block;
  margin-right: 1em;
}
.news-btn-container::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 0.9em;
  z-index: -10;
  filter: blur(0);
  transition: filter 0.4s ease;
}
.news-btn-container:hover::before {
  background: linear-gradient(90deg, #059669, #22d3ee, #a7f3d0);
  filter: blur(1.2em);
}
.news-btn-container:active::before {
  filter: blur(0.2em);
}
.news-btn {
  font-size: 1.1em;
  padding: 0.6em 0.8em;
  border-radius: 0.5em;
  border: none;
  background-color: #022c22;
  color: #a7f3d0;
  cursor: pointer;
  box-shadow: 2px 2px 3px #022c22b4;
  outline: none;
  transition: background 0.2s, color 0.2s;
}
.news-btn:focus, .news-btn:hover {
  background-color: #064e3b;
  color: #fff;
}
.card {
  max-width: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 1.5rem;
  background-color: #022c22;
  padding: 1.5rem;
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.3);
  border: 1.5px solid #059669;
}
.card .price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #a7f3d0;
}
.card .lists {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;
  font-size: 0.95rem;
  color: #fff;
}
.card .list {
  display: flex;
  align-items: center;
}
.card .list svg {
  height: 1rem;
  width: 1rem;
  color: #22d3ee;
}
.card .list span {
  margin-left: 1rem;
}
.card .action {
  margin-top: 2rem;
  width: 100%;
  border: 2px solid #a7f3d0;
  border-radius: 9999px;
  background-color: #a7f3d0;
  padding: 0.625rem 1.5rem;
  font-weight: 600;
  text-align: center;
  font-size: 0.95rem;
  color: #022c22;
  outline: none;
  text-decoration: none;
  transition: all .2s ease;
  cursor: pointer;
}
.card .action:hover {
  color: #a7f3d0;
  background-color: transparent;
}
      `}</style>
    </>
  );
};

export default HomePage;

