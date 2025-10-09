import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { useEffect } from 'react';
import useRouteMatch from './useRouteMatch';

type UseSetSelectedMenuKeysProps = {
  patterns: string[];
  selectedMenuKeys: string[];
};

const useSetSelectedMenuKeys = ({
  patterns,
  selectedMenuKeys,
}: UseSetSelectedMenuKeysProps) => {
  const { setSelectedMenuKeys } = useAppInfoStore();

  const matchedRoutes = useRouteMatch(patterns);

  useEffect(() => {
    if (!matchedRoutes) return;
    setSelectedMenuKeys(selectedMenuKeys);
  }, [matchedRoutes, selectedMenuKeys, setSelectedMenuKeys]);
};

export default useSetSelectedMenuKeys;
