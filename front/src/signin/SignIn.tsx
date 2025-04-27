import { useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { Trans, useLingui } from '@lingui/react/macro';
import { useCookies } from 'react-cookie';
import { Link, useHistory } from 'react-router-dom';
import api from '../api/api';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

export function SignIn() {
  const { t } = useLingui();
  const [, setCookie] = useCookies(['id', 'username', 'role']);
  const history = useHistory();

  const [isError, setIsError] = useState(false);


  const signInMutation = useMutation({
    mutationFn: ({ username, password }: { username: string, password: string }) => {
      const secure = window.location.protocol === 'https:';
      return api.signIn(username, password, secure);
    },
    onSuccess: (user) => {
      const secure = window.location.protocol === 'https:';
      setCookie('username', user.name, { sameSite: true, secure });
      setCookie('role', user.role, { sameSite: true, secure });
      setCookie('id', user.id, { sameSite: true, secure });
      history.replace('/');
    },
    onError: () => {
      setIsError(true);
    },
  });

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <div className='relative p-8'>
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-1">
        <ArrowBackIcon />
        <Trans>Back</Trans>
      </Link>
      <div className="max-w-xs mx-auto">
        <div className="flex flex-col gap-2 items-center">
          <h1 className='text-2xl font-medium'>
            {t`Sign In`}
          </h1>
          <form
            noValidate
            className="w-full mt-2 flex flex-col gap-4"
            onSubmit={form.handleSubmit((data) => signInMutation.mutate(data))}
          >
            <div className='flex flex-col'>
              <TextField
                {...form.register('username')}
                autoFocus
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                name="username"
                label={t`Username`}
                autoComplete={t`Username`}
                error={isError}
                slotProps={{
                  inputLabel: {
                    shrink: form.watch('username') !== '',
                  },
                  htmlInput: {
                    'data-testid': 'nameField',
                  },
                }}
              />
              <TextField
                {...form.register('password')}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="password"
                name="password"
                label={t`Password`}
                type="password"
                autoComplete="current-password"
                error={isError}
                helperText={isError ? t`Wrong username or password` : ''}
                slotProps={{
                  inputLabel: {
                    shrink: form.watch('password') !== '',
                  },
                  htmlInput: {
                    'data-testid': 'passwordField',
                  },
                }}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                type='submit'
                fullWidth
                variant="contained"
                className="bg-sand!"
              >
                {t`Log in`}
              </Button>
              <Link
                to="/signin/reset-password"
                className="italic text-black mt-2"
              >
                {t`Forgot password?`}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
