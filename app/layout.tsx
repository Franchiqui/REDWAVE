import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

import { Providers } from '@/components/Providers';
import '../zeus-icons.js';
import '../zeus-styles.css';
import { ComponentSelectorHelper } from '@/components/component-selector-helper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ComponentSelectorHelper />
          {children}
        </Providers>
      </body>
    </html>
  );
}