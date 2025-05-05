


// import { useState, useEffect, useCallback } from 'react';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// let tokenCache = {
//   value: null,
//   expiry: null,
// };

// async function getAccessToken() {
//   if (tokenCache.value && Date.now() < tokenCache.expiry) {
//     return tokenCache.value;
//   }

//   try {
//     const authResponse = await fetch('https://accounts.spotify.com/api/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Authorization': 'Basic ' + btoa(
//           `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
//         )
//       },
//       body: new URLSearchParams({ grant_type: 'client_credentials' })
//     });

//     if (!authResponse.ok) throw new Error('Token fetch failed');
    
//     const authData = await authResponse.json();
    
//     tokenCache = {
//       value: authData.access_token,
//       expiry: Date.now() + (authData.expires_in * 1000 - 300000)
//     };

//     return tokenCache.value;
//   } catch (error) {
//     console.error("Token Error:", error);
//     throw error;
//   }
// }

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// function App() {
//   const [mood, setMood] = useState('');
//   const [playlist, setPlaylist] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedTrack, setSelectedTrack] = useState(null);
//   const [audiusTrackUrl, setAudiusTrackUrl] = useState(null);

//   const getDynamicKeywords = useCallback(async (userMood) => {
//     try {
//       const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//       const prompt = `Generate 5 unique music search phrases for "${userMood}" mood covering different genres. Format as comma-separated values`;
      
//       const result = await model.generateContent(prompt);
//       const text = await result.response.text();
//       return text.split(',').map(s => s.trim()).filter(Boolean);
//     } catch (error) {
//       return [userMood];
//     }
//   }, []);

//   const fetchAudiusTrack = async (trackName, artist) => {
//     try {
//       const response = await fetch(
//         `https://audius-discovery-1.cultur3stake.com/v1/tracks/search?query=${encodeURIComponent(trackName + " " + artist)}&app_name=MOODBEATS`
//       );
//       const data = await response.json();
//       return data.data[0]?.stream_url;
//     } catch (error) {
//       console.error("Audius error:", error);
//       return null;
//     }
//   };

//   const handleTrackClick = async (track) => {
//     const audiusUrl = await fetchAudiusTrack(track.name, track.artist);
//     setSelectedTrack({
//       spotifyId: track.uri.split(':')[2],
//       audiusUrl: audiusUrl
//     });
//   };

//   const fetchSongs = useCallback(async (keywordsArray) => {
//     try {
//       const token = await getAccessToken();
//       const allTracks = [];
      
//       for (const keywords of keywordsArray.slice(0, 4)) {
//         const response = await fetch(
//           `https://api.spotify.com/v1/search?q=${encodeURIComponent(keywords)}&type=track&limit=6&market=US`,
//           { headers: { 'Authorization': `Bearer ${token}` } }
//         );

//         if (!response.ok) continue;
        
//         const data = await response.json();
//         const newTracks = data.tracks?.items.map(track => ({
//           id: track.id,
//           name: track.name,
//           artist: track.artists[0]?.name || 'Unknown Artist',
//           url: track.external_urls.spotify,
//           image: track.album?.images?.[0]?.url || '',
//           uri: track.uri
//         }));

//         allTracks.push(...newTracks);
//       }

//       return [...new Set(allTracks)].slice(0, 15);
//     } catch (error) {
//       throw error;
//     }
//   }, []);

//   const generatePlaylist = useCallback(async () => {
//     if (!mood.trim()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const keywordOptions = await getDynamicKeywords(mood);
//       const tracks = await fetchSongs(keywordOptions);
      
//       if (tracks.length === 0) {
//         throw new Error('No tracks found - try different mood words');
//       }
      
//       setPlaylist(tracks);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [mood, fetchSongs, getDynamicKeywords]);

//   return (
//     <div className="app">
//       <h1 className="header">🎵 MoodTunes AI</h1>

//       <div className="main-content">
//         <div className="input-container">
//           <div className="input-group">
//             <input
//               type="text"
//               className="mood-input"
//               value={mood}
//               onChange={(e) => setMood(e.target.value)}
//               placeholder="How are you feeling today?"
//               onKeyPress={(e) => e.key === 'Enter' && generatePlaylist()}
//             />
//             <button
//               className="generate-btn"
//               onClick={generatePlaylist}
//               disabled={loading || !mood.trim()}
//             >
//               {loading ? '🎧 Creating...' : 'Generate'}
//             </button>
//           </div>
//         </div>

//         {error && <p className="error-message">{error}</p>}

//         {playlist.length > 0 && (
//           <div className="playlist-container">
//             <div className="track-list">
//               {playlist.map((song) => (
//                 <div
//                   key={song.id}
//                   className="track-card"
//                   onClick={() => handleTrackClick(song)}
//                 >
//                   <img
//                     className="track-image"
//                     src={song.image || 'https://via.placeholder.com/60'}
//                     alt={song.name}
//                   />
//                   <div className="track-info">
//                     <h3 className="track-title">{song.name}</h3>
//                     <p className="track-artist">{song.artist}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {selectedTrack && (
//           <div className="modal-overlay">
//             <div className="modal-content">
//               <button className="modal-close" onClick={() => setSelectedTrack(null)}>
//                 ×
//               </button>
//               <iframe
//                 className="spotify-player"
//                 src={`https://open.spotify.com/embed/track/${selectedTrack.spotifyId}`}
//                 allow="encrypted-media"
//                 title="Spotify player"
//               />
//               <div className="full-track-section">
//                 {selectedTrack.audiusUrl ? (
//                   <>
//                     <audio controls src={selectedTrack.audiusUrl} className="audio-player" />
//                     <p className="playing-info">Now playing full track via Audius</p>
//                   </>
//                 ) : (
//                   <p className="unavailable-message">Full track not available</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// // Audius hosts for fallback
// const AUDIUS_HOSTS = [
//   'https://audius-discovery-1.cultur3stake.com',
//   'https://audius-discovery-2.cultur3stake.com',
//   'https://audius-discovery-3.cultur3stake.com'
// ];

// // Token management with safer cache
// let tokenCache = {
//   value: null,
//   expiry: null,
//   isRefreshing: false,
//   queue: [],
// };

// async function getAccessToken() {
//   if (tokenCache.value && Date.now() < tokenCache.expiry) {
//     return tokenCache.value;
//   }

//   if (tokenCache.isRefreshing) {
//     return new Promise((resolve) => {
//       tokenCache.queue.push(resolve);
//     });
//   }

//   tokenCache.isRefreshing = true;

//   try {
//     const authResponse = await fetch('https://accounts.spotify.com/api/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Authorization': 'Basic ' + btoa(
//           `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
//         )
//       },
//       body: new URLSearchParams({ grant_type: 'client_credentials' })
//     });

//     if (!authResponse.ok) throw new Error('Token fetch failed');
    
//     const authData = await authResponse.json();
//     const expiryTime = Date.now() + (authData.expires_in * 1000 - 300000);
    
//     tokenCache = {
//       ...tokenCache,
//       value: authData.access_token,
//       expiry: expiryTime,
//       isRefreshing: false,
//     };

//     tokenCache.queue.forEach(resolve => resolve(tokenCache.value));
//     tokenCache.queue = [];

//     return tokenCache.value;
//   } catch (error) {
//     tokenCache.isRefreshing = false;
//     tokenCache.queue = [];
//     console.error("Token Error:", error);
//     throw error;
//   }
// }

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// function App() {
//   const [mood, setMood] = useState('');
//   const [playlist, setPlaylist] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedTrack, setSelectedTrack] = useState(null);
//   const [audiusTrackUrl, setAudiusTrackUrl] = useState(null);
//   const [isFetchingTrack, setIsFetchingTrack] = useState(false);

//   const getDynamicKeywords = useCallback(async (userMood) => {
//     try {
//       const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//       const prompt = `Generate 5 unique music search phrases for "${userMood}" mood covering different genres. Format as comma-separated values`;
      
//       const result = await model.generateContent(prompt);
//       const text = await result.response.text();
//       return text.split(',').map(s => s.trim()).filter(Boolean);
//     } catch (error) {
//       console.error("Gemini Error:", error);
//       return [userMood];
//     }
//   }, []);

//   const fetchAudiusTrack = useCallback(async (trackName, artist) => {
//     let lastError;
    
//     for (const host of AUDIUS_HOSTS) {
//       try {
//         const response = await fetch(
//           `${host}/v1/tracks/search?query=${encodeURIComponent(`${trackName} ${artist}`)}&app_name=MOODBEATS`
//         );
//         const data = await response.json();
//         if (data.data?.[0]?.stream_url) {
//           return data.data[0].stream_url;
//         }
//       } catch (error) {
//         lastError = error;
//       }
//     }
    
//     console.error("All Audius hosts failed:", lastError);
//     return null;
//   }, []);

//   const handleTrackClick = useCallback(async (track) => {
//     setIsFetchingTrack(true);
//     try {
//       const audiusUrl = await fetchAudiusTrack(track.name, track.artist);
//       setSelectedTrack({
//         spotifyId: track.uri.split(':')[2],
//         audiusUrl
//       });
//     } catch (error) {
//       setError('Failed to load track preview');
//     } finally {
//       setIsFetchingTrack(false);
//     }
//   }, [fetchAudiusTrack]);

//   const fetchSongs = useCallback(async (keywordsArray) => {
//     try {
//       const token = await getAccessToken();
//       const allTracks = [];
//       const seenIds = new Set();
      
//       for (const keywords of keywordsArray.slice(0, 4)) {
//         try {
//           const response = await fetch(
//             `https://api.spotify.com/v1/search?q=${encodeURIComponent(keywords)}&type=track&limit=6&market=US`,
//             { headers: { 'Authorization': `Bearer ${token}` } }
//           );

//           if (!response.ok) continue;
          
//           const data = await response.json();
//           const newTracks = data.tracks?.items
//             .filter(track => !seenIds.has(track.id))
//             .map(track => ({
//               id: track.id,
//               name: track.name,
//               artist: track.artists[0]?.name || 'Unknown Artist',
//               url: track.external_urls.spotify,
//               image: track.album?.images?.[0]?.url || '',
//               uri: track.uri
//             }));

//           newTracks.forEach(track => seenIds.add(track.id));
//           allTracks.push(...newTracks);
//         } catch (error) {
//           console.error("Spotify search error:", error);
//         }
//       }

//       return allTracks.slice(0, 15);
//     } catch (error) {
//       throw error;
//     }
//   }, []);

//   const generatePlaylist = useCallback(async () => {
//     if (!mood.trim()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const keywordOptions = await getDynamicKeywords(mood);
//       const tracks = await fetchSongs(keywordOptions);
      
//       if (tracks.length === 0) {
//         throw new Error('No tracks found - try different mood words');
//       }
      
//       setPlaylist(tracks);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [mood, fetchSongs, getDynamicKeywords]);

//   const placeholderImage = useMemo(() => 
//     'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWVlIi8+CiAgPHRleHQgeD0iNTAiIHk9IjMwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODg4Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+',
//     []
//   );

//   return (
//     <div className="app">
//       <h1 className="header">🎵 MoodTunes AI</h1>

//       <div className="main-content">
//         <div className="input-container">
//           <div className="input-group">
//             <input
//               type="text"
//               className="mood-input"
//               value={mood}
//               onChange={(e) => setMood(e.target.value)}
//               placeholder="How are you feeling today?"
//               onKeyPress={(e) => e.key === 'Enter' && generatePlaylist()}
//               aria-label="Enter your mood"
//             />
//             <button
//               className="generate-btn"
//               onClick={generatePlaylist}
//               disabled={loading || !mood.trim()}
//               aria-busy={loading}
//             >
//               {loading ? (
//                 <span className="loading-dots">
//                   <span>🎧 Creating</span>
//                   <span className="dot">.</span>
//                   <span className="dot">.</span>
//                   <span className="dot">.</span>
//                 </span>
//               ) : 'Generate'}
//             </button>
//           </div>
//         </div>

//         {error && <p className="error-message" role="alert">{error}</p>}

//         {playlist.length > 0 && (
//           <div className="playlist-container">
//             <div className="track-list">
//               {playlist.map((song) => (
//                 <div
//                   key={song.id}
//                   className="track-card"
//                   onClick={() => handleTrackClick(song)}
//                   role="button"
//                   tabIndex="0"
//                   onKeyPress={(e) => e.key === 'Enter' && handleTrackClick(song)}
//                   aria-label={`Play ${song.name} by ${song.artist}`}
//                 >
//                   <img
//                     className="track-image"
//                     src={song.image || placeholderImage}
//                     alt={`Album cover for ${song.name}`}
//                     loading="lazy"
//                   />
//                   <div className="track-info">
//                     <h3 className="track-title">{song.name}</h3>
//                     <p className="track-artist">{song.artist}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {selectedTrack && (
//           <div className="modal-overlay">
//             <div className="modal-content">
//               <button 
//                 className="modal-close" 
//                 onClick={() => setSelectedTrack(null)}
//                 aria-label="Close player"
//               >
//                 ×
//               </button>
//               {selectedTrack.spotifyId && (
//                 <iframe
//                   className="spotify-player"
//                   src={`https://open.spotify.com/embed/track/${selectedTrack.spotifyId}?utm_source=generator`}
//                   allow="encrypted-media"
//                   title="Spotify player"
//                   loading="lazy"
//                 />
//               )}
//               <div className="full-track-section">
//                 {isFetchingTrack ? (
//                   <p className="playing-info">Loading track...</p>
//                 ) : selectedTrack.audiusUrl ? (
//                   <>
//                     <audio 
//                       controls 
//                       src={selectedTrack.audiusUrl} 
//                       className="audio-player" 
//                       aria-label="Audio player"
//                     />
//                     <p className="playing-info">Now playing full track via Audius</p>
//                   </>
//                 ) : (
//                   <p className="unavailable-message">Full track not available</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mood color mappings and monster parts
const MOOD_COLORS = {
  happy: ['#FFD700', '#FFA500'],
  sad: ['#6495ED', '#4169E1'],
  energetic: ['#FF4136', '#FF851B'],
  calm: ['#2ECC40', '#3D9970'],
  angry: ['#B10DC9', '#85144b'],
  default: ['#1DB954', '#191414']
};

const MONSTER_PARTS = {
  eyes: ['◕‿◕', 'ಠ_ಠ', '◔ ⌣ ◔', '◑.◑', '◉_◉'],
  mouths: ['ω', '〇', '▽', '⌂', '益'],
  shapes: [
    'M30,100 Q50,80 70,100 T110,100 Q130,80 150,100 T190,100 Q210,80 230,100',
    'M30,100 C50,60 70,140 90,100 S130,60 150,100 S210,140 230,100',
    'M30,100 Q50,120 70,100 T110,100 Q130,120 150,100 T190,100 Q210,120 230,100'
  ]
};

// Audius hosts for fallback
const AUDIUS_HOSTS = [
  'https://audius-discovery-1.cultur3stake.com',
  'https://audius-discovery-2.cultur3stake.com',
  'https://audius-discovery-3.cultur3stake.com'
];

// Token management with safer cache
let tokenCache = {
  value: null,
  expiry: null,
  isRefreshing: false,
  queue: [],
};

async function getAccessToken() {
  if (tokenCache.value && Date.now() < tokenCache.expiry) {
    return tokenCache.value;
  }

  if (tokenCache.isRefreshing) {
    return new Promise((resolve) => {
      tokenCache.queue.push(resolve);
    });
  }

  tokenCache.isRefreshing = true;

  try {
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(
          `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
        )
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' })
    });

    if (!authResponse.ok) throw new Error('Token fetch failed');
    
    const authData = await authResponse.json();
    const expiryTime = Date.now() + (authData.expires_in * 1000 - 300000);
    
    tokenCache = {
      ...tokenCache,
      value: authData.access_token,
      expiry: expiryTime,
      isRefreshing: false,
    };

    tokenCache.queue.forEach(resolve => resolve(tokenCache.value));
    tokenCache.queue = [];

    return tokenCache.value;
  } catch (error) {
    tokenCache.isRefreshing = false;
    tokenCache.queue = [];
    console.error("Token Error:", error);
    throw error;
  }
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const ParticleEffects = ({ mood }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setParticles(prev => [
          ...prev.slice(-15),
          {
            id: Date.now(),
            style: {
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDuration: `${Math.random() * 2 + 3}s`
            }
          }
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return particles.map(particle => (
    <div
      key={particle.id}
      className="particle"
      style={{ 
        ...particle.style, 
        background: MOOD_COLORS[mood]?.[0] || MOOD_COLORS.default[0]
      }}
    />
  ));
};

function App() {
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isFetchingTrack, setIsFetchingTrack] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [monsterSeed, setMonsterSeed] = useState(0);

  // Dynamic background effect
  useEffect(() => {
    const colors = MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default;
    const angle = Math.floor(Math.random() * 360);
    
    setBackgroundStyle({
      background: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`,
      animation: 'gradient 15s ease infinite'
    });
  }, [mood]);

  // Mood monster generator
  useEffect(() => {
    if (mood) {
      setMonsterSeed(mood.charCodeAt(0) % 5);
    }
  }, [mood]);

  const getDynamicKeywords = useCallback(async (userMood) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate 5 unique music search phrases for "${userMood}" mood covering different genres. Format as comma-separated values`;
      
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      return text.split(',').map(s => s.trim()).filter(Boolean);
    } catch (error) {
      console.error("Gemini Error:", error);
      return [userMood];
    }
  }, []);

  const fetchAudiusTrack = useCallback(async (trackName, artist) => {
    let lastError;
    
    for (const host of AUDIUS_HOSTS) {
      try {
        const response = await fetch(
          `${host}/v1/tracks/search?query=${encodeURIComponent(`${trackName} ${artist}`)}&app_name=MOODBEATS`
        );
        const data = await response.json();
        if (data.data?.[0]?.stream_url) {
          return data.data[0].stream_url;
        }
      } catch (error) {
        lastError = error;
      }
    }
    
    console.error("All Audius hosts failed:", lastError);
    return null;
  }, []);

  const handleTrackClick = useCallback(async (track) => {
    setIsFetchingTrack(true);
    try {
      const audiusUrl = await fetchAudiusTrack(track.name, track.artist);
      setSelectedTrack({
        spotifyId: track.uri.split(':')[2],
        audiusUrl
      });
    } catch (error) {
      setError('Failed to load track preview');
    } finally {
      setIsFetchingTrack(false);
    }
  }, [fetchAudiusTrack]);

  const fetchSongs = useCallback(async (keywordsArray) => {
    try {
      const token = await getAccessToken();
      const allTracks = [];
      const seenIds = new Set();
      
      for (const keywords of keywordsArray.slice(0, 4)) {
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(keywords)}&type=track&limit=6&market=US`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (!response.ok) continue;
          
          const data = await response.json();
          const newTracks = data.tracks?.items
            .filter(track => !seenIds.has(track.id))
            .map(track => ({
              id: track.id,
              name: track.name,
              artist: track.artists[0]?.name || 'Unknown Artist',
              url: track.external_urls.spotify,
              image: track.album?.images?.[0]?.url || '',
              uri: track.uri
            }));

          newTracks.forEach(track => seenIds.add(track.id));
          allTracks.push(...newTracks);
        } catch (error) {
          console.error("Spotify search error:", error);
        }
      }

      return allTracks.slice(0, 15);
    } catch (error) {
      throw error;
    }
  }, []);

  const generatePlaylist = useCallback(async () => {
    if (!mood.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const keywordOptions = await getDynamicKeywords(mood);
      const tracks = await fetchSongs(keywordOptions);
      
      if (tracks.length === 0) {
        throw new Error('No tracks found - try different mood words');
      }
      
      setPlaylist(tracks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mood, fetchSongs, getDynamicKeywords]);

  const placeholderImage = useMemo(() => 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZWVlIi8+CiAgPHRleHQgeD0iNTAiIHk9IjMwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODg4Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+',
    []
  );

  const MoodMonster = () => (
    <div className="mood-monster-container">
      <svg className="mood-monster" viewBox="0 0 260 160">
        <path 
          d={MONSTER_PARTS.shapes[monsterSeed % 3]} 
          fill={MOOD_COLORS[mood.toLowerCase()]?.[0] || '#1DB954'}
        />
        <text x="80" y="80" fontSize="40" fill="#000">
          {MONSTER_PARTS.eyes[monsterSeed]}
        </text>
        <text x="100" y="120" fontSize="40" fill="#000">
          {MONSTER_PARTS.mouths[monsterSeed]}
        </text>
      </svg>
    </div>
  );

  return (
    <div className="app" style={backgroundStyle}>
      <ParticleEffects mood={mood} />
      {mood && <MoodMonster />}

      <h1 className="header">🎵 MoodTunes AI</h1>

      <div className="main-content">
        <div className="input-container">
          <div className="input-group">
            <input
              type="text"
              className="mood-input"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="How are you feeling today?"
              onKeyPress={(e) => e.key === 'Enter' && generatePlaylist()}
              aria-label="Enter your mood"
            />
            <button
              className="generate-btn"
              onClick={generatePlaylist}
              disabled={loading || !mood.trim()}
              aria-busy={loading}
            >
              {loading ? (
                <span className="loading-dots">
                  <span>🎧 Creating</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              ) : 'Generate Playlist'}
            </button>
          </div>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        {playlist.length > 0 && (
          <div className="playlist-container">
            <div className="track-list">
              {playlist.map((song) => (
                <div
                  key={song.id}
                  className="track-card"
                  onClick={() => handleTrackClick(song)}
                  role="button"
                  tabIndex="0"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackClick(song)}
                  aria-label={`Play ${song.name} by ${song.artist}`}
                >
                  <img
                    className="track-image"
                    src={song.image || placeholderImage}
                    alt={`Album cover for ${song.name}`}
                    loading="lazy"
                  />
                  <div className="track-info">
                    <h3 className="track-title">{song.name}</h3>
                    <p className="track-artist">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTrack && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button 
                className="modal-close" 
                onClick={() => setSelectedTrack(null)}
                aria-label="Close player"
              >
                ×
              </button>
              {selectedTrack.spotifyId && (
                <iframe
                  className="spotify-player"
                  src={`https://open.spotify.com/embed/track/${selectedTrack.spotifyId}?utm_source=generator`}
                  allow="encrypted-media"
                  title="Spotify player"
                  loading="lazy"
                />
              )}
              <div className="full-track-section">
                {isFetchingTrack ? (
                  <p className="playing-info">Loading track...</p>
                ) : selectedTrack.audiusUrl ? (
                  <>
                    <audio 
                      controls 
                      src={selectedTrack.audiusUrl} 
                      className="audio-player" 
                      aria-label="Audio player"
                    />
                    <p className="playing-info">Now playing full track via Audius</p>
                  </>
                ) : (
                  <p className="unavailable-message">Full track not available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;