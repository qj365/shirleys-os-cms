import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

const loadingQueue: number[] = [];

export const startLoadingSpinner = () => {
  loadingQueue.push(1);
  NProgress.start();
};

export const stopLoadingSpinner = () => {
  loadingQueue.pop();
  if (!loadingQueue.length) {
    NProgress.done();
  }
};
