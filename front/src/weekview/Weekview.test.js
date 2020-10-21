import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import {
  waitFor,
  render,
	screen
} from '@testing-library/react'
import Weekview from './Weekview'
import { HashRouter as Router } from "react-router-dom"
import { createMemoryHistory } from 'history'

describe('testing weekview', () => {
  it('should render correct week', async () => {
    const state = {
      state: 'loading',
      date: new Date(1603093800000),
      weekNro: 0,
      dayNro: 0,
      yearNro: 0,
    };
    const date = new Date('1603093800000')
    const history = createMemoryHistory()

    localStorage.setItem('language', '1');
    render(
      <Router>
        <Weekview 
          match={{params: { date: date }}} 
          history={history} 
          state={state} />
      </Router>
    )

    await waitFor(() =>
      expect(screen.getByText("Week 43 , 2020"))
        .toBeInTheDocument()
    );
  })
})