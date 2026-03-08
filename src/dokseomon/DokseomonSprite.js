/**
 * DokseomonSprite
 * 
 * 하나의 독서몬 캐릭터를 Pixi AnimatedSprite로 관리하는 클래스입니다.
 * TexturePacker PixiJS 포맷의 스프라이트 시트를 재생합니다.
 * 
 * 사용법:
 *   const sprite = new DokseomonSprite({ app, spritesheet, spriteSize })
 *   sprite.setPosition(100, 300)
 *   sprite.destroy()
 */

import { Container, AnimatedSprite } from 'pixi.js'

export default class DokseomonSprite {
  /**
   * @param {object} options
   * @param {Application} options.app - Pixi Application 인스턴스
   * @param {Spritesheet} options.spritesheet - 로드된 스프라이트 시트
   * @param {number} options.spriteSize - 표시 크기 (px, 기본 80)
   * @param {number} options.animationSpeed - 재생 속도 (기본 0.15)
   */
  constructor({ app, spritesheet, spriteSize = 80, animationSpeed = 0.15 }) {
    this.app = app
    this.spriteSize = spriteSize

    // ── Pixi 오브젝트 생성 ──
    this.container = new Container()

    // 스프라이트 시트에서 텍스처 배열 추출
    // TexturePacker PixiJS 포맷: spritesheet.animations 또는 spritesheet.textures
    let textures = []

    if (spritesheet.animations) {
      // animations 객체에서 첫 번째 애니메이션 가져오기
      const animKeys = Object.keys(spritesheet.animations)
      if (animKeys.length > 0) {
        textures = spritesheet.animations[animKeys[0]]
      }
    }

    // animations가 없으면 textures에서 직접 가져오기
    if (textures.length === 0 && spritesheet.textures) {
      const textureKeys = Object.keys(spritesheet.textures)
      // 프레임 이름순으로 정렬 (frame_0001, frame_0002, ...)
      textureKeys.sort()
      textures = textureKeys.map(key => spritesheet.textures[key])
    }

    if (textures.length === 0) {
      console.error('DokseomonSprite: 스프라이트 시트에서 텍스처를 찾을 수 없습니다')
      return
    }

    // AnimatedSprite 생성
    this.animSprite = new AnimatedSprite(textures)
    this.animSprite.anchor.set(0.5, 1.0)  // 발 기준 앵커
    this.animSprite.width = spriteSize
    this.animSprite.height = spriteSize
    this.animSprite.animationSpeed = animationSpeed
    this.animSprite.loop = true
    this.animSprite.play()

    this.container.addChild(this.animSprite)
  }

  // ─────────────────────────────────────────────
  // Public 메서드
  // ─────────────────────────────────────────────

  /** 위치 설정 (px 단위) */
  setPosition(x, y) {
    this.container.x = x
    this.container.y = y
  }

  /** 컨테이너 반환 (부모에 addChild 할 때 사용) */
  getContainer() {
    return this.container
  }

  /** 재생 속도 변경 */
  setAnimationSpeed(speed) {
    if (this.animSprite) {
      this.animSprite.animationSpeed = speed
    }
  }

  /** 정리 (컴포넌트 언마운트 시 호출) */
  destroy() {
    if (this.animSprite) {
      this.animSprite.stop()
    }
    this.container.destroy({ children: true })
  }
}
