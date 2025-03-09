import { NewMessageForm } from "@/pages/InfoMessageManagementView/components/NewMessageForm";
import { ActiveMessagesList } from "@/pages/InfoMessageManagementView/components/ActiveMessagesList";
import { useLingui } from '@lingui/react/macro';

export function InfoMessageManagementView() {
  const { t } = useLingui();
  return (
    <div className="flex flex-col items-center">
    <div className="p-4 w-full lg:w-[800px] flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t`Add info`}</h1>
      <div className="flex lg:flex-row flex-col justify-between gap-2 w-full max-lg:divide-y-2 divide-gray-300">
        <NewMessageForm />
        <ActiveMessagesList />
      </div>
    </div>
  </div>
  )
}
