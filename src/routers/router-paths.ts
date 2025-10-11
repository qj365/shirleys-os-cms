const publicPaths = {
  login: () => `/auth/login`,
};

const privatePaths = {
  portal: () => '/',

  /**product-management **/
  productCategoriesPage: (query?: string) =>
    `/product-management/categories${query ? `?${query}` : ''}`,
  productListPage: (query?: string) =>
    `/product-management/products${query ? `?${query}` : ''}`,
  productDetailPage: (productId: string, query?: string) =>
    `/product-management/products/${productId}${query ? `?${query}` : ''}`,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathCb: (...args: any[]) => string = pathsMap[route];
  return pathCb(...params);
};
