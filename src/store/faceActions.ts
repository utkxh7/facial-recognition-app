// src/store/faceActions.ts
import { FaceData, SetFacesAction, ResetFacesAction } from '../types/faceTypes';

export const setFaces = (faces: FaceData[]): SetFacesAction => ({
  type: 'SET_FACES',
  payload: faces
});

export const resetFaces = (): ResetFacesAction => ({
  type: 'RESET_FACES'
});