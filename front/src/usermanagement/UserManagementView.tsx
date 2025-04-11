import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useMemo } from 'react';
import 'react-nice-input-password/dist/react-nice-input-password.css';
import { useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCookies } from 'react-cookie';

import api from '@/api/api';
import { AddUserDialog } from '@/usermanagement/components/dialogs/AddUserDialog';
import { ChangeEmailSelfDialog } from '@/usermanagement/components/dialogs/ChangeEmailSelfDialog';
import { ChangePasswordSelfDialog } from '@/usermanagement/components/dialogs/ChangePasswordSelfDialog';
import { EditUserDialog } from '@/usermanagement/components/dialogs/EditUserDialog';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

function UserManagementView() {
  const { t } = useLingui();

  const [{ username }] = useCookies(['username']);

  const userListQuery = useQuery({
    queryKey: ['userList'],
    queryFn: async () => {
      const users = await api.getUsers();
      return Promise.all(
        users.map(async (user) => {
          if (user.role === 'rangeofficer') {
            const association = await api.getAssociation(user.id);
            const associationId = association[0].association_id;
            const associationName = users.find(
              (u) => u.id === associationId,
            )?.name;
            return {
              ...user,
              associationId,
              associationName,
            };
          }
          return {
            ...user,
            association: null,
          };
        }),
      );
    },
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  });

  const associationList = useMemo(() => {
    return (
      userListQuery.data?.filter((user) => user.role === 'association') ?? []
    );
  }, [userListQuery.data]);

  const currentUser = useMemo(() => {
    return userListQuery?.data?.find((user) => user.name === username);
  }, [userListQuery?.data, username]);

  return (
    <div className="relative p-4 flex flex-col gap-4">
      <Link
        to="/"
        className="absolute top-3 left-3 flex items-center gap-2 hover:scale-105"
      >
        <ArrowBackIcon />
        {t`Back`}
      </Link>

      <h1 className="text-2xl font-bold text-center">{t`User management`}</h1>
      <CurrentUserCard currentUser={currentUser} />

      <Table
        aria-label="table of users"
        className="w-full max-w-5xl bg-black-tint-05 rounded-lg border border-gray-200 mx-auto"
      >
        <TableHeader associationList={associationList} />
        <TableBody>
          {userListQuery?.data?.map((user) => (
            <UserRow user={user} associationList={associationList} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CurrentUserCard({ currentUser }) {
  const { t } = useLingui();

  const [{ username }] = useCookies(['username']);

  return (
    <div className="flex flex-col gap-4 rounded-lg p-4 bg-black-tint-05 border border-gray-200 max-w-md w-full mx-auto">
      <div className="flex flex-col items-center">
        <span>{t`You are logged in as:`}</span>
        <span className="font-bold">{username}</span>
      </div>
      <div className="flex gap-2">
        <ChangeEmailSelfDialog currentUser={currentUser} />
        <ChangePasswordSelfDialog currentUser={currentUser} />
      </div>
    </div>
  );
}

function TableHeader({ associationList }) {
  const { t } = useLingui();
  return (
    <TableHead>
      <TableRow>
        <TableCell align="left" className="text-nowrap font-bold">
          {t`User`}
        </TableCell>
        <TableCell
          align="left"
          className="max-lg:hidden! text-nowrap font-bold"
        >
          {t`Role`}
        </TableCell>
        <TableCell
          align="left"
          className="max-lg:hidden! text-nowrap font-bold"
        >
          {t`Association`}
        </TableCell>
        <TableCell
          align="right"
          className="max-lg:hidden! text-nowrap font-bold"
          style={{ color: '#f2f2f2' }}
        >
          {t`Edit`}
        </TableCell>
        <TableCell align="right" style={{ width: '100px' }}>
          <AddUserDialog associationList={associationList} />
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

function UserRow({ user, associationList }) {
  const { t } = useLingui();

  const roleLabel = useMemo(() => {
    const roleLabels = {
      rangeofficer: t`Range officer`,
      association: t`Association`,
      superuser: t`Superuser`,
    };
    return roleLabels[user.role] ?? user.role;
  }, [user.role]);

  return (
    <TableRow hover>
      <TableCell align="justify" component="th" scope="row">
        <div className="flex flex-col">
          <span>{user.name}</span>
          <span>{user.email}</span>
          <div className="lg:hidden">
            <span className="font-bold">{t`Role`}: </span>
            {roleLabel}
          </div>
          {user.role === 'rangeofficer' && (
            <span className="font-bold lg:hidden">
              {t`Association:`} {user.associationName}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell align="justify" className="max-lg:hidden!">
        {user.role}
      </TableCell>
      <TableCell className="max-lg:hidden!">
        {user.associationName ?? '-'}
      </TableCell>
      <TableCell className="max-lg:hidden!"></TableCell>
      <TableCell align="right">
        <EditUserDialog user={user} associationList={associationList} />
      </TableCell>
    </TableRow>
  );
}

export default UserManagementView;
