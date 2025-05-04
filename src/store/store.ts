import { configureStore } from '@reduxjs/toolkit';
import faceReducer from './faceSlice'; // Changed import

export const store = configureStore({
  reducer: {
    face: faceReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;