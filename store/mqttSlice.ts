import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MqttState {
  connected: boolean;
  temp: number | null;
  humi: number | null;
  rssid: string | null;
  checkStatus: string | null;
}

const initialState: MqttState = {
  connected: false,
  temp: null,
  humi: null,
  rssid: null,
  checkStatus: null,
};

const mqttSlice = createSlice({
  name: 'mqtt',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setTemp(state, action: PayloadAction<number>) {
      state.temp = action.payload;
    },
    setHumi(state, action: PayloadAction<number>) {
      state.humi = action.payload;
    },
    setRssid(state, action: PayloadAction<string>) {
      state.rssid = action.payload;
    },
    setCheckStatus(state, action: PayloadAction<string>) {
      state.checkStatus = action.payload;
    },
  },
});

export const {
  setConnected,
  setTemp,
  setHumi,
  setRssid,
  setCheckStatus,
} = mqttSlice.actions;

export default mqttSlice.reducer;
