import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { useMemo } from 'react';

import { useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../api/api';

export function ActiveMessagesList() {
  const messageQuery = useQuery({
    queryKey: ['infoMessages'],
    queryFn: () => api.getAllInfoMessages(),
    onError: () => {
      window.location.href = '/';
    },
  });

  if (!messageQuery.data) return null;

  return (
    <ul>
      {messageQuery.data.map((infos) => (
        <InfoMessageCard key={infos.id} message={infos} />
      ))}
    </ul>
  );
}

function InfoMessageCard({ message }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => api.deleteInfoMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infoMessages'] });
    },
  });

  const deleteMessage = async () => {
    const confirm = window.confirm(
      t`Are you sure you want to delete this message?`,
    );
    if (confirm) {
      deleteMessageMutation.mutate(message.id);
    }
  };

  const start = useMemo(() => {
    return new Date(message.start).toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [message.start]);

  const end = useMemo(() => {
    return new Date(message.end).toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [message.end]);

  return (
    <li className="flex flex-col m-2 p-2 border-2 border-gray-300 rounded-md">
      <div className="flex justify-between">
        <span>
          {start} {'->'} {end}
        </span>
        <button type="button" onClick={deleteMessage} className="cursor-pointer">
          <DeleteOutlined className="" />
        </button>
      </div>
      <span className="flex gap-1">
        {t`Sender`}:<span>{message.sender}</span>
      </span>
      <span className="flex gap-1">
        {t`Recipients`}:<span>{message.recipients}</span>
      </span>
      <div className="h-[2px] bg-gray-300 my-2" />
      <span>{message.message}</span>
    </li>
  );
}
