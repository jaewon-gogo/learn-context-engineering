/**
 * Level 1: 루트 레이아웃
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '스포츠팀 경기일정 캘린더',
  description: '좋아하는 스포츠팀의 경기일정을 확인하고 Google 캘린더에 동기화하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

