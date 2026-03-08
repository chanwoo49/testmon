/**
 * DokseomonCanvas
 * 
 * 마이룸에 배치되는 Pixi.js 캔버스 컴포넌트입니다.
 * src/assets/mons/ 의 스프라이트 시트를 로드하여 idle 애니메이션을 재생합니다.
 * 
 * Vite 번들링 대응:
 *   JSON(프레임 정보)과 PNG(이미지)를 각각 import한 뒤,
 *   Pixi Spritesheet를 수동으로 조립합니다.
 *   이렇게 하면 Vite가 PNG에 해시를 붙여도 정상 동작합니다.
 * 
 * 사용법:
 *   <DokseomonCanvas characterData={{ name: '루비', ... }} />
 */

import { useRef, useEffect } from 'react'
import { Application, Assets, Spritesheet, Texture } from 'pixi.js'
import DokseomonSprite from './DokseomonSprite'
import { getCharacterByName, getDefaultCharacter } from './dokseomon.data'

// ─────────────────────────────────────────────
// 배치 설정
// ─────────────────────────────────────────────
const GROUND_Y_RATIO = 0.82     // 캔버스 높이의 82% 지점 (땅)
const SPRITE_SIZE = 100           // 스프라이트 표시 크기 (px)

function DokseomonCanvas({ 
  characterData,             // { name: '루비', ... } — localStorage에서 온 독서몬 정보
}) {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const spriteRef = useRef(null)

  // ── 캐릭터 데이터 조회 ──
  const charData = characterData 
    ? (getCharacterByName(characterData.name) || getDefaultCharacter())
    : getDefaultCharacter()

  // ── Pixi 초기화 ──
  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false
    const app = new Application()

    const init = async () => {
      try {
        await app.init({
          resizeTo: containerRef.current,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        if (destroyed) return

        // 캔버스를 DOM에 추가
        containerRef.current.appendChild(app.canvas)
        app.canvas.style.position = 'absolute'
        app.canvas.style.top = '0'
        app.canvas.style.left = '0'
        app.canvas.style.width = '100%'
        app.canvas.style.height = '100%'

        appRef.current = app

        // ── 스프라이트 시트 수동 조립 ──
        // 1. PNG를 Pixi 텍스처로 로드 (Vite가 번들한 URL 사용)
        const baseTexture = await Assets.load(charData.idlePng)

        if (destroyed) return

        // 2. JSON 데이터 + 텍스처로 Spritesheet 생성
        const spritesheet = new Spritesheet(baseTexture, charData.idleData)

        // 3. 프레임 파싱
        await spritesheet.parse()

        if (destroyed) return

        // 스프라이트 생성
        const sprite = new DokseomonSprite({
          app,
          spritesheet,
          spriteSize: SPRITE_SIZE,
          animationSpeed: 0.15,
        })

        app.stage.addChild(sprite.getContainer())
        spriteRef.current = sprite

        // 위치: 가로 중앙, 세로 땅 위치
        const posX = app.screen.width / 2
        const posY = app.screen.height * GROUND_Y_RATIO
        sprite.setPosition(posX, posY)

      } catch (error) {
        console.error('DokseomonCanvas 초기화 실패:', error)
      }
    }

    init()

    // ── 클린업 ──
    return () => {
      destroyed = true
      if (spriteRef.current) {
        spriteRef.current.destroy()
        spriteRef.current = null
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [charData.idlePng, charData.idleData])

  return (
    <div
      ref={containerRef}
      className="dokseomon-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
      }}
    />
  )
}

export default DokseomonCanvas