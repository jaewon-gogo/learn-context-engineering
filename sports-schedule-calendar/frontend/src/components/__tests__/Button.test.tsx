/**
 * Level 1: Button 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../ui/button';

describe('Button', () => {
  it('버튼이 렌더링되어야 함', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('클릭 이벤트를 처리할 수 있어야 함', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭할 수 없어야 함', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('variant에 따라 다른 스타일을 적용해야 함', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    let button = screen.getByRole('button', { name: /default/i });
    expect(button.className).toContain('bg-primary');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button.className).toContain('border');
  });

  it('size에 따라 다른 크기를 적용해야 함', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button.className).toContain('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button.className).toContain('h-11');
  });
});

