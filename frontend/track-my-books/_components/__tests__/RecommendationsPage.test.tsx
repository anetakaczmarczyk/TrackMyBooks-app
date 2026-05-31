import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecommendationsPage from '../../app/recommendations/page'; 
import { useAuth } from '../../_context/AuthContext';

vi.mock('next/navigation', () => ({
  useRouter() {
    return { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() };
  },
  usePathname() {
    return '/recommendations';
  },
}));

vi.mock('../../_context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Recommendations Page', () => {
  const mockRecommendationsFromApi = [
    {
      book_Id: 101,
      title: 'Project Hail Mary',
      authorName: 'Andy Weir',
      imageUrl: 'http://example.com/cover.jpg',
      primaryGenre: 'SCI-FI',
      reason: 'Perfect space adventure for your mood!',
      rating: 4.867
    }
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'Ania', name: 'Ania Kowalska' } as any,
      loading: false,
      logout: vi.fn(),
    });
  });

  it('should render mood buttons and update content when a mood is selected', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRecommendationsFromApi,
    });
    global.fetch = mockFetch;

    render(<RecommendationsPage />);


    const relaxButton = screen.getByText('Relax').closest('button');
    expect(relaxButton).toBeInTheDocument();


    if (relaxButton) {
      await userEvent.click(relaxButton);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:5000/api/books/getRecommendations?mood=relax&username=Ania'),
        expect.any(Object)
      );
    });

    expect(screen.getByText('Project Hail Mary')).toBeInTheDocument();
    expect(screen.getByText('Andy Weir')).toBeInTheDocument();
    expect(screen.getByText('SCI-FI')).toBeInTheDocument();
    expect(screen.getByText('★ 4.87')).toBeInTheDocument();

    const linkElement = screen.getByRole('link', { name: /show book/i });
    expect(linkElement).toHaveAttribute('href', '/books/101');
  });
});