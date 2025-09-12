import React, { memo, useMemo, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useChatContext } from '~/Providers';
import { cn } from '~/utils';
import store from '~/store';
import Markdown from './Markdown';
import MarkdownLite from './MarkdownLite';
import { useTypingAnimation } from '~/hooks/useTypingAnimation';
import { useTypingAnimationConfigSync } from '~/hooks/useTypingAnimationConfig';
import { debugTypingAnimation, logTypingDebug } from '~/utils/typingAnimationDebug';
import '~/utils/testTypingAnimation'; // Load test utilities
import './TypingAnimation.css';

interface CinematicTypingProps {
  text: string;
  isCreatedByUser: boolean;
  message: any;
  showCursor: boolean;
  className?: string;
}

const CinematicTyping = memo(({
  text,
  isCreatedByUser,
  message,
  showCursor,
  className = '',
}: CinematicTypingProps) => {
  const { isSubmitting, latestMessage } = useChatContext();
  const enableUserMsgMarkdown = useRecoilValue(store.enableUserMsgMarkdown);
  
  // 🚀 Get synchronized typing animation configuration
  const typingConfig = useTypingAnimationConfigSync();
  
  const showCursorState = useMemo(() => showCursor && isSubmitting, [showCursor, isSubmitting]);
  const isLatestMessage = useMemo(
    () => message.messageId === latestMessage?.messageId,
    [message.messageId, latestMessage?.messageId],
  );
  
  // 🚀 Debug typing animation (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('typing-debug') === 'true') {
      const debugInfo = debugTypingAnimation(
        isCreatedByUser,
        showCursor,
        isSubmitting,
        text,
        isLatestMessage,
        typingConfig
      );
      logTypingDebug(debugInfo, message.messageId || 'unknown');
    }
  }, [isCreatedByUser, showCursor, isSubmitting, text, isLatestMessage, typingConfig, message.messageId]);

  // Determine if this message should have cinematic typing
  const shouldAnimate = useMemo(() => {
    // 🚀 TEMPORARILY DISABLED for debugging - show messages immediately
    return false;
    
    // 🚀 Enhanced logic: animate during streaming OR for latest AI message (for testing)
    const isAIMessage = !isCreatedByUser;
    const hasContent = text.length > 0;
    const isActivelyStreaming = showCursorState;
    const isLatestAIMessage = isLatestMessage && isAIMessage;
    const forceAnimation = localStorage.getItem('force-typing-animation') === 'true';
    
    // Force animation for all AI messages when debugging
    if (forceAnimation && isAIMessage && hasContent) {
      return true;
    }
    
    return isAIMessage && hasContent && (isActivelyStreaming || isLatestAIMessage);
  }, [isCreatedByUser, showCursorState, text.length, isLatestMessage]);

  // 🚀 Use the enhanced typing animation hook with user configuration
  const {
    displayText,
    isTyping,
    isComplete,
    phase,
    animationClasses,
    progress,
    refreshRate,
    characterCount,
    estimatedDuration,
    performanceMetrics,
  } = useTypingAnimation(
    text,
    shouldAnimate,
    false, // isComplete parameter - will be managed by the hook
    {
      // 🚀 Use user configuration
      baseDelay: typingConfig.baseDelay,
      spaceDelay: typingConfig.spaceDelay,
      punctuationDelay: typingConfig.punctuationDelay,
      newlineDelay: typingConfig.newlineDelay,
      codeDelay: typingConfig.codeDelay,
      mathDelay: typingConfig.mathDelay,
      breathingEffect: typingConfig.breathingEffect,
      smartPausing: typingConfig.smartPausing,
      adaptiveSpeed: typingConfig.adaptiveSpeed,
      highRefreshRate: typingConfig.highRefreshRate,
      predictiveGrouping: typingConfig.predictiveGrouping,
      smoothScrolling: typingConfig.smoothScrolling,
      microInteractions: typingConfig.microInteractions,
      emojiSupport: typingConfig.emojiSupport,
    }
  );

  // Determine what text to display
  const finalText = useMemo(() => {
    if (isCreatedByUser) {
      return text; // User messages show immediately
    }
    
    if (shouldAnimate) {
      return displayText; // Animated text during typing
    }
    
    return text; // Complete text when not animating
  }, [isCreatedByUser, shouldAnimate, displayText, text]);

  // Create content based on message type
  const content = useMemo(() => {
    if (!isCreatedByUser) {
      return <Markdown content={finalText} isLatestMessage={isLatestMessage} />;
    } else if (enableUserMsgMarkdown) {
      return <MarkdownLite content={finalText} />;
    } else {
      return <>{finalText}</>;
    }
  }, [isCreatedByUser, enableUserMsgMarkdown, finalText, isLatestMessage]);

  // 🚀 Enhanced CSS classes with performance indicators and user preferences
  const containerClasses = useMemo(() => {
    const baseClasses = [
      'cinematic-typing-container',
      'relative',
      'transition-all',
      'duration-200',
      'ease-out',
    ];

    if (shouldAnimate) {
      baseClasses.push(animationClasses);
    }

    if (isTyping) {
      baseClasses.push('result-streaming');
    }

    if (isSubmitting) {
      baseClasses.push('submitting');
    }

    // 🚀 Add performance-based classes
    if (refreshRate > 90) {
      baseClasses.push('high-refresh-rate');
    }

    // 🚀 Add user preference classes
    if (typingConfig.highContrast) {
      baseClasses.push('high-contrast');
    }

    if (typingConfig.reduceMotion) {
      baseClasses.push('reduced-motion');
    }

    return cn(baseClasses, className);
  }, [shouldAnimate, animationClasses, isTyping, isSubmitting, className, refreshRate, typingConfig]);

  // 🚀 Enhanced progress indicator for long messages
  const showProgress = useMemo(() => {
    return shouldAnimate && text.length > 150 && progress > 0.05;
  }, [shouldAnimate, text.length, progress]);

  // 🚀 Performance metrics display (optional, for debugging)
  const showPerformanceMetrics = useMemo(() => {
    return shouldAnimate && process.env.NODE_ENV === 'development';
  }, [shouldAnimate]);

  // 🚀 Calculate typing speed for user feedback
  const typingSpeed = useMemo(() => {
    if (!shouldAnimate || !isTyping) return null;
    
    const charsPerSecond = Math.round((1000 / typingConfig.baseDelay) * 10) / 10;
    return `${charsPerSecond} chars/sec`;
  }, [shouldAnimate, isTyping, typingConfig.baseDelay]);

  return (
    <div className={containerClasses}>
      {/* 🚀 Enhanced progress indicator */}
      {showProgress && (
        <div 
          className="typing-progress"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      
      {/* 🚀 Performance metrics (development only) */}
      {showPerformanceMetrics && (
        <div className="absolute top-0 right-0 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded opacity-75 z-10">
          <div>{refreshRate}Hz</div>
          <div>{Math.round(performanceMetrics.smoothness)}% smooth</div>
          <div>{characterCount} chars</div>
          {typingSpeed && <div>{typingSpeed}</div>}
        </div>
      )}
      
      {/* Main content */}
      <div
        className={cn(
          'markdown prose message-content dark:prose-invert light w-full break-words',
          isCreatedByUser && !enableUserMsgMarkdown && 'whitespace-pre-wrap',
          isCreatedByUser ? 'dark:text-gray-20' : 'dark:text-gray-100',
          'transition-all duration-150 ease-out',
        )}
      >
        {content}
      </div>

      {/* 🚀 Enhanced micro-interactions overlay */}
      {shouldAnimate && typingConfig.microInteractions && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Hover effect area */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200" />
          
          {/* 🚀 Performance indicator line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      
      {/* 🚀 Typing speed indicator */}
      {shouldAnimate && isTyping && typingConfig.microInteractions && (
        <div className="absolute bottom-0 left-0 text-xs text-gray-400 opacity-60">
          {Math.round(progress * 100)}% complete
          {typingSpeed && ` • ${typingSpeed}`}
        </div>
      )}
      
      {/* 🚀 Accessibility indicator for screen readers */}
      {shouldAnimate && typingConfig.screenReaderSupport && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isTyping ? `Typing message: ${Math.round(progress * 100)}% complete` : 'Message complete'}
        </div>
      )}
    </div>
  );
});

CinematicTyping.displayName = 'CinematicTyping';

export default CinematicTyping;

