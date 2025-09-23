import React, { useMemo, memo } from 'react';
import type { Assistant } from 'librechat-data-provider';
import type { TMessageIcon } from '~/common';
import { getEndpointField, getIconEndpoint, logger } from '~/utils';
import { useGetEndpointsQuery } from '~/data-provider';
import Icon from '~/components/Endpoints/Icon';

const MessageIcon = memo(
  ({ iconData, assistant }: { iconData?: TMessageIcon; assistant?: Assistant }) => {
    logger.log('icon_data', iconData, assistant);
    const { data: endpointsConfig } = useGetEndpointsQuery();

    const assistantName = useMemo(() => assistant?.name ?? '', [assistant]);
    const assistantAvatar = useMemo(() => assistant?.metadata?.avatar ?? '', [assistant]);

    const iconURL = iconData?.iconURL;
    const endpoint = useMemo(
      () => getIconEndpoint({ endpointsConfig, iconURL, endpoint: iconData?.endpoint }),
      [endpointsConfig, iconURL, iconData?.endpoint],
    );

    const endpointIconURL = useMemo(
      () => getEndpointField(endpointsConfig, endpoint, 'iconURL'),
      [endpointsConfig, endpoint],
    );

    const avatarURL = assistantAvatar || endpointIconURL;

    return (
      <Icon
        isCreatedByUser={iconData?.isCreatedByUser ?? false}
        endpoint={endpoint}
        iconURL={avatarURL}
        model={iconData?.model}
        assistantName={assistantName}
        size={28.8}
      />
    );
  },
);

MessageIcon.displayName = 'MessageIcon';

export default MessageIcon;
