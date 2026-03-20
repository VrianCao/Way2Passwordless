import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import './global.css';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Way to Passwordless',
    template: '%s | Way to Passwordless',
  },
  description: '无密码认证课程文档站，从第一性原理到 Passkey 实战。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={notoSansSC.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
