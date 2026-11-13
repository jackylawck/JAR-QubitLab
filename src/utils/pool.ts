// src/utils/pool.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import * as THREE from 'three';

/**
 * 不可變坐標系基底常數（嚴禁修改，僅供唯讀參照如 crossVectors / setFromUnitVectors）
 */
export const BASIS = Object.freeze({
  ZERO: Object.freeze(new THREE.Vector3(0, 0, 0)),
  UP: Object.freeze(new THREE.Vector3(0, 1, 0)),
  DOWN: Object.freeze(new THREE.Vector3(0, -1, 0)),
  FORWARD: Object.freeze(new THREE.Vector3(0, 0, 1)),
  BACK: Object.freeze(new THREE.Vector3(0, 0, -1)),
  RIGHT: Object.freeze(new THREE.Vector3(1, 0, 0)),
  LEFT: Object.freeze(new THREE.Vector3(-1, 0, 0)),
});

/**
 * J.A.R. Zero-GC 靜態運算池
 * 嚴禁在 useFrame、手勢監聽或高頻渲染迴圈中呼叫 new THREE.Vector3 / Quaternion / Color
 * ⚠️ 注意：同一同步呼叫堆疊內的子函式不可共用同一個暫存槽，以免數值覆寫
 */
export const POOL = Object.freeze({
  // 基礎三維運算向量（保留相容別名並擴充工作槽）
  v1: new THREE.Vector3(),
  v2: new THREE.Vector3(),
  v3: new THREE.Vector3(),
  v4: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  mid: new THREE.Vector3(),

  // 唯讀基底參照（向後相容既有引用）
  up: BASIS.UP,
  forward: BASIS.FORWARD,
  right: BASIS.RIGHT,

  // 旋轉、歐拉角與矩陣緩存
  q1: new THREE.Quaternion(),
  q2: new THREE.Quaternion(),
  e1: new THREE.Euler(),
  m1: new THREE.Matrix4(),
  m2: new THREE.Matrix4(),

  // 色彩插值緩存（杜絕 useFrame 內動態建立 THREE.Color）
  c1: new THREE.Color(),
  c2: new THREE.Color(),

  // 二維平面與手勢向量
  p1: new THREE.Vector2(),
  p2: new THREE.Vector2(),
  pointerDelta: new THREE.Vector2(),
});

/**
 * 重置所有可變暫存槽至初始單位狀態（適用於展台切換或 Vitest 測試隔離）
 */
export function resetPool(): void {
  POOL.v1.set(0, 0, 0);
  POOL.v2.set(0, 0, 0);
  POOL.v3.set(0, 0, 0);
  POOL.v4.set(0, 0, 0);
  POOL.dir.set(0, 0, 0);
  POOL.mid.set(0, 0, 0);

  POOL.q1.identity();
  POOL.q2.identity();
  POOL.e1.set(0, 0, 0, 'XYZ');
  POOL.m1.identity();
  POOL.m2.identity();

  POOL.c1.setRGB(0, 0, 0);
  POOL.c2.setRGB(0, 0, 0);

  POOL.p1.set(0, 0);
  POOL.p2.set(0, 0);
  POOL.pointerDelta.set(0, 0);
}
