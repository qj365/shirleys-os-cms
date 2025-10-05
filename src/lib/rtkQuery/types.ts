export type TQueryConfig = {
  manuallyHandlingErrorMsg?: boolean;
  disableSpinner?: boolean;
};

export type QueryResponse<T> = {
  data: T;
  message: string;
};
