import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

const ScrollRestoration = ({ children }: PropsWithChildren) => {
  useEffect(
    () => () => {
      document.getElementById('main')?.scrollTo(0, 0);
    },
    []
  );
  return <>{children}</>;
};

export default ScrollRestoration;
