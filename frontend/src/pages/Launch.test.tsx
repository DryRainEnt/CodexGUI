import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Launch from './Launch';
import { BrowserRouter } from 'react-router-dom';
import { validateApiKey } from '../api/endpoints';

// Mock API endpoint
vi.mock('../api/endpoints', () => ({
  validateApiKey: vi.fn()
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'launch.title': 'Welcome to CodexGUI',
        'launch.subtitle': 'Git repository analysis and LLM conversation logs',
        'launch.apiKeyInput': 'Enter your OpenAI API Key',
        'launch.apiKeyPlaceholder': 'sk-...',
        'launch.validateButton': 'Validate and Start',
        'launch.validatingMessage': 'Validating API key...',
        'launch.invalidKeyError': 'Invalid API key. Please check and try again.',
        'app.version': 'Web Edition v0.1.0'
      };
      return translations[key] || key;
    }
  })
}));

// Mock the Zustand store
vi.mock('../store/apiKeyStore', () => ({
  default: vi.fn(() => ({
    apiKey: null,
    isValidated: false,
    setApiKey: vi.fn(),
    setValidated: vi.fn()
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
    
    await waitFor(() => {
      expect(screen.getByText('Invalid API key. Please check and try again.')).toBeInTheDocument();
    });
  });

  it('handles successful validation', async () => {
    // Mock validateApiKey to resolve
    (validateApiKey as any).mockResolvedValueOnce({ valid: true });
    
    render(
      <BrowserRouter>
        <Launch />
      </BrowserRouter>
    );
    
    const input = screen.getByLabelText('Enter your OpenAI API Key');
    fireEvent.change(input, { target: { value: 'sk-validkey12345' } });
    
    const button = screen.getByText('Validate and Start');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(validateApiKey).toHaveBeenCalledWith('sk-validkey12345');
    });
  });
});
