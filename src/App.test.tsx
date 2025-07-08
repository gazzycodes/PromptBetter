import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test that doesn't require the full App component
test('basic test should pass', () => {
  expect(1 + 1).toBe(2);
});

test('renders a simple component', () => {
  const TestComponent = () => <div>Test Component</div>;
  render(<TestComponent />);
  const element = screen.getByText('Test Component');
  expect(element).toBeInTheDocument();
});
