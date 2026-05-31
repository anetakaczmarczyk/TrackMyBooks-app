import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '../../app/(user)/login/page';
import { useAuth } from "../../_context/AuthContext";

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };
  },
  usePathname() {
    return '/login';
  },
}));

vi.mock('../../_context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should allow entering credentials and submit the form successfully', async () => {
    const mockRefreshUser = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      logout: vi.fn(),
      refreshUser: mockRefreshUser,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText(/you@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /Sign in|log in|zaloguj/i });

    await userEvent.type(usernameInput, 'TestUser');
    await userEvent.type(passwordInput, 'SecurePassword123');
    
    await userEvent.click(submitButton);


    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/user/login'); 
    expect(calledOptions?.method).toBe('POST');
  });
});