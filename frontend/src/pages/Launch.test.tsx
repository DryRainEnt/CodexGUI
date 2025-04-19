import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Launch from './Launch';
import { BrowserRouter } from 'react-router-dom';
import { validateApiKey } from '../api/endpoints';

// Mock window.matchMedia directly in this test file
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock API endpoint
vi.mock('../api/endpoints', () => ({
  validateApiKey: vi.fn(),
  getTokenUsage: vi.fn(),
  checkApiKeyStatus: vi.fn()
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock the Zustand store
vi.mock('../store/apiKeyStore', () => ({
  default: vi.fn(() => ({
    apiKey: null,
    isValidated: false,
    remainingTokens: null,
    setApiKey: vi.fn(),
    setValidated: vi.fn(),
    setRemainingTokens: vi.fn()
  }))
}));

describe('Launch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the launch screen correctly', () => {
    render(
      <BrowserRouter>
        <Launch />
      </BrowserRouter>
    );
    
    // Check if title is rendered
    expect(screen.getByText('Welcome to CodexGUI')).toBeInTheDocument();
    
    // Check if subtitle is rendered
    expect(screen.getByText('Git repository analysis and LLM conversation logs')).toBeInTheDocument();
    
    // Check if API key input field exists
    expect(screen.getByLabelText('Enter your OpenAI API Key')).toBeInTheDocument();
    
    // Check if validate button exists
    expect(screen.getByText('Validate and Start')).toBeInTheDocument();
  });

  it('displays error message when validation fails', async () => {
    // Mock validateApiKey to reject
    (validateApiKey as any).mockRejectedValueOnce(new Error('Invalid API key'));
    
    render(
      <BrowserRouter>
        <Launch />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText('Enter your OpenAI API Key');
    fireEvent.change(input, { target: { value: 'invalid-key' } });
    
    const button = screen.getByText('Validate and Start');
    fireEvent.click(button);
    
    // Use a more specific selector to find the error message
    await waitFor(() => {
      const errorElements = screen.getAllByText(/invalid api key/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('handles successful validation', async () => {
    // Mock validateApiKey to resolve
    (validateApiKey as any).mockResolvedValueOnce({ valid: true, message: 'API key is valid' });
    
    render(
      <BrowserRouter>
        <Launch />
      </BrowserRouter>
    );
    
    // Get input and enter valid key
    const input = screen.getByLabelText('Enter your OpenAI API Key');
    fireEvent.change(input, { target: { value: 'sk-validkey12345' } });
    
    // Clear all previous mock calls
    (validateApiKey as any).mockClear();
    
    // Click the validate button
    const button = screen.getByText('Validate and Start');
    fireEvent.click(button);
    
    // Wait for the mock to be called
    await waitFor(() => {
      expect(validateApiKey).toHaveBeenCalledWith('sk-validkey12345');
    }, { timeout: 3000 });
  });
});
