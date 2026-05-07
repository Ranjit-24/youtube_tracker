import React, { useState, useEffect } from 'react';
import { 
  Search, Download, List, Trash2, X, Plus, AlertCircle, Share2, Mail, 
  MessageCircle, Copy, Check, Home, BarChart3, TrendingUp, Video, Hash, Eye, Send 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// Renamed to "App" to match "App.jsx"
const App = () => {
  // ---- Add your YouTube API Key here ----
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;  
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [listedVideos, setListedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('home'); // Set home as default
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load listed videos from storage on mount
  useEffect(() => {
    loadListedVideos();
  }, []);

  // FIXED: Use standard localStorage (it's synchronous, no "async" needed)
  const loadListedVideos = () => {
    try {
      const data = localStorage.getItem('listed-videos');
      if (data) {
        setListedVideos(JSON.parse(data));
      }
    } catch (err) {
      console.log('No saved videos found or error parsing:', err);
    }
  };

  // FIXED: Use standard localStorage
  const saveListedVideos = (videos) => {
    try {
      localStorage.setItem('listed-videos', JSON.stringify(videos));
    } catch (err) {
      console.error('Error saving videos:', err);
    }
  };

  const searchVideos = async () => {
    if (!API_KEY || API_KEY === '') {
      setError('Please add your YouTube API key in the code (line 19)');
      return;
    }
    if (!keywords.trim()) {
      setError('Please enter at least one keyword');
      return;
    }

    setLoading(true);
    setError('');
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const allResults = [];

    try {
      for (const keyword of keywordList) {
        // FIXED: Added backticks (`) for the template literal
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=30&order=date&key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        if (data.items) {
          data.items.forEach(item => {
            allResults.push({
              id: item.id.videoId,
              keyword: keyword,
              title: item.snippet.title,
              channel: item.snippet.channelTitle,
              publishDate: new Date(item.snippet.publishedAt).toLocaleDateString(),
              // FIXED: Added backticks (`) for the template literal
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              thumbnail: item.snippet.thumbnails.default.url,
              flagged: 'Yes'
            });
          });
        }
      }

      setResults(allResults);
      setActiveTab('results');
    } catch (err) {
      setError(err.message || 'Failed to fetch videos. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToList = (video) => {
    const isDuplicate = listedVideos.some(v => v.id === video.id);
    if (!isDuplicate) {
      const updated = [...listedVideos, video];
      setListedVideos(updated);
      saveListedVideos(updated); // This saves to localStorage
    }
  };

  const removeFromList = (videoId) => {
    const updated = listedVideos.filter(v => v.id !== videoId);
    setListedVideos(updated);
    saveListedVideos(updated); // This saves to localStorage
  };

  const clearResults = () => {
    setResults([]);
  };

  const clearListedVideos = () => {
    if (window.confirm('Are you sure you want to clear all listed videos?')) {
      setListedVideos([]);
      saveListedVideos([]); // This clears localStorage
    }
  };

  const downloadExcel = (data, filename) => {
    const exportData = data.map(v => ({
      'Keyword': v.keyword,
      'Video Title': v.title,
      'Channel Name': v.channel,
      'Publish Date': v.publishDate,
      'Video URL': v.url,
      'Flagged': v.flagged
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Videos');
    XLSX.writeFile(wb, filename);
  };

  const generateShareText = () => {
    if (listedVideos.length === 0) return '';
    
    let text = '📺 My Flagged YouTube Videos\n\n';
    listedVideos.forEach((video, idx) => {
      // FIXED: Added backticks (`) for the template literal
      text += `${idx + 1}. ${video.title}\n`;
      text += `   Channel: ${video.channel}\n`;
      text += `   ${video.url}\n\n`;
    });
    return text;
  };

  const shareViaEmail = () => {
    const subject = 'My Flagged YouTube Videos';
    const body = generateShareText();
    // FIXED: Added backticks (`) for the template literal
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setShowShareMenu(false);
  };

  const shareViaWhatsApp = () => {
    const text = generateShareText();
    // FIXED: Added backticks (`) for the template literal
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    setShowShareMenu(false);
  };

  const shareViaTelegram = () => {
    const text = generateShareText();
    // FIXED: Added backticks (`) for the template literal
    window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // RE-ADDED: Analytics function
  const getAnalytics = () => {
    // THIS IS THE KEY: It now uses "listedVideos" which comes from localStorage
    const data = listedVideos; 
    
    if (data.length === 0) {
      return {
        totalVideos: 0,
        totalKeywords: 0,
        totalChannels: 0,
        keywordData: [],
        topChannels: [],
        timelineData: []
      };
    }

    const keywordCounts = {};
    data.forEach(v => {
      keywordCounts[v.keyword] = (keywordCounts[v.keyword] || 0) + 1;
    });
    const keywordData = Object.entries(keywordCounts).map(([name, count]) => ({
      name,
      count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

    const channelCounts = {};
    data.forEach(v => {
      channelCounts[v.channel] = (channelCounts[v.channel] || 0) + 1;
    });
    const topChannels = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const dateCounts = {};
    data.forEach(v => {
      const date = new Date(v.publishDate).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const timelineData = Object.entries(dateCounts)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));

    return {
      totalVideos: data.length,
      totalKeywords: Object.keys(keywordCounts).length,
      totalChannels: Object.keys(channelCounts).length,
      keywordData,
      topChannels,
      timelineData
    };
  };

  // RE-ADDED: Analytics data and colors
  const analytics = getAnalytics();
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const VideoCard = ({ video, showAddButton, onAdd, onRemove }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 flex-shrink-0">
          <img src={video.thumbnail} alt="" className="w-full h-32 sm:h-full object-cover" />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-900 font-medium hover:text-red-600 transition line-clamp-2 text-sm"
            >
              {video.title}
            </a>
            {showAddButton && (
              <button
                onClick={() => onAdd(video)}
                className="bg-green-500 text-white p-1.5 rounded-lg hover:bg-green-600 transition flex-shrink-0"
                title="Add to list"
              >
                <Plus size={16} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(video.id)}
                className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition flex-shrink-0"
                title="Remove"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>{video.channel}</span>
            <span>•</span>
            <span>{video.publishDate}</span>
          </div>
          <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            {video.keyword}
          </span>
        </div>
      </div>
    </div>
  );
  
  // RE-ADDED: A component for the nav items
  const NavItem = ({ icon: Icon, label, tabName, count }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 py-4 flex flex-col items-center justify-center transition relative ${
        activeTab === tabName
          ? 'text-red-600 border-t-2 border-red-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={22} />
      {count > 0 && (
        <span className="absolute top-2 right-1/2 translate-x-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {count}
        </span>
      )}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* App Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Search size={24} />
            </div>
            <div>
              {/* Changed title */}
              <h1 className="text-xl font-bold">YouTube Content Dashboard</h1>
              <p className="text-xs text-red-100">Search, Track & Analyze</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 pb-24">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* RE-ADDED: Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-3">YouTube Content Tracker</h2>
                <p className="text-red-100 text-lg mb-6">Monitor, analyze, and organize YouTube videos by keywords in real-time</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{analytics.totalVideos}</div>
                    <div className="text-sm text-red-100">Total Videos Tracked</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{analytics.totalKeywords}</div>
                    <div className="text-sm text-red-100">Keywords Monitored</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{analytics.totalChannels}</div>
                    <div className="text-sm text-red-100">Unique Channels</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-xl"><Search className="text-red-600" size={24} /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">Smart Keyword Search</h4>
                        <p className="text-sm text-gray-600">Track multiple keywords. Search returns the 30 most recent videos per keyword.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl"><BarChart3 className="text-blue-600" size={24} /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">Analytics Dashboard</h4>
                        <p className="text-sm text-gray-600">Visualize your saved video list with interactive charts. See keyword and channel distributions.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-xl"><List className="text-green-600" size={24} /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">Persistent Video Lists</h4>
                        <p className="text-sm text-gray-600">Save videos to "My List" with one click. Your list is saved to local storage for long-term access.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-xl"><Download className="text-purple-600" size={24} /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">Export & Share</h4>
                        <p className="text-sm text-gray-600">Download your video lists as Excel spreadsheets. Share curated lists via WhatsApp, Email, or Telegram.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Enter Keywords or Hashtags
                </label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., #tech, coding tutorial, react hooks"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                />
                <p className="mt-3 text-xs text-gray-500">
                  Separate multiple keywords with commas. Each returns up to 30 recent videos.
                </p>
              </div>

              <button
                onClick={searchVideos}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2" size={20} />
                    Search Videos
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Search Results ({results.length})</h2>
                {results.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadExcel(results, 'search_results.xlsx')}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition flex items-center text-sm shadow-sm"
                    >
                      <Download className="mr-1.5" size={16} />
                      Excel
                    </button>
                    <button
                      onClick={clearResults}
                      className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition flex items-center text-sm shadow-sm"
                    >
                      <Trash2 className="mr-1.5" size={16} />
                      Clear
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Search size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No results yet</p>
                  </div>
                ) : (
                  results.map((video, idx) => (
                    <VideoCard key={idx} video={video} showAddButton={true} onAdd={addToList} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Listed Videos Tab */}
          {activeTab === 'listed' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">My List ({listedVideos.length})</h2>
                {listedVideos.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition flex items-center text-sm shadow-sm"
                    >
                      <Share2 className="mr-1.5" size={16} />
                      Share
                    </button>
                    <button
                      onClick={() => downloadExcel(listedVideos, 'my_listed_videos.xlsx')}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition flex items-center text-sm shadow-sm"
                    >
                      <Download className="mr-1.5" size={16} />
                      Excel
                    </button>
                    <button
                      onClick={clearListedVideos}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition flex items-center text-sm shadow-sm"
                    >
                      <Trash2 className="mr-1.5" size={16} />
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Share via:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={shareViaWhatsApp}
                      className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition text-sm font-medium"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>
                    <button
                      onClick={shareViaEmail}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition text-sm font-medium"
                    >
                      <Mail size={18} />
                      Email
                    </button>
                    <button
                      onClick={shareViaTelegram}
                      className="flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-3 rounded-xl hover:bg-sky-600 transition text-sm font-medium"
                    >
                      <Send size={18} /> {/* Fixed Icon */}
                      Telegram
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition text-sm font-medium"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {listedVideos.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <List size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No videos in your list</p>
                    <p className="text-sm mt-1">Add videos from search results</p>
                  </div>
                ) : (
                  listedVideos.map((video, idx) => (
                    <VideoCard key={idx} video={video} onRemove={removeFromList} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* RE-ADDED: Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 -mt-4">
                {`Analyzing your ${analytics.totalVideos} saved videos.`}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Total Videos</div>
                    <Video className="text-red-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{analytics.totalVideos}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Keywords</div>
                    <Hash className="text-blue-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{analytics.totalKeywords}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Channels</div>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{analytics.totalChannels}</div>
                </div>
              </div>

              {analytics.totalVideos === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No data to analyze yet</p>
                  <p className="text-sm">Add videos to "My List" to see analytics</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Videos by Keyword</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.keywordData} margin={{ bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} interval={0} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Keyword Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.keywordData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analytics.keywordData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top 10 Channels</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.topChannels} layout="vertical" margin={{ left: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto flex">
          {/* RE-ADDED NavItem component */}
          <NavItem icon={Home} label="Home" tabName="home" />
          <NavItem icon={Search} label="Search" tabName="search" />
          <NavItem icon={List} label="Results" tabName="results" count={results.length} />
          <NavItem icon={List} label="My List" tabName="listed" count={listedVideos.length} />
          <NavItem icon={BarChart3} label="Analytics" tabName="analytics" />
        </div>
      </div>
    </div>
  );
};

// Renamed export to "App"
export default App;