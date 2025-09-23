import React, { useMemo, useCallback } from 'react';
import { cn } from '~/utils';

interface MessageContainerProps {
  isCreatedByUser: boolean;
  children: React.ReactNode;
  subRowContent?: React.ReactNode;
  className?: string;
  showSubRow?: boolean;
  isSubmitting?: boolean;
  hasActions?: boolean;
  isCard?: boolean;
  messageId?: string;
  onSubRowClick?: () => void;
}

// CSS constants for reusability and performance
const MESSAGE_STYLES = {
  container: {
    user: 'flex flex-col gap-2 w-full',
    assistant: 'flex flex-col gap-1',
  },
  bubble: {
    user: 'relative flex flex-col ml-auto user-turn',
    assistant: 'relative flex flex-col assistant-turn',
  },
  subRow: {
    user: 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end',
    assistant: 'justify-start',
  },
} as const;

const MessageContainer = React.memo(
  ({
    isCreatedByUser,
    children,
    subRowContent,
    className = '',
    showSubRow = true,
    isSubmitting = false,
    hasActions = true,
    isCard = false,
    messageId,
    onSubRowClick,
  }: MessageContainerProps) => {
    const containerClasses = useMemo(() => {
      return cn(
        isCreatedByUser ? MESSAGE_STYLES.container.user : MESSAGE_STYLES.container.assistant,
        className,
      );
    }, [isCreatedByUser, className]);

    const bubbleClasses = useMemo(() => {
      return cn(MESSAGE_STYLES.bubble[isCreatedByUser ? 'user' : 'assistant']);
    }, [isCreatedByUser]);

    const subRowClasses = useMemo(() => {
      return cn(
        'mt-1 flex gap-3 empty:hidden lg:flex text-xs',
        MESSAGE_STYLES.subRow[isCreatedByUser ? 'user' : 'assistant'],
      );
    }, [isCreatedByUser]);

    const handleSubRowClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onSubRowClick?.();
      },
      [onSubRowClick],
    );

    // Don't show SubRow if explicitly disabled or if submitting
    const shouldShowSubRow = showSubRow && hasActions && !isSubmitting && subRowContent;

    // Accessibility attributes
    const subRowAriaLabel = useMemo(() => {
      return isCreatedByUser ? 'User message actions' : 'Assistant message actions';
    }, [isCreatedByUser]);

    return (
      <div className={containerClasses}>
        <div className={bubbleClasses}>{children}</div>

        {shouldShowSubRow && (
          <div
            className={subRowClasses}
            onClick={handleSubRowClick}
            role="toolbar"
            aria-label={subRowAriaLabel}
            data-message-id={messageId}
          >
            {subRowContent}
          </div>
        )}
      </div>
    );
  },
);

MessageContainer.displayName = 'MessageContainer';

export default MessageContainer;
