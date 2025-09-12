import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface TypingAnimationConfig {
  baseDelay: number;
  spaceDelay: number;
  punctuationDelay: number;
  newlineDelay: number;
  codeDelay: number;
  mathDelay: number;
  breathingEffect: boolean;
  smartPausing: boolean;
  // 🚀 GENIUS ADDITIONS
  adaptiveSpeed: boolean;
  highRefreshRate: boolean;
  predictiveGrouping: boolean;
  smoothScrolling: boolean;
  microInteractions: boolean;
  emojiSupport: boolean;
}

interface TypingState {
  displayText: string;
  currentIndex: number;
  isTyping: boolean;
  isComplete: boolean;
  phase: 'pre-animation' | 'entrance' | 'typing' | 'completion' | 'settled';
}

// 🚀 GENIUS: Enhanced character classification for smarter timing
interface CharacterInfo {
  char: string;
  type: 'space' | 'punctuation' | 'newline' | 'code' | 'math' | 'regular' | 'emoji';
  delay: number;
  groupable: boolean;
  weight: number; // For emoji and special characters
}

const DEFAULT_CONFIG: TypingAnimationConfig = {
  baseDelay: 4, // 🚀 ChatGPT-level ultra-fast for buttery smooth feel
  spaceDelay: 1, // 🚀 Near-instant spaces
  punctuationDelay: 40, // 🚀 Half the pause for ChatGPT-like flow
  newlineDelay: 80, // 🚀 Smoother paragraph breaks
  codeDelay: 8, // 🚀 Faster code typing
  mathDelay: 12, // 🚀 Smoother math
  breathingEffect: true,
  smartPausing: true,
  // 🚀 GENIUS FEATURES
  adaptiveSpeed: true,
  highRefreshRate: true,
  predictiveGrouping: true,
  smoothScrolling: true,
  microInteractions: true,
  emojiSupport: true,
};

export const useTypingAnimation = (
  text: string,
  isStreaming: boolean,
  isComplete: boolean,
  config: Partial<TypingAnimationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<TypingState>({
    displayText: '',
    currentIndex: 0,
    isTyping: false,
    isComplete: false,
    phase: 'pre-animation',
  });

  // 🚀 GENIUS: Enhanced refs for ultra-smooth performance
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const userScrollingRef = useRef<boolean>(false);
  const windowFocusedRef = useRef<boolean>(true);
  const displayBufferRef = useRef<string>(''); // 🚀 Memory optimization
  const characterMapRef = useRef<CharacterInfo[]>([]); // 🚀 Predictive processing
  const refreshRateRef = useRef<number>(60); // 🚀 Dynamic refresh rate detection
  const performanceMetricsRef = useRef<{
    frameTime: number;
    jankCount: number;
    avgDelay: number;
    smoothness: number;
  }>({ frameTime: 16.67, jankCount: 0, avgDelay: 0, smoothness: 100 });

  // 🚀 GENIUS: Advanced refresh rate detection with multiple methods
  const detectRefreshRate = useCallback(() => {
    if (!finalConfig.highRefreshRate) return 60;
    
    // Method 1: requestAnimationFrame timing
    let lastTime = performance.now();
    let frameCount = 0;
    const samples: number[] = [];
    
    const testFrame = (currentTime: number) => {
      if (frameCount > 0) {
        const delta = currentTime - lastTime;
        if (delta > 0 && delta < 100) { // Filter out invalid samples
          samples.push(1000 / delta);
        }
      }
      lastTime = currentTime;
      frameCount++;
      
      if (frameCount < 15) { // More samples for accuracy
        requestAnimationFrame(testFrame);
      } else {
        const validSamples = samples.filter(s => s >= 30 && s <= 300);
        if (validSamples.length > 0) {
          const avgFps = validSamples.reduce((a, b) => a + b, 0) / validSamples.length;
          refreshRateRef.current = Math.round(avgFps);
          
          // 🚀 Update performance metrics
          performanceMetricsRef.current.frameTime = 1000 / refreshRateRef.current;
        }
      }
    };
    
    requestAnimationFrame(testFrame);
  }, [finalConfig.highRefreshRate]);

  // 🚀 GENIUS: Pre-analyze entire text for optimal character processing
  const analyzeText = useCallback((inputText: string): CharacterInfo[] => {
    const chars: CharacterInfo[] = [];
    const textLower = inputText.toLowerCase();
    
    // 🚀 Content-aware analysis
    const hasCode = textLower.includes('```') || textLower.includes('`');
    const hasMath = textLower.includes('$') || textLower.includes('\\');
    const isConversational = /\b(hi|hello|thanks|yes|no|ok|hey|good|great|awesome)\b/.test(textLower);
    const isTechnical = /\b(function|class|interface|async|await|import|export|const|let|var)\b/.test(textLower);
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(inputText);
    
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      const context = inputText.slice(Math.max(0, i - 10), i + 10);
      
      let type: CharacterInfo['type'] = 'regular';
      let delay = finalConfig.baseDelay;
      let groupable = true;
      let weight = 1;
      
      // 🚀 Enhanced character classification
      if (char === ' ') {
        type = 'space';
        delay = finalConfig.spaceDelay;
        weight = 0.5;
      } else if (/[.!?]/.test(char)) {
        type = 'punctuation';
        delay = finalConfig.punctuationDelay;
        groupable = false;
        weight = 1.2;
      } else if (char === '\n') {
        type = 'newline';
        delay = finalConfig.newlineDelay;
        groupable = false;
        weight = 1.5;
      } else if (/[,;:]/.test(char)) {
        type = 'punctuation';
        delay = 50;
        weight = 1.1;
      } else if (context.includes('```') || context.includes('`')) {
        type = 'code';
        delay = finalConfig.codeDelay;
        weight = 0.8;
      } else if (context.includes('$') || context.includes('\\')) {
        type = 'math';
        delay = finalConfig.mathDelay;
        weight = 1.3;
      } else if (finalConfig.emojiSupport && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(char)) {
        type = 'emoji';
        delay = finalConfig.baseDelay * 0.6; // Emojis appear faster
        weight = 1.4;
      }
      
      // 🚀 GENIUS: Adaptive speed based on content analysis
      if (finalConfig.adaptiveSpeed) {
        if (isConversational && type === 'regular') delay *= 0.7;
        if (isTechnical && type === 'regular') delay *= 1.1;
        if (hasCode && type === 'code') delay *= 0.8;
        if (hasMath && type === 'math') delay *= 1.2;
        if (hasEmojis && type === 'emoji') delay *= 0.5;
      }
      
      // 🚀 Natural variation with better randomness
      const variation = (Math.random() - 0.5) * 6; // More balanced randomness
      delay += variation;
      
      chars.push({ char, type, delay: Math.max(1, delay), groupable, weight });
    }
    
    return chars;
  }, [finalConfig]);

  // 🚀 GENIUS: ChatGPT-level intelligent character grouping for ultra-smooth flow
  const getOptimalGroup = useCallback((startIndex: number): number => {
    if (!finalConfig.predictiveGrouping) return 1;
    
    const chars = characterMapRef.current;
    if (startIndex >= chars.length) return 1;
    
    let groupSize = 1;
    const maxGroupSize = 8; // 🚀 Increased for ChatGPT-like smoothness
    
    // 🚀 Enhanced grouping logic for natural flow
    for (let i = startIndex; i < Math.min(startIndex + maxGroupSize, chars.length); i++) {
      const char = chars[i];
      
      // 🚀 Special handling for spaces - group them with adjacent text
      if (char.type === 'space') {
        groupSize++;
        continue;
      }
      
      // Stop grouping at punctuation or special characters (but not spaces)
      if (!char.groupable && char.type !== 'space') break;
      
      // 🚀 Group regular characters more aggressively for smoother flow
      const prevChar = chars[i - 1];
      if (prevChar && (char.type === 'regular' || char.type === 'space')) {
        groupSize++;
      } else {
        break;
      }
    }
    
    return Math.min(groupSize, maxGroupSize);
  }, [finalConfig.predictiveGrouping]);

  // 🚀 GENIUS: Ultra-smooth animation loop with dynamic frame rate
  const animateCharacters = useCallback(() => {
    if (!isStreaming || state.currentIndex >= text.length) {
      setState(prev => ({ ...prev, isTyping: false, isComplete: true, phase: 'completion' }));
      return;
    }

    const now = performance.now();
    
    // 🚀 Dynamic frame rate limiting based on display capabilities
    const targetFrameTime = 1000 / refreshRateRef.current;
    if (now - lastUpdateRef.current < targetFrameTime) {
      animationRef.current = requestAnimationFrame(animateCharacters);
      return;
    }

    // 🚀 Check if we should pause based on user activity
    if (isPausedRef.current || userScrollingRef.current || !windowFocusedRef.current) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animateCharacters);
      }, 80); // Reduced timeout for better responsiveness
      return;
    }

    lastUpdateRef.current = now;
    const chars = characterMapRef.current;
    
    // 🚀 Calculate optimal group size for this update
    const groupSize = getOptimalGroup(state.currentIndex);
    const nextIndex = Math.min(state.currentIndex + groupSize, text.length);
    
    // 🚀 GENIUS: Memory-optimized string building
    for (let i = state.currentIndex; i < nextIndex; i++) {
      displayBufferRef.current += chars[i]?.char || text[i] || '';
    }
    
    // 🚀 Batch state update for better performance
    setState(prev => ({
      ...prev,
      displayText: displayBufferRef.current,
      currentIndex: nextIndex,
      isTyping: nextIndex < text.length,
      phase: nextIndex < text.length ? 'typing' : 'completion',
    }));

    if (nextIndex < text.length) {
      // 🚀 Calculate delay based on character analysis
      const nextChar = chars[nextIndex];
      const delay = nextChar?.delay || finalConfig.baseDelay;
      
      // 🚀 Smooth timing without setTimeout stutters
      const targetTime = now + delay;
      
      const waitForNextFrame = () => {
        const currentTime = performance.now();
        if (currentTime >= targetTime) {
          animationRef.current = requestAnimationFrame(animateCharacters);
        } else {
          animationRef.current = requestAnimationFrame(waitForNextFrame);
        }
      };
      
      animationRef.current = requestAnimationFrame(waitForNextFrame);
    }
  }, [text, isStreaming, state.currentIndex, getOptimalGroup, finalConfig.baseDelay]);

  // 🚀 GENIUS: Enhanced user activity detection
  useEffect(() => {
    const handleScroll = () => {
      userScrollingRef.current = true;
      setTimeout(() => {
        userScrollingRef.current = false;
      }, 120); // Reduced timeout for better responsiveness
    };

    const handleVisibilityChange = () => {
      windowFocusedRef.current = !document.hidden;
    };

    const handleFocus = () => {
      windowFocusedRef.current = true;
    };

    const handleBlur = () => {
      windowFocusedRef.current = false;
    };

    if (finalConfig.smartPausing) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [finalConfig.smartPausing]);

  // 🚀 Enhanced animation lifecycle management
  useEffect(() => {
    if (isStreaming && text.length > 0 && state.phase === 'pre-animation') {
      // 🚀 Initialize optimizations
      detectRefreshRate();
      characterMapRef.current = analyzeText(text);
      displayBufferRef.current = '';
      startTimeRef.current = performance.now();
      
      setState(prev => ({ ...prev, phase: 'entrance' }));
      
      // Start entrance animation
      setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'typing' }));
        animationRef.current = requestAnimationFrame(animateCharacters);
      }, 150); // Reduced for snappier feel
    } else if (!isStreaming && text.length > 0) {
      // If not streaming, show full text immediately
      setState(prev => ({
        ...prev,
        displayText: text,
        isTyping: false,
        isComplete: true,
        phase: 'settled',
      }));
    }
  }, [isStreaming, text, state.phase, animateCharacters, analyzeText, detectRefreshRate]);

  // Reset animation when text changes
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    displayBufferRef.current = '';
    characterMapRef.current = [];
    
    setState({
      displayText: '',
      currentIndex: 0,
      isTyping: false,
      isComplete: false,
      phase: 'pre-animation',
    });
  }, [text, isStreaming]);

  // Handle completion with enhanced timing
  useEffect(() => {
    if (state.isComplete && state.phase === 'completion') {
      setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'settled' }));
      }, 600); // Optimized completion timing
    }
  }, [state.isComplete, state.phase]);

  // 🚀 Enhanced cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      displayBufferRef.current = '';
      characterMapRef.current = [];
    };
  }, []);

  // 🚀 Enhanced CSS classes with performance indicators
  const animationClasses = useMemo(() => {
    const classes = ['typing-animation'];
    
    // 🚀 Add performance class for high refresh rate displays
    if (refreshRateRef.current > 90) {
      classes.push('high-refresh-rate');
    }
    
    switch (state.phase) {
      case 'pre-animation':
        classes.push('pre-animation');
        break;
      case 'entrance':
        classes.push('entrance-animation');
        break;
      case 'typing':
        classes.push('typing-active');
        if (finalConfig.breathingEffect) {
          classes.push('breathing-effect');
        }
        // 🚀 Add content-aware classes
        if (characterMapRef.current.some(c => c.type === 'code')) {
          classes.push('has-code');
        }
        if (characterMapRef.current.some(c => c.type === 'math')) {
          classes.push('has-math');
        }
        if (characterMapRef.current.some(c => c.type === 'emoji')) {
          classes.push('has-emoji');
        }
        break;
      case 'completion':
        classes.push('completion-animation');
        break;
      case 'settled':
        classes.push('settled');
        break;
    }

    return classes.join(' ');
  }, [state.phase, finalConfig.breathingEffect]);

  return {
    displayText: state.displayText,
    isTyping: state.isTyping,
    isComplete: state.isComplete,
    phase: state.phase,
    animationClasses,
    progress: text.length > 0 ? state.currentIndex / text.length : 0,
    // 🚀 GENIUS: Additional performance metrics
    refreshRate: refreshRateRef.current,
    characterCount: characterMapRef.current.length,
    estimatedDuration: characterMapRef.current.reduce((total, char) => total + char.delay, 0),
    performanceMetrics: performanceMetricsRef.current,
  };
};

