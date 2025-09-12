import { useMemo } from 'react';
import { EModelEndpoint } from 'librechat-data-provider';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useGetEndpointsQuery, useGetStartupConfig } from '~/data-provider';
import { useLocalize, useAuthContext } from '~/hooks';
import { getIconEndpoint, getEntity } from '~/utils';
import LogoIcon from '~/components/svg/LogoIcon';

export default function Landing({ centerFormOnLanding }: { centerFormOnLanding: boolean }) {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { user } = useAuthContext();
  const localize = useLocalize();

  const endpointType = useMemo(() => {
    let ep = conversation?.endpoint ?? '';
    if (
      [
        EModelEndpoint.chatGPTBrowser,
        EModelEndpoint.azureOpenAI,
        EModelEndpoint.gptPlugins,
      ].includes(ep as EModelEndpoint)
    ) {
      ep = EModelEndpoint.openAI;
    }
    return getIconEndpoint({
      endpointsConfig,
      iconURL: conversation?.iconURL,
      endpoint: ep,
    });
  }, [conversation?.endpoint, conversation?.iconURL, endpointsConfig]);

  const { entity, isAgent, isAssistant } = getEntity({
    endpoint: endpointType,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  const description = (entity?.description || conversation?.greeting) ?? '';

  return (
    <div
      className={`-mt-16 flex h-full transform-gpu flex-col items-center justify-center pb-16 transition-all duration-200 ${centerFormOnLanding ? 'max-h-full sm:max-h-0' : 'max-h-full'}`}
    >
      <div className="flex flex-col items-center gap-0 p-2">
        {/* Logo + ShopMindAI - exact ca în pagina de login */}
        <div className="flex items-center justify-center gap-4">
          <LogoIcon size={64} className="text-[#4d8eff]" />
          <h1 className="text-4xl font-bold text-foreground">
            {localize('com_ui_shopmind')}
            <span className="text-[#4d8eff]">{localize('com_ui_ai')}</span>
          </h1>
        </div>

        {description && (
          <div className="animate-fadeIn mt-4 max-w-md text-center text-sm font-normal text-text-primary">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
