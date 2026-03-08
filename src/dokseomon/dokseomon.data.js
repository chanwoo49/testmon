/**
 * 독서몬 캐릭터 데이터
 * 
 * 스프라이트 시트는 src/assets/mons/ 아래에 위치합니다.
 * Vite가 JSON과 PNG를 각각 처리합니다:
 *   - JSON: import 시 파싱된 객체로 제공
 *   - PNG:  import 시 번들된 URL 문자열로 제공
 * 
 * 파일 구조:
 *   src/assets/mons/ruby/ruby_idle.json
 *   src/assets/mons/ruby/ruby_idle.png
 * 
 * 캐릭터 추가 시:
 *   1. TexturePacker로 스프라이트 시트 생성 (PixiJS 포맷)
 *   2. src/assets/mons/[캐릭터명]/ 에 json + png 배치
 *   3. 아래에 import 추가 + CHARACTERS 배열에 등록
 */

// ── 루비 스프라이트 시트 ──
import rubyIdleData from '../assets/mons/ruby/ruby_idle.json'
import rubyIdlePng from '../assets/mons/ruby/ruby_idle.png'

// ── 기존 이미지 (소우주 카드, 알 등) ──
import rubyjjiImg from '../assets/mons/rubyjji.png'
import rubyeggImg from '../assets/mons/rubyegg.png'

// ─────────────────────────────────────────────
// 캐릭터 등록부
// ─────────────────────────────────────────────
export const CHARACTERS = [
  {
    id: 'ruby',
    name: '루비',
    category: '경영/경제',
    // ── 스프라이트 시트 (Vite import) ──
    idleData: rubyIdleData,     // JSON 객체 (프레임 정보)
    idlePng: rubyIdlePng,       // PNG URL (번들된 경로)
    // ── 기존 이미지 (호환용) ──
    egg: rubyeggImg,
    legacy: rubyjjiImg,
    animTemplate: 'A',
  },
  // ─── 향후 추가 예시 ─────────────────────────
  // import blazeIdleData from '../assets/mons/blaze/blaze_idle.json'
  // import blazeIdlePng from '../assets/mons/blaze/blaze_idle.png'
  // {
  //   id: 'blaze',
  //   name: '블레이즈',
  //   category: '자기계발',
  //   idleData: blazeIdleData,
  //   idlePng: blazeIdlePng,
  //   egg: blazeEggImg,
  //   animTemplate: 'A',
  // },
]

// ─────────────────────────────────────────────
// 유틸 함수
// ─────────────────────────────────────────────

export function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) || null
}

export function getCharacterByName(name) {
  const cleanName = name.replace(' 알', '').trim()
  return CHARACTERS.find((c) => c.name === cleanName) || null
}

export function getDefaultCharacter() {
  return CHARACTERS[0]
}

export const EGG_IMAGES = {
  '루비 알': rubyeggImg,
  '신비의 알': rubyeggImg,
}