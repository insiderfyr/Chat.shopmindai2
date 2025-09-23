import React, { useMemo, useCallback } from 'react';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import { EModelEndpoint, alternateName } from 'librechat-data-provider';
import type {
  Assistant,
  TEndpointsConfig,
  TAssistantsMap,
  TStartupConfig,
} from 'librechat-data-provider';
import type { Endpoint } from '~/common';
import { mapEndpoints, getIconKey, getEndpointField } from '~/utils';
import { useGetEndpointsQuery } from '~/data-provider';
import { useChatContext } from '~/Providers';
import { icons } from './Icons';

export const useEndpoints = ({
  assistantsMap,
  endpointsConfig,
  startupConfig,
}: {
  assistantsMap?: TAssistantsMap;
  endpointsConfig: TEndpointsConfig;
  startupConfig: TStartupConfig | undefined;
}) => {
  const modelsQuery = useGetModelsQuery();
  const { conversation } = useChatContext();
  const { data: endpoints = [] } = useGetEndpointsQuery({ select: mapEndpoints });
  const interfaceConfig = startupConfig?.interface ?? {};
  const includedEndpoints = useMemo(
    () => new Set(startupConfig?.modelSpecs?.addedEndpoints ?? []),
    [startupConfig?.modelSpecs?.addedEndpoints],
  );

  const { endpoint } = conversation ?? {};

  const assistants: Assistant[] = useMemo(
    () => Object.values(assistantsMap?.[EModelEndpoint.assistants] ?? {}),
    [endpoint, assistantsMap],
  );

  const azureAssistants: Assistant[] = useMemo(
    () => Object.values(assistantsMap?.[EModelEndpoint.azureAssistants] ?? {}),
    [endpoint, assistantsMap],
  );

  const filteredEndpoints = useMemo(() => {
    if (!interfaceConfig.modelSelect) {
      return [];
    }
    const result: EModelEndpoint[] = [];
    for (let i = 0; i < endpoints.length; i++) {
      if (includedEndpoints.size > 0 && !includedEndpoints.has(endpoints[i])) {
        continue;
      }
      result.push(endpoints[i]);
    }

    return result;
  }, [endpoints, includedEndpoints]);

  const endpointRequiresUserKey = useCallback(
    (ep: string) => {
      return !!getEndpointField(endpointsConfig, ep, 'userProvide');
    },
    [endpointsConfig],
  );

  const mappedEndpoints: Endpoint[] = useMemo(() => {
    return filteredEndpoints.map((ep) => {
      const endpointType = getEndpointField(endpointsConfig, ep, 'type');
      const iconKey = getIconKey({ endpoint: ep, endpointsConfig, endpointType });
      const Icon = icons[iconKey];
      const endpointIconURL = getEndpointField(endpointsConfig, ep, 'iconURL');
      const hasModels =
        (ep === EModelEndpoint.assistants && assistants?.length > 0) ||
        (ep !== EModelEndpoint.assistants && (modelsQuery.data?.[ep]?.length ?? 0) > 0);

      // Base result object with formatted default icon
      const result: Endpoint = {
        value: ep,
        label: alternateName[ep] || ep,
        hasModels,
        icon: Icon
          ? React.createElement(Icon, {
              size: 20,
              className: 'text-text-primary shrink-0 icon-md',
              iconURL: endpointIconURL,
              endpoint: ep,
            })
          : null,
      };

      if (ep === EModelEndpoint.assistants && assistants.length > 0) {
        result.models = assistants.map((assistant: { id: string }) => ({
          name: assistant.id,
          isGlobal: false,
        }));
        result.assistantNames = assistants.reduce(
          (acc: Record<string, string>, assistant: Assistant) => {
            acc[assistant.id] = assistant.name || '';
            return acc;
          },
          {},
        );
        result.modelIcons = assistants.reduce(
          (acc: Record<string, string | undefined>, assistant: Assistant) => {
            acc[assistant.id] = assistant.metadata?.avatar;
            return acc;
          },
          {},
        );
      } else if (ep === EModelEndpoint.azureAssistants && azureAssistants.length > 0) {
        result.models = azureAssistants.map((assistant: { id: string }) => ({
          name: assistant.id,
          isGlobal: false,
        }));
        result.assistantNames = azureAssistants.reduce(
          (acc: Record<string, string>, assistant: Assistant) => {
            acc[assistant.id] = assistant.name || '';
            return acc;
          },
          {},
        );
        result.modelIcons = azureAssistants.reduce(
          (acc: Record<string, string | undefined>, assistant: Assistant) => {
            acc[assistant.id] = assistant.metadata?.avatar;
            return acc;
          },
          {},
        );
      }

      // For other endpoints with models from the modelsQuery
      else if (ep !== EModelEndpoint.assistants && (modelsQuery.data?.[ep]?.length ?? 0) > 0) {
        result.models = modelsQuery.data?.[ep]?.map((model) => ({
          name: model,
          isGlobal: false,
        }));
      }

      return result;
    });
  }, [filteredEndpoints, endpointsConfig, modelsQuery.data, assistants, azureAssistants]);

  return {
    mappedEndpoints,
    endpointRequiresUserKey,
  };
};

export default useEndpoints;
