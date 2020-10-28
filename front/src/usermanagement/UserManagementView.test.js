import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import {
  waitFor,
  render,
  screen,
} from '@testing-library/react'
import UserManagementView from './UserManagementView'
import { HashRouter as Router } from "react-router-dom"
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils';


describe('testing UserManagementView', () => {
  it('should render UserManagementView', async () => {
    const history = createMemoryHistory()
    localStorage.setItem('language', '1');
    await act(async () => {
      render(
        <Router>
          <UserManagementView 
            history={history} 
            />
        </Router>
      )
    })
    await waitFor(() =>
      expect(screen.getByText('User management'))
       .toBeInTheDocument()
    );
  })
})