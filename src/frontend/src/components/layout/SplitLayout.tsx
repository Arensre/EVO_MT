import { ReactNode } from 'react';

interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function SplitLayout({ leftPanel, rightPanel }: SplitLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 border-r border-gray-200 overflow-auto bg-white">
        {leftPanel}
      </div>
      <div className="w-1/2 overflow-auto bg-gray-50">
        {rightPanel}
      </div>
    </div>
  );
}
