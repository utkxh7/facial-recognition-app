declare module 'face-api.js' {
    export interface FaceExpression {
      expression: string;
      probability: number;
    }
    
    export interface FaceLandmarks {
      positions: Point[];
      shift: Point;
    }
    
    // Add other missing type declarations as needed
  }