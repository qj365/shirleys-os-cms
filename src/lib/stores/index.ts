import type { Reducer } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import appUISliceReducer from 'features/appInfo/slice';
import authReducer from 'features/auth/slice';
import { baseApi } from 'lib/rtkQuery/baseApi';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import type { Persistor } from 'redux-persist';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const rootReducer = combineReducers({
  appInfo: appUISliceReducer,
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
}) as Reducer;

const persistConfig = {
  key: 'root',
  storage: createWebStorage('local'),
  blacklist: [],
  whitelist: ['auth', 'appInfo'],
};

const makeStore = ({ isServer }: { isServer: boolean }) => {
  if (isServer) {
    const store = configureStore({
      reducer: rootReducer,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }).concat(baseApi.middleware),
    });
    return store;
  }

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(baseApi.middleware),
  });

  setupListeners(store.dispatch);

  (store as unknown as { __persistor: Persistor }).__persistor =
    persistStore(store);

  return store;
};

export const store = makeStore({ isServer: false });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
