/**
 * 독서몬 체형별 애니메이션 템플릿
 * 
 * 각 템플릿은 idle / walk / jump 3종 동작의 파라미터를 정의합니다.
 * Pixi나 React에 의존하지 않는 순수 데이터 파일입니다.
 * 
 * 사용법:
 *   import { ANIM_TEMPLATES } from './animTemplates'
 *   const template = ANIM_TEMPLATES['A']
 *   const idleScaleY = 1 + Math.sin(time * template.idle.speed) * template.idle.scaleYAmp
 */

// ─────────────────────────────────────────────
// 템플릿 A: 동글한 마스코트형 (루비 등)
// 특징: bob + waddle + squash-jump
// ─────────────────────────────────────────────
const templateA = {
  idle: {
    // scaleY 호흡 애니메이션 (살짝 늘었다 줄었다)
    speed: 0.05,        // sin(t * speed) — 느린 호흡감
    scaleYAmp: 0.02,    // scaleY 변화 진폭 (1 ± 0.02)
    scaleXAmp: 0.01,    // scaleX 미세 보정 (호흡과 반대로)
  },

  walk: {
    // rotation 뒤뚱뒤뚱
    speed: 0.18,           // sin(t * speed) — 빠른 뒤뚱
    rotationAmp: 6,        // 좌우 기울기 (±6도, 라디안 변환 필요)
    // 살짝 위아래 바운스 추가
    bounceSpeed: 0.36,     // walk speed의 2배 (발걸음)
    bounceAmp: 2,          // y 오프셋 (px)
  },

  jump: {
    // 5단계 스쿼시 앤 스트레치
    phases: [
      // [1단계] 스쿼시 준비: 쪼그라들기
      { duration: 120, scaleX: 1.15, scaleY: 0.85, offsetY: 0 },
      // [2단계] 스트레치 상승: 늘어나며 점프
      { duration: 200, scaleX: 0.85, scaleY: 1.2, offsetY: -40 },
      // [3단계] 정점: 살짝 떠있는 상태
      { duration: 150, scaleX: 0.95, scaleY: 1.05, offsetY: -45 },
      // [4단계] 낙하: 원위치로
      { duration: 180, scaleX: 1.0, scaleY: 1.0, offsetY: 0 },
      // [5단계] 착지 스쿼시: 쿵! 후 idle로 복귀
      { duration: 100, scaleX: 1.1, scaleY: 0.9, offsetY: 0 },
    ],
    // 점프 트리거 확률 (이동 중 랜덤 점프)
    triggerChance: 0.005,   // 매 틱마다 0.5% 확률
  },
}

// ─────────────────────────────────────────────
// 템플릿 B: 길쭉한 스네이크형 (향후 확장)
// 특징: sway + slither + spring-jump
// ─────────────────────────────────────────────
const templateB = {
  idle: {
    speed: 0.04,
    scaleYAmp: 0.015,
    scaleXAmp: 0.02,
  },
  walk: {
    speed: 0.12,
    rotationAmp: 10,
    bounceSpeed: 0.24,
    bounceAmp: 1,
  },
  jump: {
    phases: [
      { duration: 100, scaleX: 1.05, scaleY: 0.7, offsetY: 0 },
      { duration: 250, scaleX: 0.8, scaleY: 1.4, offsetY: -50 },
      { duration: 150, scaleX: 0.9, scaleY: 1.1, offsetY: -55 },
      { duration: 200, scaleX: 1.0, scaleY: 1.0, offsetY: 0 },
      { duration: 80, scaleX: 1.08, scaleY: 0.85, offsetY: 0 },
    ],
    triggerChance: 0.003,
  },
}

// ─────────────────────────────────────────────
// 템플릿 C: 네발 짐승형 (향후 확장)
// 특징: trot + gallop + leap
// ─────────────────────────────────────────────
const templateC = {
  idle: {
    speed: 0.06,
    scaleYAmp: 0.015,
    scaleXAmp: 0.008,
  },
  walk: {
    speed: 0.22,
    rotationAmp: 4,
    bounceSpeed: 0.44,
    bounceAmp: 3,
  },
  jump: {
    phases: [
      { duration: 150, scaleX: 1.1, scaleY: 0.88, offsetY: 0 },
      { duration: 180, scaleX: 0.9, scaleY: 1.15, offsetY: -35 },
      { duration: 120, scaleX: 0.95, scaleY: 1.05, offsetY: -38 },
      { duration: 160, scaleX: 1.0, scaleY: 1.0, offsetY: 0 },
      { duration: 90, scaleX: 1.08, scaleY: 0.92, offsetY: 0 },
    ],
    triggerChance: 0.004,
  },
}

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
export const ANIM_TEMPLATES = {
  A: templateA,
  B: templateB,
  C: templateC,
}

/**
 * 도(degree)를 라디안으로 변환
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * 두 값 사이를 보간 (lerp)
 * @param {number} a - 시작값
 * @param {number} b - 목표값
 * @param {number} t - 0~1 진행도
 */
export function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}
