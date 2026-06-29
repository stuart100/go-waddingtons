export default function CardModal({ pendingCard, onAcknowledge }) {
  if (!pendingCard) return null
  const { card, deckType } = pendingCard
  const isLuck = deckType === 'luck'

  return (
    <div style={s.overlay} onClick={onAcknowledge}>
      <div style={{ ...s.modal, borderColor: isLuck ? '#c9a227' : '#922b21' }} onClick={e => e.stopPropagation()}>
        <div style={{ ...s.header, background: isLuck ? '#7d5a00' : '#6b0000' }}>
          <div style={s.deckLabel}>{isLuck ? '★ Luck Card' : '⚠ Risk Card'}</div>
        </div>
        <div style={s.body}>
          <div style={{ ...s.title, color: isLuck ? '#7d5a00' : '#8b0000' }}>{card.title}</div>
          <p style={s.desc}>{card.desc}</p>
          <div style={s.effectRow}>
            <EffectSummary effect={card.effect} isLuck={isLuck} />
          </div>
        </div>
        <div style={s.footer}>
          <button
            style={{ ...s.btn, background: isLuck ? '#c9a227' : '#922b21', color: 'white' }}
            onClick={onAcknowledge}
          >
            {isLuck ? 'Collect & Continue' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EffectSummary({ effect, isLuck }) {
  const color = isLuck ? '#7d5a00' : '#8b0000'
  const bg = isLuck ? '#fff8e1' : '#fce8e8'

  const text = (() => {
    switch (effect.type) {
      case 'collect_gbp': return `+£${effect.amount}`
      case 'collect_cheques': return `+£${effect.amount} Traveller's Cheques`
      case 'half_fare_next': return 'Next ticket at half price'
      case 'next_journey_safe': return 'Next journey: no hazards'
      case 'double_journey_progress': return 'Journey speed doubled'
      case 'advance_journey': return `Advance ${effect.amount} spaces`
      case 'pay_gbp': return `-£${effect.amount}`
      case 'pay_and_miss': return `-£${effect.gbpAmount} + Miss ${effect.missedTurns} turn${effect.missedTurns > 1 ? 's' : ''}`
      case 'miss_turns': return `Miss ${effect.amount} turn${effect.amount > 1 ? 's' : ''}`
      case 'divert': return `Diverted! Miss ${effect.missedTurns} turns`
      case 'return_to_last_city': return 'Return to previous city'
      case 'lose_souvenir': return 'Lose 1 souvenir'
      case 'lose_journey_progress': return `Lose ${effect.amount} spaces of progress`
      default: return effect.type
    }
  })()

  return (
    <div style={{ ...s.effectBadge, color, background: bg }}>
      {text}
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    width: '340px',
    border: '3px solid',
    borderRadius: '10px',
    background: 'var(--cream)',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
    fontFamily: 'Source Sans 3, sans-serif',
  },
  header: { padding: '12px 18px' },
  deckLabel: {
    fontSize: '12px', fontWeight: 700, color: 'white',
    textTransform: 'uppercase', letterSpacing: '2px',
  },
  body: { padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '20px', fontWeight: 700, lineHeight: 1.2,
  },
  desc: {
    fontSize: '14px', lineHeight: 1.6,
    color: 'var(--text-mid)',
  },
  effectRow: {},
  effectBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '14px',
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid var(--cream-dark)',
    display: 'flex', justifyContent: 'flex-end',
  },
  btn: {
    padding: '10px 24px', borderRadius: '5px',
    fontFamily: 'Playfair Display, serif',
    fontSize: '14px', fontStyle: 'italic',
    border: 'none', cursor: 'pointer',
    fontWeight: 700,
  },
}
