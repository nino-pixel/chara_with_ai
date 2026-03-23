import { useCallback, useEffect, useRef, useState } from 'react'
import { HiHeart, HiOutlineHeart } from 'react-icons/hi'
import { toggleSavedProperty } from '../data/savedPropertiesStorage'
import { trackEvent } from '../services/analyticsService'
import { useSavedPropertyIds } from '../hooks/useSavedProperties'
import './SavePropertyButton.css'

type Props = {
  propertyId: string
  variant?: 'card' | 'detail'
  /** Fired after toggle; `true` = now saved */
  onToggle?: (nowSaved: boolean) => void
}

export default function SavePropertyButton({ propertyId, variant = 'card', onToggle }: Props) {
  const ids = useSavedPropertyIds()
  const saved = ids.includes(propertyId)
  const [pop, setPop] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (popTimer.current) clearTimeout(popTimer.current)
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const nowSaved = toggleSavedProperty(propertyId)
      trackEvent(nowSaved ? 'property_save' : 'property_unsave', { propertyId })
      onToggle?.(nowSaved)
      if (popTimer.current) clearTimeout(popTimer.current)
      setPop(true)
      popTimer.current = setTimeout(() => {
        setPop(false)
        popTimer.current = null
      }, 360)

      if (variant === 'card') {
        if (flashTimer.current) clearTimeout(flashTimer.current)
        if (nowSaved) {
          setSavedFlash(true)
          flashTimer.current = setTimeout(() => {
            setSavedFlash(false)
            flashTimer.current = null
          }, 1400)
        } else {
          setSavedFlash(false)
        }
      }
    },
    [propertyId, onToggle, variant]
  )

  const button = (
    <button
      type="button"
      className={`save-property-btn save-property-btn--${variant} ${saved ? 'save-property-btn--saved' : ''} ${pop ? 'save-property-btn--just-toggled' : ''}`}
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved properties' : 'Save property'}
      aria-pressed={saved}
    >
      {saved ? (
        <HiHeart className="save-property-btn-icon" aria-hidden />
      ) : (
        <HiOutlineHeart className="save-property-btn-icon" aria-hidden />
      )}
    </button>
  )

  if (variant === 'card') {
    return (
      <span className="save-property-card-slot">
        {button}
        {savedFlash ? (
          <span className="save-property-saved-toast" role="status">
            Saved
          </span>
        ) : null}
      </span>
    )
  }

  return button
}
