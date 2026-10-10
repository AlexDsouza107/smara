import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, X, Music, MapPin, Users, Shuffle, Clock, Volume2, Play, Pause, Sparkles, ChevronLeft, ChevronRight, Sun, Timer } from 'lucide-react';
import { getMemories, getPatient, getTimeline, updateStats, getStats, addActivity } from '../utils/storage';
import { assetUrl } from '../utils/api';
import { getPersonalContent, recordReaction } from '../utils/personalize';
import { useDailySession, formatClock } from '../utils/session';

// Shown when no SerpApi songs have been approved yet
const FALLBACK_SONG_LINES = [
  {
    line: 'Yeh dosti hum nahi...',
    options: ['todenge', 'chodenge', 'bhulenge', 'khatam karenge'],
    correct: 'todenge',
  },
  {
    line: 'Mere sapno ki rani, kab aayegi...',
    options: ['tu', 'woh', 'yeh', 'koi'],
    correct: 'tu',
  },
  {
    line: 'Kuch kuch hota hai, tum nahi...',
    options: ['samjhoge', 'jaante', 'dekhte', 'sochte'],
    correct: 'samjhoge',
  },
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const REACTIONS = [
  { id: 'yes', label: 'Yes, I remember', style: 'hover:border-green-500 hover:bg-green-50' },
  { id: 'unsure', label: "I'm not sure", style: 'hover:border-orange-500 hover:bg-orange-50' },
  { id: 'no', label: "I don't remember", style: 'hover:border-gray-500 hover:bg-gray-50' },
];

// 6 Pairs defined with descriptions and images
const MEMORY_MATCH_PAIRS = [
  {
    id: 'diwali',
    title: 'Diwali at Home',
    description: 'Traditional illuminated clay diyas with festive lights',
    image: '/diwali.png',
  },
  {
    id: 'ganpati',
    title: 'Ganpati 2025',
    description: 'Extended family gathered in festive attire celebrating Ganpati',
    image: '/ganpati.png',
  },
  {
    id: 'first-grandchild',
    title: 'First Grandchild',
    description: 'Mother cradling her newborn baby',
    image: '/first-grandchild.png',
  },
  {
    id: 'first-teaching-job',
    title: 'First Teaching Job',
    description: 'Teacher conducting a lesson at the classroom blackboard',
    image: '/first-teaching-job.png',
  },
  {
    id: 'summer-vacation-pune',
    title: 'Summer Vacation Pune',
    description: 'Family outdoor photo in front of the historic Aga Khan Palace in Pune',
    image: '/summer-vacation-pune.png',
  },
  {
    id: 'wedding-day',
    title: 'Wedding Day',
    description: 'Vintage framed portrait of the bride and groom in traditional wedding attire',
    image: '/wedding.png',
  },
];

function SetupNeeded({ title, icon: Icon, message, link, linkLabel, onClose }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
            <X className="w-6 h-6" />
          </button>
        </div>
        <Icon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 max-w-lg mx-auto mb-6">{message}</p>
        <Link to={link} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium">
          {linkLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function SessionBar({ session }) {
  const percent = Math.min(100, (session.seconds / session.limit) * 100);
  return (
    <div className="max-w-4xl mx-auto mb-4 rounded-xl border border-stone-200 bg-white/90 px-4 py-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="flex items-center gap-1.5 font-semibold text-stone-700">
          <Timer className="w-4 h-4" /> Today's session
        </span>
        <span className="text-stone-500">{formatClock(session.seconds)} of {formatClock(session.limit)}</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${session.remaining < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SessionComplete({ name, onExtend }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl shadow-lg border border-amber-200 p-10 text-center">
        <Sun className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Well done today, {name}!</h2>
        <p className="text-lg text-gray-700 mb-8">That's 10 lovely minutes. Time to rest. See you tomorrow.</p>
        <button
          onClick={onExtend}
          className="text-sm font-medium text-stone-500 underline hover:text-stone-800"
        >
          Caregiver: allow 5 more minutes
        </button>
      </div>
    </div>
  );
}

function Activities() {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameState, setGameState] = useState({});
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const voicePlayerRef = useRef(null);
  const memories = getMemories();
  const patient = getPatient();
  const firstName = patient?.name?.split(' ')[0] || 'your loved one';
  const [personal, setPersonal] = useState({ songs: [], places: [] });
  const session = useDailySession(Boolean(currentGame));

  // Songs and places the caregiver approved in Memory Finder (found via SerpApi)
  useEffect(() => {
    getPersonalContent({ approvedOnly: true })
      .then((items) => setPersonal({
        songs: items.filter((i) => i.kind === 'song'),
        places: items.filter((i) => i.kind === 'place'),
      }))
      .catch(() => {});
  }, []);

  const games = [
    {
      id: 'who-is-this',
      title: 'Who is this?',
      description: 'Recognize familiar faces',
      icon: Users,
      color: 'blue',
      difficulty: 'Easy',
      time: '5 min',
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Match people and places',
      icon: Shuffle,
      color: 'purple',
      difficulty: 'Medium',
      time: '8 min',
    },
    {
      id: 'complete-song',
      title: 'Songs from Your Youth',
      description: 'Listen to songs from their youth',
      icon: Music,
      color: 'pink',
      difficulty: 'Easy',
      time: '5 min',
    },
    {
      id: 'voice-match',
      title: 'Whose Voice Is It?',
      description: 'Listen to a familiar voice and choose their photo',
      icon: Volume2,
      color: 'purple',
      difficulty: 'Easy',
      time: '5 min',
    },
    {
      id: 'familiar-place',
      title: 'Familiar Place',
      description: 'Real photos of places from their life',
      icon: MapPin,
      color: 'green',
      difficulty: 'Easy',
      time: '5 min',
    },
    {
      id: 'memory-story',
      title: 'Memory Story',
      description: 'Arrange events in order',
      icon: Clock,
      color: 'orange',
      difficulty: 'Medium',
      time: '10 min',
    },
  ];

  const serpApiCounts = {
    'complete-song': personal.songs.length,
    'familiar-place': personal.places.length,
  };

  const startGame = (gameId) => {
    setCurrentGame(gameId);
    initializeGame(gameId);
  };

  const initializeGame = (gameId) => {
    switch (gameId) {
      case 'who-is-this':
        initWhoIsThis();
        break;
      case 'memory-match':
        initMemoryMatch();
        break;
      case 'complete-song':
        initCompleteSong();
        break;
      case 'voice-match':
        initVoiceMatch();
        break;
      case 'familiar-place':
        initFamiliarPlace();
        break;
      case 'memory-story':
        initMemoryStory();
        break;
      default:
        break;
    }
  };

  const initWhoIsThis = () => {
    const members = (patient?.familyMembers || []).filter((m) => m.photo);
    if (members.length < 2) {
      setGameState({ needsSetup: true });
      return;
    }
    const rounds = shuffle(members).slice(0, 4);
    setGameState({
      rounds,
      member: rounds[0],
      options: shuffle(members).map((m) => m.name).filter((n) => n !== rounds[0].name).slice(0, 3).concat(rounds[0].name),
      answered: false,
      correct: null,
      score: 0,
      round: 1,
      totalRounds: rounds.length,
    });
  };

  // Initialize 12 cards (6 text cards + 6 image cards)
  const initMemoryMatch = () => {
    const cards = [];

    MEMORY_MATCH_PAIRS.forEach((pair) => {
      // Text card
      cards.push({
        id: `text-${pair.id}`,
        type: 'text',
        title: pair.title,
        description: pair.description,
        matchId: pair.id,
        flipped: false,
        matched: false,
      });
      // Image card
      cards.push({
        id: `img-${pair.id}`,
        type: 'image',
        image: pair.image,
        title: pair.title,
        matchId: pair.id,
        flipped: false,
        matched: false,
      });
    });

    cards.sort(() => Math.random() - 0.5);

    setGameState({
      cards: cards,
      flippedCards: [],
      matches: 0,
      moves: 0,
    });
  };

  const initCompleteSong = () => {
    if (personal.songs.length > 0) {
      const rounds = shuffle(personal.songs).slice(0, 3);
      setGameState({ mode: 'youtube', rounds, song: rounds[0], round: 1, totalRounds: rounds.length, answered: false, reaction: null });
      return;
    }
    const rounds = shuffle(FALLBACK_SONG_LINES);
    setGameState({ mode: 'lyrics', rounds, currentSong: rounds[0], answered: false, correct: null, score: 0, round: 1, totalRounds: rounds.length });
  };

  const initVoiceMatch = () => {
    const playableFamilyMembers = (patient?.familyMembers || []).filter(
      (member) => member.photo && member.voice
    );

    if (playableFamilyMembers.length < 4) {
      setGameState({ availableMembers: playableFamilyMembers.length, needsSetup: true });
      return;
    }

    const selectedMembers = shuffle(playableFamilyMembers).slice(0, 4);
    const roundMembers = shuffle(selectedMembers);
    setGameState({
      options: shuffle(selectedMembers),
      roundMembers,
      currentMember: roundMembers[0],
      answered: false,
      correct: null,
      score: 0,
      round: 1,
      totalRounds: 4,
    });
  };

  const initFamiliarPlace = () => {
    // Places found with SerpApi first, then family photos tagged as places
    const fromSerpApi = personal.places.map((p) => ({
      contentId: p.id,
      title: p.title,
      subtitle: p.address,
      description: p.description,
      photos: p.photos.map((ph) => ph.image),
      mapsLink: p.mapsLink,
    }));
    const fromFamily = memories
      .filter((m) => m.category === 'Places' && m.image)
      .map((m) => ({ title: m.title, description: m.description, photos: [assetUrl(m.image)] }));
    const all = [...fromSerpApi, ...fromFamily];

    if (all.length === 0) {
      setGameState({ needsSetup: true });
      return;
    }
    const rounds = shuffle(all).slice(0, 3);
    setGameState({ rounds, place: rounds[0], photoIndex: 0, round: 1, totalRounds: rounds.length, answered: false, response: null });
  };

  const initMemoryStory = () => {
    // One event per year, four at most, so there is always one right order
    const byYear = new Map();
    shuffle(getTimeline()).forEach((e) => { if (!byYear.has(e.year)) byYear.set(e.year, e); });
    const events = [...byYear.values()].slice(0, 4).map((e) => ({ ...e, id: e.id ?? `${e.year}-${e.title}` }));

    setGameState({
      memories: events,
      shuffledMemories: shuffle(events),
      userOrder: [],
      completed: false,
      correct: null,
    });
  };

  const handleWhoIsThisAnswer = (answer) => {
    const isCorrect = answer === gameState.member.name;
    const newScore = gameState.score + (isCorrect ? 1 : 0);

    setGameState({
      ...gameState,
      answered: true,
      correct: isCorrect,
      score: newScore,
    });

    const stats = getStats();
    if (stats) {
      updateStats({
        memoryInteractions: stats.memoryInteractions + 1,
        engagementTime: stats.engagementTime + 1,
      });
    }
  };

  const nextWhoIsThisRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      completeGame();
      return;
    }
    const allNames = (patient?.familyMembers || []).filter((m) => m.photo).map((m) => m.name);
    const member = gameState.rounds[gameState.round];
    setGameState({
      ...gameState,
      member,
      options: shuffle(shuffle(allNames).filter((n) => n !== member.name).slice(0, 3).concat(member.name)),
      answered: false,
      correct: null,
      round: gameState.round + 1,
    });
  };

  const handleMemoryMatchClick = (cardId) => {
    if (gameState.flippedCards.length >= 2) return;

    const cards = gameState.cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );

    const flippedCards = [...gameState.flippedCards, cardId];

    setGameState({
      ...gameState,
      cards: cards,
      flippedCards: flippedCards,
      moves: gameState.moves + (flippedCards.length === 2 ? 1 : 0),
    });

    if (flippedCards.length === 2) {
      const card1 = cards.find(c => c.id === flippedCards[0]);
      const card2 = cards.find(c => c.id === flippedCards[1]);

      if (card1.matchId === card2.matchId) {
        setTimeout(() => {
          const matchedCards = gameState.cards.map(card =>
            card.matchId === card1.matchId ? { ...card, matched: true } : card
          );
          const updatedMatches = gameState.matches + 1;
          setGameState({
            ...gameState,
            cards: matchedCards,
            flippedCards: [],
            matches: updatedMatches,
          });

          if (updatedMatches === 6) {
            setTimeout(() => {
              completeGame();
            }, 1200);
          }
        }, 800);
      } else {
        setTimeout(() => {
          const resetCards = gameState.cards.map(card =>
            flippedCards.includes(card.id) ? { ...card, flipped: false } : card
          );
          setGameState({
            ...gameState,
            cards: resetCards,
            flippedCards: [],
          });
        }, 1300);
      }
    }
  };

  const handleSongAnswer = (answer) => {
    const isCorrect = answer === gameState.currentSong.correct;
    const newScore = gameState.score + (isCorrect ? 1 : 0);

    setGameState({
      ...gameState,
      answered: true,
      correct: isCorrect,
      score: newScore,
    });
  };

  const nextSongRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      completeGame();
      return;
    }
    const next = gameState.rounds[gameState.round];
    setGameState({
      ...gameState,
      ...(gameState.mode === 'youtube' ? { song: next, reaction: null } : { currentSong: next, correct: null }),
      answered: false,
      round: gameState.round + 1,
    });
  };

  const handleSongReaction = (reaction) => {
    recordReaction(gameState.song.id, reaction);
    setGameState({ ...gameState, answered: true, reaction, score: (gameState.score || 0) + (reaction === 'yes' ? 1 : 0) });
    const stats = getStats();
    if (stats) updateStats({ memoryInteractions: stats.memoryInteractions + 1 });
  };

  const toggleVoicePlayback = () => {
    const player = voicePlayerRef.current;
    if (!player || !gameState.currentMember?.voice) return;

    if (isVoicePlaying) {
      player.pause();
      setIsVoicePlaying(false);
      return;
    }

    player.play().then(() => setIsVoicePlaying(true)).catch(() => setIsVoicePlaying(false));
  };

  const handleVoiceMatchAnswer = (memberId) => {
    const isCorrect = memberId === gameState.currentMember.id;
    const newScore = gameState.score + (isCorrect ? 1 : 0);
    voicePlayerRef.current?.pause();
    setIsVoicePlaying(false);
    setGameState({ ...gameState, answered: true, correct: isCorrect, score: newScore });

    const stats = getStats();
    updateStats({
      memoryInteractions: stats.memoryInteractions + 1,
      engagementTime: stats.engagementTime + 1,
    });
  };

  const nextVoiceMatchRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      completeGame();
      return;
    }

    const nextRound = gameState.round + 1;
    setGameState({
      ...gameState,
      currentMember: gameState.roundMembers[nextRound - 1],
      answered: false,
      correct: null,
      round: nextRound,
    });
  };

  const handlePlaceResponse = (response) => {
    if (gameState.place.contentId) recordReaction(gameState.place.contentId, response);
    setGameState({ ...gameState, answered: true, response, score: (gameState.score || 0) + (response === 'yes' ? 1 : 0) });
    const stats = getStats();
    if (stats) updateStats({ memoryInteractions: stats.memoryInteractions + 1 });
  };

  const nextPlaceRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      completeGame();
      return;
    }
    setGameState({
      ...gameState,
      place: gameState.rounds[gameState.round],
      photoIndex: 0,
      answered: false,
      response: null,
      round: gameState.round + 1,
    });
  };

  const changePhoto = (step) => {
    const count = gameState.place.photos.length;
    setGameState({ ...gameState, photoIndex: (gameState.photoIndex + step + count) % count });
  };

  const handleMemoryStorySelect = (memory) => {
    if (gameState.userOrder.find(m => m.id === memory.id)) return;

    const newOrder = [...gameState.userOrder, memory];
    setGameState({
      ...gameState,
      userOrder: newOrder,
    });

    if (newOrder.length === gameState.memories.length) {
      checkMemoryStoryOrder(newOrder);
    }
  };

  const checkMemoryStoryOrder = (userOrder) => {
    const correctOrder = [...gameState.memories].sort((a, b) => a.year - b.year);

    const isCorrect = userOrder.every((mem, idx) => mem.id === correctOrder[idx].id);

    setGameState({
      ...gameState,
      completed: true,
      correct: isCorrect,
    });

    setTimeout(() => {
      completeGame();
    }, 3000);
  };

  const completeGame = () => {
    const stats = getStats();
    if (stats) {
      updateStats({
        activitiesCompleted: stats.activitiesCompleted + 1,
        engagementTime: stats.engagementTime + 5,
      });
    }

    addActivity({
      gameId: currentGame,
      score: gameState.score || 0,
      completed: true,
    });

    setCurrentGame(null);
    setGameState({});
  };

  const exitGame = () => {
    voicePlayerRef.current?.pause();
    setIsVoicePlaying(false);
    setCurrentGame(null);
    setGameState({});
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return colors[color] || colors.blue;
  };

  const renderGame = () => {
    if (currentGame === 'who-is-this' && gameState.needsSetup) {
      return (
        <SetupNeeded
          title="Who is this?"
          icon={Users}
          message="Add at least two family members with a photo in Patient Profile, then come back to play."
          link="/profile"
          linkLabel="Open Patient Profile"
          onClose={exitGame}
        />
      );
    }

    if (currentGame === 'who-is-this' && gameState.member) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Who is this?</h2>
              <button onClick={exitGame} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Round {gameState.round} of {gameState.totalRounds} • Score: {gameState.score}
              </p>
            </div>

            <div className="mb-8 flex justify-center">
              <img
                src={assetUrl(gameState.member.photo)}
                alt="A family member"
                className="h-72 w-72 object-cover rounded-2xl shadow"
              />
            </div>

            {!gameState.answered ? (
              <div className="grid grid-cols-2 gap-4">
                {gameState.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleWhoIsThisAnswer(option)}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-xl"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                {gameState.correct ? (
                  <div className="mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-green-600 mb-2">That's right!</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">😊</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 mb-2">Good try!</p>
                  </div>
                )}
                <p className="text-lg text-gray-700 mb-1">This is {gameState.member.name}, {gameState.member.relation}.</p>
                {gameState.member.description && <p className="text-gray-500 mb-6">{gameState.member.description}</p>}

                <button
                  onClick={nextWhoIsThisRound}
                  className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {gameState.round < gameState.totalRounds ? 'Next Person' : 'Complete Activity'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Memory Match View (6 Pairs / 12 Cards)
    if (currentGame === 'memory-match' && gameState.cards) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Memory Match</h2>
                <p className="text-sm text-stone-500 mt-1">
                  Matches: <span className="font-semibold text-emerald-600">{gameState.matches}/6</span> • Moves: <span className="font-semibold text-stone-700">{gameState.moves}</span>
                </p>
              </div>
              <button onClick={exitGame} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
              {gameState.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => !card.matched && !card.flipped && handleMemoryMatchClick(card.id)}
                  className={`relative h-32 sm:h-36 md:h-40 rounded-2xl border-2 transition-all duration-300 overflow-hidden text-left p-0 ${
                    card.matched
                      ? 'border-emerald-500 bg-emerald-50/70 opacity-80 cursor-default'
                      : card.flipped
                      ? 'border-blue-400 bg-[#FAF7F0] shadow-md'
                      : 'border-blue-500 bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer'
                  }`}
                  disabled={card.matched || card.flipped}
                >
                  {card.flipped || card.matched ? (
                    card.type === 'image' ? (
                      <div className="w-full h-full p-2 flex items-center justify-center">
                        <img 
                          src={card.image} 
                          alt={card.title} 
                          className="w-full h-full object-cover rounded-xl" 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full p-3 flex flex-col justify-center items-center text-center">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                          {card.title}
                        </span>
                        <span className="text-[10px] sm:text-xs text-stone-500 mt-1 line-clamp-3">
                          {card.description}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <span className="text-3xl font-bold opacity-75">?</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {gameState.matches === 6 && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-center flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>Great Job! You matched all 6 memories!</span>
                </div>
                <p className="text-sm text-emerald-700">Completed in {gameState.moves} moves.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentGame === 'complete-song' && gameState.mode === 'youtube') {
      const { song } = gameState;
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Songs from Your Youth</h2>
              <button onClick={exitGame} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Song {gameState.round} of {gameState.totalRounds} • Found for {firstName} with SerpApi YouTube Search
            </p>

            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black mb-6">
              <iframe
                key={song.videoId}
                src={`https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Song player"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="h-full w-full"
              />
            </div>

            {!gameState.answered ? (
              <>
                <p className="text-2xl text-center font-semibold text-gray-900 mb-5">Do you remember this song?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSongReaction(r.id)}
                      className={`p-5 border-2 border-gray-300 rounded-lg transition-colors font-medium text-lg ${r.style}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <Music className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-pink-700 mb-1">
                  {gameState.reaction === 'yes' ? 'Lovely! Sing along if you like.' : 'Enjoy the music.'}
                </p>
                <p className="text-gray-700 mb-6">{song.title}</p>
                <button
                  onClick={nextSongRound}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  {gameState.round < gameState.totalRounds ? 'Next Song' : 'Complete Activity'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentGame === 'complete-song' && gameState.currentSong) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complete the Song</h2>
              <button onClick={exitGame} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Round {gameState.round} of {gameState.totalRounds} • Score: {gameState.score}
              </p>
            </div>

            <div className="mb-8 text-center">
              <Music className="w-16 h-16 text-pink-600 mx-auto mb-4" />
              <p className="text-2xl font-semibold text-gray-900 mb-2">
                {gameState.currentSong.line}
              </p>
              <p className="text-gray-600">Complete this familiar line</p>
            </div>

            {!gameState.answered ? (
              <div className="grid grid-cols-2 gap-4">
                {gameState.currentSong.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSongAnswer(option)}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors font-medium text-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                {gameState.correct ? (
                  <div className="mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-green-600 mb-2">Perfect!</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600 mb-2">Let's try another</p>
                  </div>
                )}

                <button
                  onClick={nextSongRound}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  {gameState.round < gameState.totalRounds ? 'Next Song' : 'Complete Activity'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentGame === 'voice-match') {
      if (gameState.needsSetup) {
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Whose Voice Is It?</h2>
                <button onClick={exitGame} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Volume2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add four familiar voices first</h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                This activity needs four family members with both a photo and a voice recording. There are currently {gameState.availableMembers || 0} ready.
                Add them in Patient Profile, then come back to play.
              </p>
            </div>
          </div>
        );
      }

      if (gameState.currentMember) {
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Whose Voice Is It? • यह आवाज़ किसकी है?</h2>
                  <p className="text-sm text-gray-600 mt-1">Round {gameState.round} of {gameState.totalRounds} • Score: {gameState.score}</p>
                </div>
                <button onClick={exitGame} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <audio
                ref={voicePlayerRef}
                src={assetUrl(gameState.currentMember.voice)}
                onEnded={() => setIsVoicePlaying(false)}
              />

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center mb-8">
                <Volume2 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-4">Listen carefully, then choose the matching photo.</p>
                <button
                  onClick={toggleVoicePlayback}
                  disabled={gameState.answered}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 font-semibold"
                >
                  {isVoicePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isVoicePlaying ? 'Pause Voice' : 'Play Voice'}
                </button>
              </div>

              {!gameState.answered ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gameState.options.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleVoiceMatchAnswer(member.id)}
                      className="group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                    >
                      <img src={assetUrl(member.photo)} alt={`Photo of ${member.name}`} className="w-full aspect-square object-cover" />
                      <span className="block p-3 text-center font-semibold text-gray-900">{member.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  {gameState.correct ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-green-600 mb-2">That’s right!</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-3xl">😊</span></div>
                      <p className="text-2xl font-bold text-orange-600 mb-2">Good try!</p>
                    </>
                  )}
                  <p className="text-gray-700 mb-6">That was {gameState.currentMember.name}, {gameState.currentMember.relation}.</p>
                  <button onClick={nextVoiceMatchRound} className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                    {gameState.round < gameState.totalRounds ? 'Next Voice' : 'Complete Activity'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (currentGame === 'familiar-place' && gameState.needsSetup) {
      return (
        <SetupNeeded
          title="Familiar Place"
          icon={MapPin}
          message={`Find real photos of the places from ${firstName}'s life in Memory Finder, or add place photos to the Memory Library.`}
          link="/memory-finder"
          linkLabel="Open Memory Finder"
          onClose={exitGame}
        />
      );
    }

    if (currentGame === 'familiar-place' && gameState.place) {
      const { place, photoIndex } = gameState;
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Familiar Place</h2>
              <button onClick={exitGame} className="text-gray-400 hover:text-gray-600" aria-label="Close activity">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Place {gameState.round} of {gameState.totalRounds}
              {place.contentId ? ' • Photos from Google Maps via SerpApi' : ' • Photo from the family'}
            </p>

            <div className="relative mb-6">
              <img
                src={place.photos[photoIndex]}
                alt="A place to remember"
                className="w-full h-80 object-cover rounded-xl"
              />
              {place.photos.length > 1 && (
                <>
                  <button onClick={() => changePhoto(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => changePhoto(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                    {photoIndex + 1} / {place.photos.length}
                  </span>
                </>
              )}
            </div>

            {!gameState.answered ? (
              <>
                <p className="text-2xl text-center font-semibold text-gray-900 mb-5">Do you remember this place?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handlePlaceResponse(r.id)}
                      className={`p-5 border-2 border-gray-300 rounded-lg transition-colors font-medium text-lg ${r.style}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700 mb-1">This is {place.title}</p>
                {place.subtitle && <p className="text-gray-500">{place.subtitle}</p>}
                {place.description && <p className="text-gray-700 mt-2">{place.description}</p>}
                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">Talk about it together</p>
                  <p className="text-amber-900">"What do you remember about {place.title}? Who did you go there with?"</p>
                </div>
                <button
                  onClick={nextPlaceRound}
                  className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {gameState.round < gameState.totalRounds ? 'Next Place' : 'Complete Activity'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentGame === 'memory-story' && gameState.memories) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Memory Story</h2>
                <p className="text-gray-600">Tap these life events from earliest to latest</p>
              </div>
              <button onClick={exitGame} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Your Story ({gameState.userOrder.length}/{gameState.memories.length}):</h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-gray-300 rounded-lg">
                {gameState.userOrder.map((memory, idx) => (
                  <div key={memory.id} className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-medium">
                    {idx + 1}. {memory.title}
                  </div>
                ))}
              </div>
            </div>

            {!gameState.completed ? (
              <div className="grid grid-cols-2 gap-4">
                {gameState.shuffledMemories.map((memory) => {
                  const isSelected = gameState.userOrder.find(m => m.id === memory.id);
                  return (
                    <button
                      key={memory.id}
                      onClick={() => handleMemoryStorySelect(memory)}
                      disabled={isSelected}
                      className={`p-4 border-2 rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 text-lg">{memory.title}</p>
                      <p className="text-sm text-gray-600">{memory.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                {gameState.correct ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-green-600 mb-2">Wonderful! Perfect order!</p>
                    <p className="text-gray-600">You remembered the story correctly</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-2">Great effort!</p>
                    <p className="text-gray-600">Every memory shared is meaningful</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (currentGame && session.isOver) {
    return <SessionComplete name={firstName} onExtend={session.extend} />;
  }

  const gameView = currentGame ? renderGame() : null;
  if (gameView) {
    return (
      <div>
        <SessionBar session={session} />
        {gameView}
      </div>
    );
  }

  // Main activities list
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized Activities</h1>
        <p className="text-gray-600">These activities are built around {firstName}'s own memories</p>
      </div>

      {session.isOver ? (
        <div className="mb-8">
          <SessionComplete name={firstName} onExtend={session.extend} />
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-emerald-900 flex items-center gap-2">
            <Timer className="w-5 h-5" /> {formatClock(session.remaining)} left in today's 10-minute session
          </p>
          <p className="text-sm text-emerald-800">Short daily sessions keep activities enjoyable and avoid fatigue.</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          AI Memory Companion
        </h2>
        <p className="text-gray-700 mb-4">
          Based on {firstName}'s memory profile, we recommend activities using familiar faces, places, and experiences
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Family Recognition
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Assam Memories
          </span>
          <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
            Music Recall
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Bihu Traditions
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 ${getColorClass(game.color)} border rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
              <p className="text-gray-600 mb-3">{game.description}</p>
              {serpApiCounts[game.id] > 0 && (
                <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                  <Sparkles className="w-3.5 h-3.5" /> {serpApiCounts[game.id]} personal {game.id === 'complete-song' ? 'songs' : 'places'} via SerpApi
                </p>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{game.difficulty}</span>
                <span className="text-sm text-gray-500">{game.time}</span>
              </div>
              <button
                onClick={() => startGame(game.id)}
                disabled={session.isOver}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Start Activity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Activities;