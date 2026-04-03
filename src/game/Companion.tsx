import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export type CompanionEmotion = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating';

const EMOTION_EMOJI: Record<CompanionEmotion, string> = {
  idle:        '🐉',
  happy:       '😊',
  excited:     '🤩',
  thinking:    '🤔',
  encouraging: '💪',
  celebrating: '🎉',
};

const MESSAGES: Record<CompanionEmotion, string[]> = {
  idle:        ['Ready to play!', "Let's go!", 'I believe in you!', 'Math is fun!'],
  happy:       ["You're doing great!", 'That was awesome!', 'Keep going!', 'Well done!'],
  excited:     ["You're on fire! 🔥", "That's amazing!", "You're a math hero!", 'Incredible!'],
  thinking:    ['You can do this!', 'Take your time…', 'Think carefully!', 'What do you think?'],
  encouraging: ['Try again! You got this!', "Don't give up!", 'Almost there!', 'Every try counts!'],
  celebrating: ['LEVEL UP! 🏆', 'You did it!', "Let's celebrate! 🎊", 'You are a STAR! ⭐'],
};

interface CompanionProps {
  emotion: CompanionEmotion;
  customMessage?: string | null;
}

export function Companion({ emotion, customMessage }: CompanionProps) {
  const [msg, setMsg] = useState<string>(() => MESSAGES.idle[0]);

  useEffect(() => {
    const pool = MESSAGES[emotion];
    setMsg(customMessage ?? pool[Math.floor(Math.random() * pool.length)]);
  }, [emotion, customMessage]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msg}
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="absolute bottom-full mb-1 bg-white border-2 border-black rounded-2xl px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap text-[11px] font-black text-gray-800 pointer-events-none"
        >
          {msg}
          {/* Bubble pointer */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 block w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black" />
          <span className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-white" />
        </motion.div>
      </AnimatePresence>

      {/* Character */}
      <motion.div
        animate={
          emotion === 'celebrating' || emotion === 'excited'
            ? { y: [0, -10, 0, -10, 0], scale: [1, 1.2, 1, 1.2, 1] }
            : emotion === 'thinking'
            ? { rotate: [-8, 8, -8, 8, 0] }
            : emotion === 'encouraging'
            ? { scale: [1, 1.12, 1, 1.12, 1] }
            : { y: [0, -5, 0] }           // idle gentle float
        }
        transition={{
          repeat: emotion === 'idle' ? Infinity : 0,
          duration: emotion === 'idle' ? 2.5 : 0.55,
          ease: 'easeInOut',
        }}
        className="text-4xl select-none cursor-default leading-none"
      >
        {EMOTION_EMOJI[emotion]}
      </motion.div>
    </div>
  );
}
