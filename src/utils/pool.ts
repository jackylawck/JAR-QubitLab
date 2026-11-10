// src/utils/pool.ts
import * as THREE from 'three';

/**
 * J.A.R. Zero-GC 靜態運算池
 * 嚴禁在 useFrame、手勢監聽或高頻渲染迴圈中呼叫 new THREE.Vector3 / Quaternion
 */
export const POOL = {
  // 基礎三維運算向量
  v1: new THREE.Vector3(),
  v2: new THREE.Vector3(),
  v3: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  mid: new THREE.Vector3(),

  // 坐標系基底
  up: new THREE.Vector3(0, 1, 0),
  forward: new THREE.Vector3(0, 0, 1),
  right: new THREE.Vector3(1, 0, 0),

  // 旋轉與四元數緩存
  q1: new THREE.Quaternion(),
  q2: new THREE.Quaternion(),
  m1: new THREE.Matrix4(),

  // 二維平面手勢向量
  pointerDelta: new THREE.Vector2(),
};
