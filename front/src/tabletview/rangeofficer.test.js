import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import {
  waitFor,
  render,
  screen,
} from '@testing-library/react'
import Tabletview from './rangeofficer'
import { HashRouter as Router } from "react-router-dom"
import { createMemoryHistory } from 'history'
import * as utils from '../utils/Utils'
import { act } from 'react-dom/test-utils';


describe('testing rangeofficer', () => {
  it('should render Tabletview', async () => {
    localStorage.setItem('language', '1');
    await act(async () => {
      render(
        <Router>
          <Tabletview  />
        </Router>
      )
    })
    await waitFor(() =>
      expect(screen.getByText('Define range officer status by choosing color'))
       .toBeInTheDocument()
    );
  })
  // gets tracks, correct track officer status, correct range officer statue
})