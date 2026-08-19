import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
});

const syncUserMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type === 'auth/updateUser') {
    const state = storeAPI.getState();
    const authUser = state.auth.user;
    if (authUser) {
      storeAPI.dispatch({ type: 'data/syncUserData', payload: authUser });
    }
  }
  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(syncUserMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
