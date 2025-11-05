/**
 * Level 1: 팀 선택 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Team } from '@/types';

interface TeamSelectorProps {
  sportId: number;
  selectedTeamId?: number;
  onSelect: (teamId: number) => void;
  disabled?: boolean;
  className?: string;
}

export function TeamSelector({
  sportId,
  selectedTeamId,
  onSelect,
  disabled = false,
  className,
}: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sportId) {
      setTeams([]);
      setIsLoading(false);
      return;
    }

    // Level 2: 실제 API 호출
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const { apiGet } = await import('@/lib/api');
        const data = await apiGet<{ teams: Team[] }>(`/api/v1/teams?sports_id=${sportId}`);
        setTeams(data.teams || []);
      } catch (error) {
        console.error('팀 목록 조회 실패:', error);
        // 에러 발생 시 빈 배열 반환
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [sportId]);

  if (isLoading) {
    return <div className={className}>로딩 중...</div>;
  }

  if (teams.length === 0) {
    return <div className={className}>선택 가능한 팀이 없습니다</div>;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {teams.map((team) => (
          <Button
            key={team.team_id}
            onClick={() => onSelect(team.team_id)}
            disabled={disabled}
            variant={selectedTeamId === team.team_id ? 'default' : 'outline'}
            size="sm"
          >
            {team.team_name}
          </Button>
        ))}
      </div>
    </div>
  );
}

