import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
}

export default function ResponsiveGrid({ children, columns = 3 }: ResponsiveGridProps) {
  const gridCols = {
    1: 'grid-cols-1 md:grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {children}
    </div>
  );
}