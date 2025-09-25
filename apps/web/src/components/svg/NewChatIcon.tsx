import { PenSquare } from 'lucide-react';
import { cn } from '~/utils';

export default function NewChatIcon({ className = '' }: { className?: string }) {
  return (
    <PenSquare
      aria-hidden={true}
      strokeWidth={1.75}
      className={cn('h-5 w-5 text-text-primary dark:text-white', className)}
    />
  );
}
