import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * A smoke test, not a thorough one: it asserts the tree renders far enough to
 * reach the last section on the page. It replaces the create-react-app
 * boilerplate, which looked for a "learn react" link that stopped existing the
 * moment this template was made into a portfolio.
 */
test('renders the page through to the contact section', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /contact me/i })).toBeInTheDocument();
});
