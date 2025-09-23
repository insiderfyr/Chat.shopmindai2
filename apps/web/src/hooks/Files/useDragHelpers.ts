import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import type { DropTargetMonitor } from 'react-dnd';
import useFileHandling from './useFileHandling';

export default function useDragHelpers() {
  const { handleFiles } = useFileHandling({});

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        handleFiles(item.files);
      },
      canDrop: () => true,
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [handleFiles],
  );

  return {
    canDrop,
    isOver,
    drop,
  };
}
