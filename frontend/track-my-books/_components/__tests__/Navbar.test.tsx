import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import {Navbar} from '../Navbar';
import { useAuth } from "../../_context/AuthContext";

vi.mock('../../_context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter() {
    return { prefetch: () => null, push: () => null };
  },
  usePathname() {
    return '/';
  },
}));

describe('Navbar Component', () => {
  it('should render Login and Register buttons when user is logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    const signupLink = screen.getByRole('link', { name: /reg|sign|up/i }); 
    expect(signupLink).toHaveAttribute('href', '/signup');
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it('should render name and "My Library" button when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { name: 'Ania Kowalska' } as any,
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Navbar />);

    expect(screen.getByText(/Ania/i)).toBeInTheDocument();
    expect(screen.getByText(/My Library/i)).toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });
});