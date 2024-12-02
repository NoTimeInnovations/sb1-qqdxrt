import React from 'react';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}