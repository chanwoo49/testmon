/**
 * DokseomonCanvas
 * 
 * 마이룸에 배치되는 Pixi.js 캔버스 컴포넌트입니다.
 * src/assets/mons/ 의 스프라이트 시트를 로드하여 idle 애니메이션을 재생합니다.
 * 
 * 반응형 대응:
 *   - ResizeObserver로 컨테이너 크기 변화 감지
 *   - 캔버스 해상도 + 스프라이트 위치를 자동 재계산
 *   - 모바일/데스크톱 모두 정상 동작
 * 
 * 사용법:
 *   <DokseomonCanvas characterData={{ name: '루비', ... }} />
 */

import { useRef, useEffect } from 'react'
import { Application, Assets, Spritesheet } from 'pixi.js'
import DokseomonSprite from './DokseomonSprite'
import { getCharacterByName, getDefaultCharacter } from './dokseomon.data'

// ─────────────────────────────────────────────
// 배치 설정
// ─────────────────────────────────────────────
const POSITION_X_RATIO = 0.77    // 가로 위치 (0.5 = 정중앙, 0.6 = 약간 오른쪽)
const GROUND_Y_RATIO = 0.87     // 세로 위치 (0.5 = 정중앙, 0.9 = 맨 아래)
const SPRITE_SIZE = 150          // 스프라이트 표시 크기 (px)

function DokseomonCanvas({ 
  characterData,
}) {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const spriteRef = useRef(null)

  // ── 캐릭터 데이터 조회 ──
  const charData = characterData 
    ? (getCharacterByName(characterData.name) || getDefaultCharacter())
    : getDefaultCharacter()

  // ── Pixi 초기화 + 리사이즈 대응 ──
  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false
    let resizeObserver = null
    const app = new Application()

    // 스프라이트를 현재 캔버스 크기에 맞게 재배치
    const repositionSprite = () => {
      const sprite = spriteRef.current
      if (!sprite || !app.screen) return

      const posX = app.screen.width * POSITION_X_RATIO
      const posY = app.screen.height * GROUND_Y_RATIO
      sprite.setPosition(posX, posY)
    }

    const init = async () => {
      try {
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        if (destroyed) return

        // 캔버스를 DOM에 추가
        const canvas = app.canvas
        containerRef.current.appendChild(canvas)
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        appRef.current = app

        // ── 초기 크기 설정 ──
        const rect = containerRef.current.getBoundingClientRect()
        app.renderer.resize(rect.width, rect.height)

        // ── ResizeObserver: 컨테이너 크기 변화 감지 ──
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect
            if (width > 0 && height > 0 && app.renderer) {
              app.renderer.resize(width, height)
              repositionSprite()
            }
          }
        })
        resizeObserver.observe(containerRef.current)

        // ── 스프라이트 시트 로드 ──
        const baseTexture = await Assets.load(charData.idlePng)

        if (destroyed) return

        const spritesheet = new Spritesheet(baseTexture, charData.idleData)
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

        // 초기 위치 배치
        repositionSprite()

      } catch (error) {
        console.error('DokseomonCanvas 초기화 실패:', error)
      }
    }

    init()

    // ── 클린업 ──
    return () => {
      destroyed = true
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
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