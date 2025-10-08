import type { ReactNode } from 'react';

type AppPageHeaderProps = {
  title: string;
  subtitle?: string;
  addon?: ReactNode;
};

const AppPageHeader = ({ title, subtitle, addon }: AppPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between pb-6">
      <div className="flex flex-col">
        <h1 className="mb-0 text-2xl font-bold text-secondary dark:text-gray-200">
          {title}
        </h1>
        {subtitle && <p className="text-base text-gray-400">{subtitle}</p>}
      </div>
      {addon}
    </div>
  );
};

export default AppPageHeader;
