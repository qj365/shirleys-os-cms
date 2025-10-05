const publicPaths = {
  login: () => `/auth/login`,
};

const privatePaths = {
  portal: () => '/',
};

const pathsMap = {
  ...publicPaths,
  ...privatePaths,
};

export type PathsMap = typeof pathsMap;

export const getPath = <TRoute extends keyof PathsMap>(
  route: TRoute,
  ...params: Parameters<PathsMap[TRoute]>
) => {
  const pathCb: (...args: Parameters<PathsMap[TRoute]>) => string =
    pathsMap[route];
  return pathCb(...params);
};
