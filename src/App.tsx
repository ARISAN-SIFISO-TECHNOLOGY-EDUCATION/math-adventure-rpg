/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import Animated, { useSharedValue, withSequence, withTiming, useAnimatedStyle, FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Sword, Shield, Heart, Star, Trophy, RefreshCw, Zap, ChevronRight, Volume2, VolumeX } from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { GameState, Monster, MONSTERS } from './utils/gameState';
import { generateProblem, Problem } from './utils/mathGenerator';
import { generateParentalProblem } from './utils/parentalProblem';

// --- Audio Constants ---
const SOUNDS = {
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  ATTACK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  VICTORY: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  GAMEOVER: 'https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3',
  BGM: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3', // Adventurous loop
  GATE_OPEN: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
};

// --- Components ---

const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming((current / max) * 100, { duration: 500 });
  }, [current, max]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-800">
      <Animated.View
        style={animatedStyle}
        className={`h-full ${color}`}
      />
    </View>
  );
};

const ParentalGate = ({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) => {
  const [problem] = useState(generateParentalProblem());
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (parseInt(input) === problem.answer) {
      onPass();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 500);
    }
  };

  const shakeOffset = useSharedValue(0);
  useEffect(() => {
    if (error) {
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
    >
      <Animated.View 
        entering={ZoomIn}
        style={animatedStyle}
        className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-2xl border-4 border-sky-400"
      >
        <View className="w-16 h-16 bg-sky-100 rounded-full items-center justify-center mb-4">
          <Shield className="text-sky-600" size={32} />
        </View>
        <Text className="text-2xl font-black text-gray-800 mb-2 uppercase">Parental Gate</Text>
        <Text className="text-gray-500 mb-6 text-sm text-center">Please solve this problem to continue. This is for parents only!</Text>
        
        <View className="bg-gray-50 rounded-2xl py-6 mb-6 border-2 border-dashed border-gray-200 w-full items-center">
          <Text className="text-4xl font-black text-sky-600">{problem.question}</Text>
        </View>

        <TextInput
          autoFocus
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
          placeholder="Answer"
          className={`w-full text-center text-2xl font-black p-4 rounded-xl border-4 mb-4 outline-none transition-all ${
            error ? 'border-red-500' : 'border-sky-200 focus:border-sky-400'
          }`}
        />
        <View className="flex-row gap-3 w-full">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
          >
            <Text className="text-gray-600 font-bold">CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-1 bg-sky-500 py-3 rounded-xl items-center shadow-lg"
          >
            <Text className="text-white font-black">VERIFY</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG'; value: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWorld2Unlocked, setIsWorld2Unlocked] = useState(false);
  const [showGate, setShowGate] = useState<{ active: boolean; action: () => void }>({ active: false, action: () => {} });

  // Audio Refs
  const soundsRef = useRef<{ [key: string]: Audio.Sound }>({});

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const loadedSounds: { [key: string]: Audio.Sound } = {};
        for (const [key, url] of Object.entries(SOUNDS)) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false, isLooping: key === 'BGM', volume: key === 'BGM' ? 0.4 : 1.0 }
          );
          loadedSounds[key] = sound;
        }
        soundsRef.current = loadedSounds;
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    };

    loadSounds();

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        sound.unloadAsync();
      });
    };
  }, []);

  // Handle BGM Play/Pause based on mute state
  useEffect(() => {
    const updateBgm = async () => {
      const bgm = soundsRef.current['BGM'];
      if (!bgm) return;
      
      if (isMuted || gameState === 'START') {
        await bgm.pauseAsync();
      } else {
        await bgm.playAsync();
      }
    };
    updateBgm();
  }, [isMuted, gameState]);

  const playSound = async (key: keyof typeof SOUNDS) => {
    if (isMuted) return;
    const sound = soundsRef.current[key];
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        // Fallback if replay fails
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    }
  };

  const startBattle = useCallback(() => {
    const m = MONSTERS[Math.min(level - 1, MONSTERS.length - 1)];
    setMonster({ ...m });
    setProblem(generateProblem(level));
    setGameState('BATTLE');
    setPlayerHp(100);
    
    // Start BGM on first interaction
    if (bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(() => {});
    }
  }, [level, isMuted]);

  const triggerParentalGate = (action: () => void) => {
    playSound('GATE_OPEN');
    setShowGate({ active: true, action });
  };

  const handlePurchaseWorld2 = () => {
    // Mock IAP flow
    const confirmed = window.confirm("Unlock World 2 for $1.99? (Mock IAP)");
    if (confirmed) {
      setIsWorld2Unlocked(true);
      alert("World 2 Unlocked! Adventure awaits!");
    }
    setShowGate({ active: false, action: () => {} });
  };

  const handleAnswer = (choice: number) => {
    if (!problem || !monster) return;

    if (choice === problem.answer) {
      // Correct!
      playSound('CORRECT');
      setFeedback({ type: 'CORRECT', value: 'Great Job!' });
      const newMonsterHp = Math.max(0, monster.hp - 20);
      setMonster({ ...monster, hp: newMonsterHp });

      if (newMonsterHp === 0) {
        setTimeout(() => {
          playSound('VICTORY');
          setXp(prev => prev + 50);
          if (xp + 50 >= level * 100) {
            setLevel(prev => prev + 1);
          }
          setGameState('VICTORY');
          setFeedback(null);
        }, 1000);
      } else {
        setTimeout(() => {
          setProblem(generateProblem(level));
          setFeedback(null);
        }, 1000);
      }
    } else {
      // Wrong!
      playSound('WRONG');
      setTimeout(() => playSound('ATTACK'), 300); // Monster attacks shortly after
      setFeedback({ type: 'WRONG', value: 'Oops! Try again.' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      const newPlayerHp = Math.max(0, playerHp - 15);
      setPlayerHp(newPlayerHp);

      if (newPlayerHp === 0) {
        setTimeout(() => {
          playSound('GAMEOVER');
          setGameState('GAMEOVER');
        }, 1000);
      } else {
        setTimeout(() => {
          setProblem(generateProblem(level));
          setFeedback(null);
        }, 1000);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-sky-100">
        <View className="flex-1 items-center p-4 overflow-hidden">
          {showGate.active && (
            <ParentalGate 
              onPass={showGate.action} 
              onCancel={() => setShowGate({ active: false, action: () => {} })} 
            />
          )}

          {/* HUD */}
          <View className="w-full max-w-md flex-row justify-between items-center mb-8 bg-white/80 p-4 rounded-2xl shadow-lg border-b-4 border-sky-200 z-20">
            <View className="flex-row items-center gap-2">
              <View className="bg-yellow-400 p-2 rounded-lg border-2 border-yellow-600">
                <Star className="text-white fill-white" size={20} />
              </View>
              <View>
                <Text className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Level</Text>
                <Text className="text-xl font-black leading-none">{level}</Text>
              </View>
            </View>
            <View className="flex-1 mx-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-[10px] font-bold uppercase text-sky-600">XP</Text>
                <Text className="text-[10px] font-bold uppercase text-sky-600">{xp} / {level * 100}</Text>
              </View>
              <ProgressBar current={xp} max={level * 100} color="bg-sky-400" />
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => triggerParentalGate(() => Alert.alert("Settings", "Settings Opened!"))}
                className="p-2 bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-600"
              >
                <Shield size={20} color="#4b5563" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsMuted(!isMuted)}
                className="p-2 bg-sky-50 rounded-lg border-2 border-sky-200 text-sky-600"
              >
                {isMuted ? <VolumeX size={20} color="#0284c7" /> : <Volume2 size={20} color="#0284c7" />}
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 w-full max-w-md items-center justify-center relative">
            {/* Game States */}
          {gameState === 'START' && (
            <Animated.View
              key="start"
              entering={FadeIn}
              exiting={FadeOut}
              className="items-center"
            >
              <View className="mb-8 relative">
                <Animated.Text
                  entering={ZoomIn}
                  className="text-9xl"
                >
                  ⚔️
                </Animated.Text>
                <View className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-xl border-2 border-sky-400">
                  <Text className="text-2xl font-black text-sky-600 whitespace-nowrap uppercase tracking-tighter">Math Adventure</Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-8 max-w-[280px] text-center font-medium">Defeat monsters by solving math problems to save the kingdom!</Text>
              <TouchableOpacity
                onPress={() => setGameState('MAP')}
                className="bg-sky-500 px-12 py-4 rounded-2xl shadow-lg flex-row items-center gap-3"
              >
                <Text className="text-white text-2xl font-black">ENTER WORLD</Text>
                <ChevronRight color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {gameState === 'MAP' && (
            <Animated.View
              key="map"
              entering={FadeIn}
              className="w-full gap-6"
            >
              <View className="items-center mb-4">
                <Text className="text-3xl font-black text-gray-800 uppercase italic">World Map</Text>
                <Text className="text-sky-600 font-bold">Select your destination</Text>
              </View>

              {/* World 1 */}
              <TouchableOpacity
                onPress={startBattle}
                className="bg-white p-6 rounded-3xl shadow-xl border-4 border-green-400 flex-row items-center gap-6"
              >
                <Text className="text-5xl bg-green-50 p-4 rounded-2xl">🌲</Text>
                <View className="flex-1">
                  <Text className="text-xl font-black text-gray-800">GREEN FOREST</Text>
                  <Text className="text-sm text-gray-500 font-bold">World 1 (Free)</Text>
                </View>
                <ChevronRight color="#4ade80" />
              </TouchableOpacity>

              {/* World 2 (Locked) */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => !isWorld2Unlocked && triggerParentalGate(handlePurchaseWorld2)}
                  className={`w-full p-6 rounded-3xl shadow-xl border-4 flex-row items-center gap-6 ${
                    isWorld2Unlocked ? 'bg-white border-red-400' : 'bg-gray-100 border-gray-300 opacity-80'
                  }`}
                >
                  <Text className="text-5xl bg-gray-50 p-4 rounded-2xl">{isWorld2Unlocked ? '🔥' : '🔒'}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-gray-800">FIRE MOUNTAIN</Text>
                    <Text className="text-sm text-gray-500 font-bold">
                      {isWorld2Unlocked ? 'World 2 (Unlocked)' : 'World 2 (Locked)'}
                    </Text>
                  </View>
                  {!isWorld2Unlocked && (
                    <View className="bg-yellow-400 px-2 py-1 rounded-full">
                      <Text className="text-white text-[10px] font-black">$1.99</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setGameState('START')}
                className="items-center mt-4"
              >
                <Text className="text-sky-500 font-black uppercase text-sm tracking-widest">← Back to Menu</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {gameState === 'BATTLE' && monster && (
            <Animated.View
              key="battle"
              entering={FadeIn}
              className="w-full items-center"
            >
              {/* Monster Area */}
              <View className="w-full items-center mb-12">
                <Animated.View
                  entering={ZoomIn}
                  className={`w-48 h-48 rounded-full items-center justify-center shadow-2xl border-8 border-white ${monster.color}`}
                >
                  <Text className="text-8xl">{monster.image}</Text>
                </Animated.View>
                <View className="mt-4 w-full max-w-[200px]">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-black uppercase text-gray-700">{monster.name}</Text>
                    <Text className="text-xs font-black text-red-500">{monster.hp} HP</Text>
                  </View>
                  <ProgressBar current={monster.hp} max={monster.maxHp} color="bg-red-500" />
                </View>
              </View>

              {/* Player HP */}
              <View className="absolute top-0 left-0 flex-row items-center gap-2 bg-white/50 p-2 rounded-xl">
                <Heart className="text-red-500 fill-red-500" size={16} color="#ef4444" />
                <View className="w-24">
                  <ProgressBar current={playerHp} max={100} color="bg-green-500" />
                </View>
              </View>

              {/* Problem Area */}
              <View className="w-full bg-white rounded-3xl p-6 shadow-2xl border-4 border-sky-200 relative overflow-hidden">
                {feedback && (
                  <Animated.View
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    className={`absolute inset-0 z-10 items-center justify-center ${
                      feedback.type === 'CORRECT' ? 'bg-green-500/90' : 'bg-red-500/90'
                    }`}
                  >
                    <Text className="text-2xl font-black text-white">{feedback.value}</Text>
                  </Animated.View>
                )}

                <View className="items-center mb-8">
                  <Text className="text-sky-400 font-bold uppercase tracking-widest text-sm mb-2">Solve this!</Text>
                  <Text className="text-6xl font-black text-gray-800">{problem?.question}</Text>
                </View>

                <View className="flex-row flex-wrap gap-4 justify-center">
                  {problem?.options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleAnswer(opt)}
                      disabled={!!feedback}
                      className="bg-sky-50 border-2 border-sky-200 w-[45%] py-4 rounded-2xl items-center"
                    >
                      <Text className="text-3xl font-black text-sky-600">{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {gameState === 'VICTORY' && (
            <Animated.View
              key="victory"
              entering={ZoomIn}
              className="items-center"
            >
              <View className="w-32 h-32 bg-yellow-400 rounded-full items-center justify-center mb-6 shadow-xl border-4 border-white">
                <Trophy className="text-white" size={64} color="white" />
              </View>
              <Text className="text-4xl font-black text-gray-800 mb-2 italic uppercase">Victory!</Text>
              <Text className="text-gray-600 mb-8 font-medium text-center">You gained 50 XP and saved the area!</Text>
              <TouchableOpacity
                onPress={() => setGameState('MAP')}
                className="bg-green-500 px-12 py-4 rounded-2xl shadow-lg flex-row items-center gap-3"
              >
                <Text className="text-white text-xl font-black">RETURN TO MAP</Text>
                <Zap color="white" fill="white" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {gameState === 'GAMEOVER' && (
            <Animated.View
              key="gameover"
              entering={ZoomIn}
              className="items-center"
            >
              <View className="w-32 h-32 bg-red-500 rounded-full items-center justify-center mb-6 shadow-xl border-4 border-white">
                <Shield className="text-white" size={64} color="white" />
              </View>
              <Text className="text-4xl font-black text-gray-800 mb-2 uppercase">Oh No!</Text>
              <Text className="text-gray-600 mb-8 font-medium text-center">The monster was too strong this time.</Text>
              <TouchableOpacity
                onPress={() => setGameState('MAP')}
                className="bg-sky-500 px-12 py-4 rounded-2xl shadow-lg flex-row items-center gap-3"
              >
                <Text className="text-white text-xl font-black">TRY AGAIN</Text>
                <RefreshCw color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}
          </View>
        </View>
      </SafeAreaView>
      <View className="absolute bottom-4 w-full items-center">
        <Text className="text-sky-400 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
          Math Adventure RPG v1.1 • Kid-Safe Edition
        </Text>
      </View>
    </SafeAreaProvider>
  );
}
