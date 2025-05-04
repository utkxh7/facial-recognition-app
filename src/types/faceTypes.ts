import * as faceapi from 'face-api.js';

export interface FaceData {
  detection: any; // Correct type for face-api.js
  age: number;
  gender: 'male' | 'female';
  genderProbability: number;
  expressions?: faceapi.FaceExpression; // Correct type for v0.22.2
  landmarks?: faceapi.FaceLandmarks; // No I prefix
}

export interface FaceState {
  faces: FaceData[];
  isLoading: boolean;
  error: string | null;
}

// Action types
export const SET_FACES = 'SET_FACES';
export const RESET_FACES = 'RESET_FACES';
export const DETECTION_STARTED = 'DETECTION_STARTED';
export const DETECTION_FAILED = 'DETECTION_FAILED';

// Action interfaces
export interface SetFacesAction {
  type: typeof SET_FACES;
  payload: FaceData[];
}

export interface ResetFacesAction {
  type: typeof RESET_FACES;
}

export interface DetectionStartedAction {
  type: typeof DETECTION_STARTED;
}

export interface DetectionFailedAction {
  type: typeof DETECTION_FAILED;
  payload: string;
}

export type FaceActions = 
  | SetFacesAction
  | ResetFacesAction
  | DetectionStartedAction
  | DetectionFailedAction;