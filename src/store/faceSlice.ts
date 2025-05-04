// src/store/faceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FaceData } from '../types/faceTypes';

interface FaceState {
  faces: FaceData[];
}

const initialState: FaceState = {
  faces: []
};

const faceSlice = createSlice({
  name: 'face',
  initialState,
  reducers: {
    setFaces: (state, action: PayloadAction<FaceData[]>) => {
      state.faces = action.payload;
    },
    resetFaces: (state) => {
      state.faces = [];
    }
  }
});

export const { setFaces, resetFaces } = faceSlice.actions;
export default faceSlice.reducer;