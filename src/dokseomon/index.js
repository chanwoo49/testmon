/**
 * 독서몬 모듈 — 진입점
 * 
 * 외부에서 사용할 때:
 *   import { DokseomonCanvas } from '../dokseomon'
 *   import { getCharacterByName, CHARACTERS } from '../dokseomon'
 */

// 메인 캔버스 컴포넌트 (MyRoom에서 사용)
export { default as DokseomonCanvas } from './DokseomonCanvas'

// 스프라이트 클래스 (고급 사용)
export { default as DokseomonSprite } from './DokseomonSprite'

// 캐릭터 데이터
export {
  CHARACTERS,
  getCharacterById,
  getCharacterByName,
  getDefaultCharacter,
  EGG_IMAGES,
} from './dokseomon.data'

// 애니메이션 템플릿 (향후 확장용 — 현재 idle 스프라이트 시트 사용)
export { ANIM_TEMPLATES, degToRad, lerp } from './animTemplates'
