import { FaceState, FaceActions, SET_FACES, RESET_FACES } from '../types/faceTypes';

// Provide all required properties from FaceState
const initialState: FaceState = {
  faces: [],
  isLoading: false,
  error: null
};

const faceReducer = (state = initialState, action: FaceActions): FaceState => {
  switch (action.type) {
    case SET_FACES:
      return {
        ...state,
        faces: action.payload,
        isLoading: false,
        error: null
      };
      
    case RESET_FACES:
      return {
        ...state,
        faces: [],
        isLoading: false,
        error: null
      };
      
    default:
      return state;
  }
};

export default faceReducer;