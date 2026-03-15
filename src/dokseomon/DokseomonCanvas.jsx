/**
 * DokseomonCanvas
 * 
 * Pixi.js 캔버스 컴포넌트 — 스프라이트 시트 idle 애니메이션 재생
 * ResizeObserver로 반응형 대응
 * 
 * Props:
 *   characterData — localStorage에서 온 독서몬 정보
 *   posX          — 가로 위치 비율 (0~1, 기본 0.5 = 중앙)
 *   posY          — 세로 위치 비율 (0~1, 기본 0.85)
 *   spriteSize    — 스프라이트 크기 px (기본 80)
 */

import { useRef, useEffect } from 'react'
import { Application, Assets, Spritesheet } from 'pixi.js'
import DokseomonSprite from './DokseomonSprite'
import { getCharacterByName, getDefaultCharacter } from './dokseomon.data'

function DokseomonCanvas({
  characterData,
  posX = 0.5,
  posY = 0.85,
  spriteSize = 80,
}) {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const spriteRef = useRef(null)

  const charData = characterData
    ? (getCharacterByName(characterData.name) || getDefaultCharacter())
    : getDefaultCharacter()

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false
    let resizeObserver = null
    const app = new Application()

    const repositionSprite = () => {
      const sprite = spriteRef.current
      if (!sprite || !app.screen) return
      sprite.setPosition(
        app.screen.width * posX,
        app.screen.height * posY
      )
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

        containerRef.current.appendChild(app.canvas)
        app.canvas.style.position = 'absolute'
        app.canvas.style.top = '0'
        app.canvas.style.left = '0'
        app.canvas.style.width = '100%'
        app.canvas.style.height = '100%'

        appRef.current = app

        const rect = containerRef.current.getBoundingClientRect()
        app.renderer.resize(rect.width, rect.height)

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

        const baseTexture = await Assets.load(charData.idlePng)
        if (destroyed) return

        const spritesheet = new Spritesheet(baseTexture, charData.idleData)
        await spritesheet.parse()
        if (destroyed) return

        const sprite = new DokseomonSprite({
          app,
          spritesheet,
          spriteSize,
          animationSpeed: 0.15,
        })

        app.stage.addChild(sprite.getContainer())
        spriteRef.current = sprite
        repositionSprite()

      } catch (error) {
        console.error('DokseomonCanvas 초기화 실패:', error)
      }
    }

    init()

    return () => {
      destroyed = true
      if (resizeObserver) {
        resizeObserver.disconnect()
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
  }, [charData.idlePng, charData.idleData, posX, posY, spriteSize])

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
