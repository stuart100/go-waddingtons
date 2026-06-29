import { useState } from 'react'
import { PLAYER_COLORS, SOUVENIR_TARGET_OPTIONS } from '../data.js'

const PRESET_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona']

export default function GameSetup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState(PRESET_NAMES.slice(0, 2))
  const [souvenirTarget, setSouvenirTarget] = useState(5)

  function handleCountChange(n) {
    setPlayerCount(n)
    setNames(prev => {
      const next = [...prev]
      while (next.length < n) next.push(PRESET_NAMES[next.length] || `Player ${next.length + 1}`)
      return next.slice(0, n)
    })
  }

  function handleName(i, val) {
    setNames(prev => prev.map((n, idx) => idx === i ? val : n))
  }

  function handleStart() {
    onStart(names, souvenirTarget)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.header}>
          <div style={styles.badge}>WADDINGTONS</div>
          <h1 style={styles.title}>Go</h1>
          <p style={styles.subtitle}>The International Travel Game</p>
          <p style={styles.year}>Est. 1961</p>
        </div>

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Number of Players</label>
            <div style={styles.btnRow}>
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  style={{ ...styles.countBtn, ...(playerCount === n ? styles.countBtnActive : {}) }}
                  onClick={() => handleCountChange(n)}
                >{n}</button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Player Names</label>
            <div style={styles.nameGrid}>
              {names.map((name, i) => (
                <div key={i} style={styles.nameRow}>
                  <div style={{ ...styles.colorDot, background: PLAYER_COLORS[i] }} />
                  <input
                    style={styles.input}
                    value={name}
                    onChange={e => handleName(i, e.target.value)}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Souvenirs to Collect (per player)</label>
            <div style={styles.btnRow}>
              {SOUVENIR_TARGET_OPTIONS.map(n => (
                <button
                  key={n}
                  style={{ ...styles.countBtn, ...(souvenirTarget === n ? styles.countBtnActive : {}) }}
                  onClick={() => setSouvenirTarget(n)}
                >{n}</button>
              ))}
            </div>
            <p style={styles.hint}>
              {souvenirTarget === 3 && 'Quick game (~30 min)'}
              {souvenirTarget === 5 && 'Standard game (~60 min)'}
              {souvenirTarget === 7 && 'Extended game (~90 min)'}
              {souvenirTarget === 10 && 'Full world tour (~120 min)'}
            </p>
          </div>

          <div style={styles.rules}>
            <h3 style={styles.rulesTitle}>How to Play</h3>
            <ul style={styles.rulesList}>
              <li>All players start in <strong>London</strong> with £300 and £50 in Traveller's Cheques.</li>
              <li>Roll the die to move around the city board. Buy tickets and exchange currency.</li>
              <li>Land on <strong>Depart</strong> with a valid ticket to begin your journey.</li>
              <li>Collect a souvenir from each city you visit.</li>
              <li>First player to collect {souvenirTarget} souvenirs <em>and</em> return to London wins!</li>
            </ul>
          </div>

          <button
            style={styles.startBtn}
            onClick={handleStart}
            disabled={names.some(n => !n.trim())}
          >
            Begin Your Journey
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'var(--board-green)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  box: {
    background: 'var(--cream)',
    borderRadius: '12px',
    border: '3px solid var(--gold)',
    maxWidth: '520px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  header: {
    background: 'var(--board-green)',
    borderRadius: '9px 9px 0 0',
    padding: '24px',
    textAlign: 'center',
    borderBottom: '3px solid var(--gold)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '11px',
    letterSpacing: '3px',
    color: 'var(--gold)',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '52px',
    fontStyle: 'italic',
    color: 'var(--gold)',
    lineHeight: 1,
  },
  subtitle: {
    color: 'var(--cream)',
    fontSize: '14px',
    letterSpacing: '1px',
    marginTop: '4px',
  },
  year: {
    color: 'var(--gold)',
    fontSize: '11px',
    marginTop: '6px',
    opacity: 0.7,
  },
  form: { padding: '24px' },
  field: { marginBottom: '22px' },
  label: {
    display: 'block',
    fontFamily: 'Playfair Display, serif',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-dark)',
    marginBottom: '10px',
  },
  btnRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  countBtn: {
    width: '44px', height: '44px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '6px',
    background: 'white',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-mid)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  countBtnActive: {
    background: 'var(--gold)',
    borderColor: 'var(--gold)',
    color: 'var(--text-dark)',
  },
  nameGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  colorDot: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
  input: {
    flex: 1, padding: '8px 12px',
    border: '1px solid var(--cream-dark)',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'white',
    color: 'var(--text-dark)',
  },
  hint: { marginTop: '6px', fontSize: '12px', color: 'var(--text-mid)', fontStyle: 'italic' },
  rules: {
    background: '#f9f4e8',
    border: '1px solid var(--cream-dark)',
    borderRadius: '6px',
    padding: '14px 16px',
    marginBottom: '22px',
  },
  rulesTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
    color: 'var(--text-dark)',
  },
  rulesList: {
    paddingLeft: '18px',
    display: 'flex', flexDirection: 'column', gap: '5px',
    fontSize: '13px', lineHeight: 1.5, color: 'var(--text-mid)',
  },
  startBtn: {
    width: '100%', padding: '14px',
    background: 'var(--board-green)',
    color: 'var(--gold)',
    border: '2px solid var(--gold)',
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '0.5px',
  },
}
