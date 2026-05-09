import { Object3DNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    gradientShaderMaterial: Object3DNode<any, any>;
  }
}
