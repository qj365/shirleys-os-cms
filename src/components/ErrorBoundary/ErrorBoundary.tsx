import { Button } from 'antd';
import clsx from 'clsx';
import { useNavigate, useRouteError } from 'react-router-dom';
import { getPath } from 'routers/router-paths';

export default function ErrorBoundary() {
  const error = useRouteError();
  const isDevMode = import.meta.env.MODE === 'development';

  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-10">
      <h3 className="h3 mb-1 text-3xl font-bold">An error occurred!</h3>
      <p className="mb-6 text-base">Please try again or return to home page</p>
      {isDevMode && (
        <div
          className={clsx(
            'mb-6 max-w-[64rem] p-6',
            'bg-error-lighter text-error',
            'border border-error',
            'break-words text-sm',
            'max-h-50 overflow-y-auto overflow-x-hidden rounded-xl'
          )}
        >
          {typeof error === 'object' && error && 'stack' in error
            ? (error as { stack?: string }).stack
            : String(error)}
        </div>
      )}
      <div className="flex items-center justify-center gap-x-4">
        <Button type="default" onClick={() => window.location.reload()}>
          Reload
        </Button>

        <Button type="primary" onClick={() => navigate(getPath('portal'))}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
