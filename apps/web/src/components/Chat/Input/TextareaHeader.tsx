import AddedConvo from './AddedConvo';
import type { TConversation } from 'librechat-data-provider';
import type { SetterOrUpdater } from 'recoil';
import { cn } from '~/utils';

export default function TextareaHeader({
  addedConvo,
  setAddedConvo,
  isTemporary,
}: {
  addedConvo: TConversation | null;
  setAddedConvo: SetterOrUpdater<TConversation | null>;
  isTemporary: boolean;
}) {
  if (!addedConvo) {
    return null;
  }
  return (
    <div
      className={cn(
        'm-1.5 flex flex-col divide-y overflow-hidden rounded-b-lg rounded-t-2xl',
        isTemporary ? 'bg-transparent dark:bg-transparent' : 'bg-surface-secondary-alt',
      )}
    >
      <AddedConvo addedConvo={addedConvo} setAddedConvo={setAddedConvo} />
    </div>
  );
}
