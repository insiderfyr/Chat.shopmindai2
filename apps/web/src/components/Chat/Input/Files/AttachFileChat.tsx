import { memo } from 'react';
import { supportsFiles, mergeFileConfig, isAssistantsEndpoint, fileConfig as defaultFileConfig } from 'librechat-data-provider';
import type { EndpointFileConfig } from 'librechat-data-provider';
import { useGetFileConfig } from '~/data-provider';
import { useChatContext } from '~/Providers';
import AttachFile from './AttachFile';

function AttachFileChat({ disableInputs }: { disableInputs: boolean }) {
  const { conversation } = useChatContext();
  const { endpoint, endpointType } = conversation ?? { endpoint: null };

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const endpointFileConfig = fileConfig.endpoints[endpoint ?? ''] as EndpointFileConfig | undefined;
  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? endpoint ?? ''] ?? false;
  const isUploadDisabled = (disableInputs || endpointFileConfig?.disabled) ?? false;
  const canUpload = endpointSupportsFiles && !isUploadDisabled;

  if (!canUpload) {
    return null;
  }

  const isAssistants = isAssistantsEndpoint(endpoint);
  return <AttachFile disabled={disableInputs || !isAssistants} />;
}

export default memo(AttachFileChat);
