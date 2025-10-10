import { matchPath, useLocation } from 'react-router-dom';

const useRouteMatch = (patterns: readonly string[]) => {
  const { pathname } = useLocation();

  for (const pattern of patterns) {
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }

  return null;
};

export default useRouteMatch;
