import React, { useMemo, useEffect, useRef } from 'react';
import { isAssistantsEndpoint, LocalStorageKeys } from 'librechat-data-provider';
import type * as t from 'librechat-data-provider';
import type { SelectedValues } from '~/common';
import useSetIndexOptions from '~/hooks/Conversations/useSetIndexOptions';

export default function useSelectorEffects({
  index = 0,
  conversation,
  assistantsMap,
  setSelectedValues,
}: {
  index?: number;
  assistantsMap: t.TAssistantsMap | undefined;
  conversation: t.TConversation | null;
  setSelectedValues: React.Dispatch<React.SetStateAction<SelectedValues>>;
}) {
  const { setOption } = useSetIndexOptions();
  const { assistant_id: selectedAssistantId = null, endpoint } = conversation ?? {};

  const assistants: t.Assistant[] = useMemo(() => {
    if (!isAssistantsEndpoint(endpoint)) {
      return [];
    }
    return Object.values(assistantsMap?.[endpoint ?? ''] ?? {}) as t.Assistant[];
  }, [assistantsMap, endpoint]);

  useEffect(() => {
    if (!isAssistantsEndpoint(endpoint as string)) {
      return;
    }
    if (selectedAssistantId == null && assistants.length > 0) {
      let assistant_id = localStorage.getItem(`${LocalStorageKeys.ASST_ID_PREFIX}${index}`);
      if (assistant_id == null) {
        assistant_id = assistants[0]?.id;
      }
      const assistant = assistantsMap?.[endpoint ?? '']?.[assistant_id];
      if (assistant !== undefined) {
        setOption('model')(assistant.model);
        setOption('assistant_id')(assistant_id);
      }
    }
  }, [index, assistants, selectedAssistantId, assistantsMap, endpoint, setOption]);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSetSelectedValues = (values: SelectedValues) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setSelectedValues(values);
    }, 150);
  };

  useEffect(() => {
    if (!conversation?.endpoint) {
      return;
    }
    if (conversation?.assistant_id || conversation?.model || conversation?.spec) {
      if (isAssistantsEndpoint(conversation?.endpoint)) {
        debouncedSetSelectedValues({
          endpoint: conversation.endpoint || '',
          model: conversation.assistant_id || '',
          modelSpec: conversation.spec || '',
        });
        return;
      }
      debouncedSetSelectedValues({
        endpoint: conversation.endpoint || '',
        model: conversation.model || '',
        modelSpec: conversation.spec || '',
      });
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    conversation?.spec,
    conversation?.model,
    conversation?.endpoint,
    conversation?.assistant_id,
  ]);
}
