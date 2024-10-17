import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import UserManagementView from './UserManagementView';
import testUtils from '../_TestUtils/TestUtils';
import * as utils from '../utils/Utils';

// Mock validateLogin before your tests
jest.mock('../utils/Utils', () => ({
  ...jest.requireActual('../utils/Utils'),
  validateLogin: jest.fn(),
}));

global.fetch = jest.fn((url, ops) => {
  if (ops.method === 'GET') {
    return Promise.resolve({
      json: () => Promise.resolve(testUtils.users),
    });
  }
  if (ops.method === 'DELETE') {
    return Promise.resolve({
      json: () => Promise.resolve({ ok: true }),
    });
  }
  return null;
});

describe('testing UserManagementView', () => {
  beforeEach(() => {
    // Mock validateLogin to resolve to true (or false, depending on your test case)
    utils.validateLogin.mockResolvedValue(true);

    // Optionally mock getUsers if necessary
    utils.getUsers = jest.fn().mockResolvedValue([{ id: 2, name: 'Alice' }, { id: 3, name: 'Bob' }]);
  });

  it('should render UserManagementView', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1'); // eslint-disable-line no-undef
    await act(async () => {
      render(
        <Router>
          <UserManagementView history={history} />
        </Router>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText('User management')).toBeInTheDocument(),
    );
  });

  it('should delete users', async () => {
    const history = createMemoryHistory();
    localStorage.setItem('language', '1'); // eslint-disable-line no-undef
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/user')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ id: 2, name: 'Alice' }]),
        });
      }
      return null;
    });
    await act(async () => {
      render(
        <Router>
          <UserManagementView history={history} />
        </Router>,
      );
    });
    await waitFor(() =>
      expect(screen.getByText('Alice', { exact: false })).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByTestId('del-2')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('del-2'));
    await waitFor(() =>
      expect(screen.getByText('Are you sure?')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText('Confirm')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/user/2', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      }),
    );
  });
  // TODO
  // it('should change own password', async () => {

  // });

  // it('should change user password', async () => {

  // });

  // it('should create new users', async () => {

  // });
});
