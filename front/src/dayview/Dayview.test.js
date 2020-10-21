import React from 'react';
import Dayview from './Dayview'
import { HashRouter as Router } from "react-router-dom";
import { createMemoryHistory } from 'history'
import '@testing-library/jest-dom/extend-expect'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import * as utils from '../utils/Utils';

describe('testing Dayview component', () => {
  it('should render Dayview', async () => {
    const history = createMemoryHistory()
    const date = new Date('1603093800000')
    render(
    <Router>
      <Dayview
        history={history} 
        match={{params: { date: date }}} />
      </Router>
    );
    screen.debug()
    await waitFor( () =>
      expect(screen.getByText("Keskiviikko"))
        .toBeInTheDocument()
    );
  });
});