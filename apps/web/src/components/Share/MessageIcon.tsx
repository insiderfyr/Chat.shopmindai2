import { useMemo } from 'react';
import type { TMessage, Assistant } from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import MessageEndpointIcon from '../Endpoints/MessageEndpointIcon';
import { getIconEndpoint } from '~/utils';
import { UserIcon } from '../svg';

export default function MessageIcon(
  props: Pick<TMessageProps, 'message' | 'conversation'> & {
    assistant?: false | Assistant;
  },
) {
  const { message, conversation, assistant } = props;

  const messageSettings = useMemo(
    () => ({
      ...(conversation ?? {}),
      ...({
        ...message,
        iconURL: message?.iconURL ?? '',
      } as TMessage),
    }),
    [conversation, message],
  );

  const iconURL = messageSettings.iconURL ?? '';
  let endpoint = messageSettings.endpoint;
  endpoint = getIconEndpoint({ endpointsConfig: undefined, iconURL, endpoint });
  const assistantName = assistant?.name ?? '';
  const assistantAvatar = assistant?.metadata?.avatar ?? '';

  const avatarURL = useMemo(() => {
    if (assistant) {
      return assistantAvatar;
    }
    return '';
  }, [assistant, assistantAvatar]);

  if (message?.isCreatedByUser === true) {
    return (
      <div
        style={{
          backgroundColor: 'rgb(121, 137, 255)',
          width: '20px',
          height: '20px',
          boxShadow: 'rgba(240, 246, 252, 0.1) 0px 0px 0px 1px',
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-sm p-1 text-white"
      >
        <UserIcon />
      </div>
    );
  }

  return (
    <MessageEndpointIcon
      {...messageSettings}
      endpoint={endpoint}
      iconURL={avatarURL}
      model={message?.model ?? conversation?.model}
      assistantName={assistantName}
      size={28.8}
    />
  );
}
