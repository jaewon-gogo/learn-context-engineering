/**
 * Level 1: 스포츠 선택 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Sport } from '@/types';

interface SportSelectorProps {
  selectedSportId?: number;
  onSelect: (sportId: number) => void;
  disabled?: boolean;
  className?: string;
}

export function SportSelector({
  selectedSportId,
  onSelect,
  disabled = false,
  className,
}: SportSelectorProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Level 2: 실제 API 호출
    const fetchSports = async () => {
      try {
        const { apiGet } = await import('@/lib/api');
        const data = await apiGet<{ sports: Sport[] }>('/api/v1/teams/sports');
        setSports(data?.sports || []);
      } catch (error) {
        console.error('스포츠 목록 조회 실패:', error);
        // 에러 발생 시 빈 배열 반환
        setSports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, []);

  if (isLoading) {
    return <div className={className}>로딩 중...</div>;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {sports.map((sport) => (
          <Button
            key={sport.sports_id}
            onClick={() => onSelect(sport.sports_id)}
            disabled={disabled}
            variant={selectedSportId === sport.sports_id ? 'default' : 'outline'}
            size="sm"
          >
            {sport.sports_name}
          </Button>
        ))}
      </div>
    </div>
  );
}

