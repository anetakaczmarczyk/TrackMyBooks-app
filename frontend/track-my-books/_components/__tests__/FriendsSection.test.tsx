import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FriendsPage from '../../app/(user)/friends/page'; 
import { useAuth } from '../../_context/AuthContext';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };
  },
  usePathname() {
    return '/friends';
  },
}));

vi.mock('../../_context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Friends Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it('should redirect to home page when user is logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<FriendsPage />);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render the friends page with correct stats and user cards', async () => {
    const mockFriendsFromApi = [
      {
        username: '@kamil_reads',
        name: 'Kamil Nowak',
        friendshipStatus: 'accepted',
        isInitiator: false,
        readingStatuses: [{ status: 'read' }, { status: 'read' }],
        reviews: [{}, {}],
        activities: []
      }
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: { name: 'Ania Kowalska' } as any,
      loading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFriendsFromApi,
    });

    render(<FriendsPage />);

    await waitFor(() => {
      expect(screen.getByText(/1 friends · 0 invitations/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /friends/i })).toBeInTheDocument();
    expect(screen.getByText('Kamil Nowak')).toBeInTheDocument();
    expect(screen.getByText('@kamil_reads')).toBeInTheDocument();
  });
});