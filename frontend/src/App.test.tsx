import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('Festiva AI Frontend Rendering', () => {
  it('renders landing page hero heading and brand name', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Festiva/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Plan Every Celebration/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan My Event/i)).toBeInTheDocument();
  });

  it('renders key navigation elements', () => {
    render(<App />);
    const inspirationLinks = screen.getAllByText(/Inspiration Studio/i);
    expect(inspirationLinks.length).toBeGreaterThan(0);

    const signInLinks = screen.getAllByText(/Sign In/i);
    expect(signInLinks.length).toBeGreaterThan(0);

    const getStartedButtons = screen.getAllByText(/Get Started Free/i);
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });
});
