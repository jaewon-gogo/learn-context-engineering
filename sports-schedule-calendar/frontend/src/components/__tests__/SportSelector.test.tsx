/**
 * Level 1: SportSelector 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SportSelector } from '../features/SportSelector';

// API 모킹
vi.mock('@/lib/api', () => ({
  apiGet: vi.fn(),
}));

describe('SportSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컴포넌트가 렌더링되어야 함', () => {
    render(<SportSelector onSelect={mockOnSelect} />);
    expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
  });

  it('스포츠 목록을 로드하고 표시해야 함', async () => {
    const { apiGet } = await import('@/lib/api');
    const mockSports = [
      { sports_id: 1, sports_name: '야구', display_order: 1, is_active: true },
      { sports_id: 2, sports_name: '축구', display_order: 2, is_active: true },
    ];

    vi.mocked(apiGet).mockResolvedValue({ sports: mockSports });

    render(<SportSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('야구')).toBeInTheDocument();
      expect(screen.getByText('축구')).toBeInTheDocument();
    });
  });

  it('스포츠 선택 시 onSelect 콜백을 호출해야 함', async () => {
    const { apiGet } = await import('@/lib/api');
    const mockSports = [
      { sports_id: 1, sports_name: '야구', display_order: 1, is_active: true },
    ];

    vi.mocked(apiGet).mockResolvedValue({ sports: mockSports });

    const user = userEvent.setup();
    render(<SportSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('야구')).toBeInTheDocument();
    });

    const button = screen.getByText('야구');
    await user.click(button);

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('선택된 스포츠는 다른 스타일을 가져야 함', async () => {
    const { apiGet } = await import('@/lib/api');
    const mockSports = [
      { sports_id: 1, sports_name: '야구', display_order: 1, is_active: true },
    ];

    vi.mocked(apiGet).mockResolvedValue({ sports: mockSports });

    render(<SportSelector selectedSportId={1} onSelect={mockOnSelect} />);

    await waitFor(() => {
      const button = screen.getByText('야구');
      expect(button.className).toContain('bg-primary'); // 선택된 버튼 스타일
    });
  });
});

