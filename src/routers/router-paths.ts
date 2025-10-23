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
  orderListPage: (query?: string) =>
    `/product-management/orders${query ? `?${query}` : ''}`,
  orderDetailPage: (orderId: string, query?: string) =>
    `/product-management/orders/${orderId}${query ? `?${query}` : ''}`,

  /**service **/
  cookingClassListPage: (query?: string) =>
    `/service/cooking-class${query ? `?${query}` : ''}`,
  cookingClassDetailPage: (cookingClassId: string, query?: string) =>
    `/service/cooking-class/${cookingClassId}${query ? `?${query}` : ''}`,
  /**settings **/
  notificationPage: () => '/setting/notification',
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
