// src/components/pages/HomePage.jsx
import React from 'react';

const HomePage = () => {
  const newsArticles = [
    {
      id: 1,
      title: "KSFA League Kicks Off with Thrilling Matches!",
      date: "June 12, 2025",
      content: "The highly anticipated KSFA Football League has officially commenced, delivering an exhilarating opening weekend. Fans witnessed nail-biting finishes and spectacular goals across all divisions. Early contenders are already making their mark, promising a season full of excitement and fierce competition. Stay tuned for more updates as the league progresses!"
    },
    {
      id: 2,
      title: "Golden Lions Dominate Opening Fixtures",
      date: "June 11, 2025",
      content: "The Golden Lions have started their KSFA Premier League campaign with a commanding performance, securing two dominant victories. Their formidable offense and stout defense have put the league on notice. Coach's strategic prowess seems to be paying off early in the season. Will they maintain this winning streak?"
    },
    {
      id: 3,
      title: "New Talent Shines in Division One",
      date: "June 10, 2025",
      content: "Several new faces in KSFA Division One have delivered breakout performances in the initial matches. Young players are showcasing immense potential, contributing significantly to their teams' successes. This influx of fresh talent promises a vibrant future for KSFA football. We'll be keeping a close eye on these rising stars!"
    },
    {
      id: 4,
      title: "Injury Update: Key Players Out for Next Round",
      date: "June 9, 2025",
      content: "Unfortunately, a few key players from various teams have sustained injuries during the demanding opening fixtures and will be sidelined for the upcoming matches. Their respective clubs are working diligently on their recovery. We wish them a speedy return to the pitch. Teams will need to adjust their strategies accordingly."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Banner Image */}
      <div className="relative h-[600px]">
        <img 
          src="/banner.jpeg" 
          alt="Football Stadium" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50">
          <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
                Karnataka State Football
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
                Experience Karnataka's Premier Football League - Where Passion Meets Performance
              </p>
              <div className="flex justify-center gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                  View Teams
                </button>
                <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-green-900 transition-all duration-300 transform hover:scale-105">
                  League Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="bg-gradient-to-b from-black/50 to-green-900">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Latest Updates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map(article => (
              <div key={article.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:transform hover:scale-105 transition-all">
                <div className="text-green-400 text-sm mb-3">{article.date}</div>
                <h3 className="text-xl font-bold text-white mb-4">{article.title}</h3>
                <p className="text-gray-300 mb-6">{article.content}</p>
                <button className="text-black border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-green-900 transition-all">
                  Read More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

