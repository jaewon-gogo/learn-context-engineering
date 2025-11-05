/**
 * Level 2: 대시보드 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SportSelector } from '@/components/features/SportSelector';
import { TeamSelector } from '@/components/features/TeamSelector';
import { useSchedule } from '@/hooks/useSchedule';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>();
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { schedules, isLoading: schedulesLoading } = useSchedule({
    teamId: selectedTeamId,
    startDate: formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)),
    endDate: formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">경기일정 캘린더</h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">{user.name}님</span>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 스포츠 선택 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">스포츠 선택</h2>
            <SportSelector
              selectedSportId={selectedSportId}
              onSelect={setSelectedSportId}
            />
          </section>

          {/* 팀 선택 */}
          {selectedSportId && (
            <section>
              <h2 className="text-lg font-semibold mb-4">팀 선택</h2>
              <TeamSelector
                sportId={selectedSportId}
                selectedTeamId={selectedTeamId}
                onSelect={setSelectedTeamId}
              />
            </section>
          )}

          {/* 캘린더 */}
          {selectedTeamId && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </h2>
                <div className="flex gap-2">
                  <Button onClick={handlePrevMonth} variant="outline" size="sm">
                    ◀ 이전
                  </Button>
                  <Button onClick={handleNextMonth} variant="outline" size="sm">
                    다음 ▶
                  </Button>
                </div>
              </div>

              {schedulesLoading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-7 gap-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm p-2">
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: 42 }).map((_, index) => {
                      const date = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        index - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1
                      );
                      const dateStr = formatDate(date);
                      const daySchedules = schedules.filter((s) => s.game_date === dateStr);

                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      const isToday = dateStr === formatDate(new Date());

                      return (
                        <div
                          key={index}
                          className={`min-h-20 p-2 border rounded-md ${
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'border-blue-500 border-2' : ''}`}
                        >
                          {isCurrentMonth && (
                            <>
                              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                                {date.getDate()}
                              </div>
                              {daySchedules.map((schedule) => (
                                <div
                                  key={schedule.schedule_id}
                                  className="text-xs p-1 bg-blue-100 hover:bg-blue-200 rounded mb-1 cursor-pointer"
                                  title={`${schedule.opponent_team} (${schedule.game_time || '시간 미정'})`}
                                >
                                  🏟️ {schedule.opponent_team}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

