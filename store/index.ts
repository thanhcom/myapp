import { configureStore } from '@reduxjs/toolkit';
import mqttReducer from './mqttSlice';

export const store = configureStore({
  reducer: {
    mqtt: mqttReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
