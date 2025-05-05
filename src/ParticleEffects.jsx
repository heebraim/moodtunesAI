// import { useState, useEffect } from 'react';

// const ParticleEffects = ({ mood }) => {
//   const [particles, setParticles] = useState([]);
//   const MOOD_COLORS = {
//     happy: '#FFD700',
//     sad: '#6495ED',
//     energetic: '#FF4136',
//     calm: '#2ECC40',
//     angry: '#B10DC9',
//     default: '#1DB954'
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (Math.random() > 0.7) {
//         setParticles(prev => [
//           ...prev.slice(-15),
//           {
//             id: Date.now(),
//             style: {
//               left: `${Math.random() * 100}%`,
//               width: `${Math.random() * 10 + 5}px`,
//               height: `${Math.random() * 10 + 5}px`,
//               animationDuration: `${Math.random() * 2 + 3}s`
//             }
//           }
//         ]);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return particles.map(particle => (
//     <div
//       key={particle.id}
//       className="particle"
//       style={{ 
//         ...particle.style, 
//         background: MOOD_COLORS[mood] || MOOD_COLORS.default 
//       }}
//     />
//   ));
// };

// export default ParticleEffects;

// PhysicalEffects.jsx
import { useState, useEffect } from 'react';

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

const PhysicalEffects = ({ mood }) => {
  const [particles, setParticles] = useState([]);
  const [monsterSeed, setMonsterSeed] = useState(0);

  // Particle effect
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

  // Monster generator
  useEffect(() => {
    if (mood) {
      setMonsterSeed(mood.charCodeAt(0) % 5);
    }
  }, [mood]);

  return (
    <>
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{ 
            ...particle.style, 
            background: MOOD_COLORS[mood]?.[0] || MOOD_COLORS.default[0]
          }}
        />
      ))}

      {/* Mood Monster */}
      {mood && (
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
      )}
    </>
  );
};

export default PhysicalEffects;