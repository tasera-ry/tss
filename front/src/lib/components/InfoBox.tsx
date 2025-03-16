import api from '@/api/api';
import Close from '@mui/icons-material/Close';
import Alert from '@mui/lab/Alert';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

// TO DO: Take weekly and monthly values into account
export const InfoBox = ({ tabletMode = false }) => {
  const publicMessagesQuery = useQuery({
    queryKey: ['publicMessages'],
    queryFn: () => api.getPublicInfoMessages(),
  });

  const rangeMasterMessagesQuery = useQuery({
    queryKey: ['rangeMasterMessages'],
    queryFn: () => api.getRangeMasterInfoMessages(),
    enabled: tabletMode,
  });

  const messages = useMemo(() => {
    return rangeMasterMessagesQuery.data ?? publicMessagesQuery.data ?? [];
  }, [tabletMode, publicMessagesQuery.data, rangeMasterMessagesQuery.data]);

  if (messages.length === 0) return null;

  return messages.map((message) => (
    <InfoMessage key={message.id} message={message} />
  ));
};

function InfoMessage({ message }) {
  const severity = useMemo(() => {
    return message.level === 'error'
      ? 'error'
      : message.level === 'warning'
        ? 'warning'
        : 'info';
  }, [message.level]);

  // TO DO: Fix -> Visibility resets every time you reload / change page
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  // Compare start date of the message to the today's day and don't show it if start > today
  if (message.start > new Date().toISOString()) return null;

  return (
    <div className="text-center" data-testid="infoboxContainer">
      <div className="relative text-left inline-block max-w-[70%] min-w-[40%] word-break-break-word ml-auto mr-auto">
        <Close
          fontSize="small"
          className="absolute right-1 top-1 cursor-pointer"
          onClick={() => setVisible(false)}
        />
        <Alert severity={severity}>{message.message}</Alert>
      </div>
    </div>
  );
}
