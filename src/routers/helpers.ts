import { lazy } from 'react';
import { matchPath } from 'react-router-dom';
import { getPath } from './router-paths';

const homePaths = [getPath('portal')];

/**
 * Determine if a menu item that does not include a group of sub-menu
 * on the navigation sidebar should be highlighted or not
 * E.g:
 * Current location: /forms/patient
 * Then menu item starting with /forms should be highlighted
 *
 * @returns boolean
 * @param pathName (string)
 * @param navLinkPath (string)
 */
export const checkActiveLink = (
  pathName: string,
  navLinkPath: string | string[]
): boolean => {
  if (Array.isArray(navLinkPath)) {
    return navLinkPath.some(
      path =>
        path === pathName ||
        matchPath({ path, caseSensitive: true, end: false }, pathName)
    );
  }

  if (homePaths.includes(pathName) && homePaths.includes(navLinkPath)) {
    return true;
  }

  return (
    !!matchPath(
      { path: navLinkPath, caseSensitive: true, end: false },
      pathName
    ) && !homePaths.includes(navLinkPath)
  );
};

export const lazyImport: typeof lazy = importer => {
  const retryImport = async () => {
    try {
      return await importer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return Promise.reject(error);
    }
  };
  return lazy(retryImport);
};
