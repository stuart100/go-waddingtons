import { useReducer, useState } from 'react'
import GameSetup from './components/GameSetup.jsx'
import WorldMap from './components/WorldMap.jsx'
import CityView from './components/CityView.jsx'
import PlayerPanel from './components/PlayerPanel.jsx'
import GameLog from './components/GameLog.jsx'
import CardModal from './components/CardModal.jsx'
import WinModal from './components/WinModal.jsx'
import { reducer as gameReducer, createInitialState } from './game.js'
import { CITIES, REMOTE_LOCATIONS } from './data.js'

function appReducer(state, action) {
  if (action.type === '__INIT') return action.state
  if (!state) return state
  return gameReducer(state, action)
}

export default function App() {
  const [gameState, dispatch] = useReducer(appReducer, null)
  const [showSetup, setShowSetup] = useState(true)

  function handleStart(playerNames, souvenirTarget) {
    const initial = createInitialState(playerNames, souvenirTarget)
    dispatch({ type: '__INIT', state: initial })
    setShowSetup(false)
  }

  function handleRestart() {
    setShowSetup(true)
    dispatch({ type: '__INIT', state: null })
  }

  if (showSetup || !gameState) {
    return <GameSetup onStart={handleStart} />
  }

  return <GameBoard state={gameState} dispatch={dispatch} onRestart={handleRestart} />
}

function GameBoard({ state, dispatch, onRestart }) {
  const currentPlayer = state.players[state.currentPlayerIndex]
  const isInCity = currentPlayer.state.type === 'city'
  const isTraveling = currentPlayer.state.type === 'traveling'
  const isDiverted = currentPlayer.state.type === 'diverted'

  const highlightRoute = isTraveling ? {
    from: currentPlayer.state.from,
    to: currentPlayer.state.to,
    type: currentPlayer.state.transport,
  } : null

  const canRoll = state.turnPhase === 'roll'
  const canEndTurn = state.turnPhase === 'free'
  const showCardModal = state.turnPhase === 'card' && !!state.pendingCard

  const turnSummary = () => {
    if (state.phase === 'won') return `${state.players[state.winner].name} wins!`
    if (state.turnPhase === 'card') return 'A card has been drawn…'
    if (canRoll) {
      if (currentPlayer.missedTurns > 0) return `${currentPlayer.name} misses a turn`
      if (isDiverted) return `${currentPlayer.name} is stranded!`
      if (isTraveling) return `${currentPlayer.name} — roll to advance your journey`
      return `${currentPlayer.name}'s turn — roll the die`
    }
    if (canEndTurn) return `${currentPlayer.name} — take action or end turn`
    return `${currentPlayer.name}'s turn`
  }

  return (
    <div style={layout.root}>
      {/* Top bar */}
      <div style={layout.topBar}>
        <div style={layout.brand}>
          <span style={layout.brandItalic}>Go</span>
          <span style={layout.brandSub}>The International Travel Game</span>
        </div>

        <div style={layout.turnBadge}>
          <div style={{ ...layout.dot, background: currentPlayer.color }} />
          <span style={layout.turnText}>{turnSummary()}</span>
          {state.diceResult && (
            <span style={layout.diceChip}>🎲 {state.diceResult}</span>
          )}
        </div>

        <div style={layout.btnGroup}>
          {canRoll && (
            <button style={layout.rollBtn} onClick={() => dispatch({ type: 'ROLL_DICE' })}>
              Roll Dice
            </button>
          )}
          {canEndTurn && (
            <button style={layout.endBtn} onClick={() => dispatch({ type: 'END_TURN' })}>
              End Turn
            </button>
          )}
          <button style={layout.iconBtn} onClick={onRestart} title="New Game">↺</button>
        </div>
      </div>

      {/* Body */}
      <div style={layout.body}>
        {/* Main board area */}
        <div style={layout.boardArea}>
          {isInCity ? (
            <CityView
              player={currentPlayer}
              dispatch={dispatch}
              turnPhase={state.turnPhase}
            />
          ) : (
            <div style={layout.mapContainer}>
              <WorldMap
                players={state.players}
                currentPlayerIndex={state.currentPlayerIndex}
                highlightRoute={highlightRoute}
              />
              {(isTraveling || isDiverted) && (
                <JourneyOverlay player={currentPlayer} />
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={layout.sidebar}>
          <PlayerPanel
            players={state.players}
            currentPlayerIndex={state.currentPlayerIndex}
            souvenirTarget={state.souvenirTarget}
          />
        </div>
      </div>

      {/* Log strip */}
      <div style={layout.logStrip}>
        <GameLog log={state.log} />
      </div>

      {/* Modals */}
      {showCardModal && (
        <CardModal
          pendingCard={state.pendingCard}
          onAcknowledge={() => dispatch({ type: 'ACKNOWLEDGE_CARD' })}
        />
      )}
      {state.phase === 'won' && state.winner !== null && (
        <WinModal
          winner={state.winner}
          players={state.players}
          souvenirTarget={state.souvenirTarget}
          onRestart={onRestart}
        />
      )}
    </div>
  )
}

function JourneyOverlay({ player }) {
  const { state } = player

  if (state.type === 'diverted') {
    const loc = REMOTE_LOCATIONS[state.location]
    return (
      <div style={ov.box}>
        <div style={ov.label}>⚠ Diverted</div>
        <div style={ov.title}>{loc?.name || state.location}</div>
        <div style={ov.sub}>Stranded for {state.missedTurns} more turn{state.missedTurns !== 1 ? 's' : ''}</div>
      </div>
    )
  }

  if (state.type === 'traveling') {
    const pct = state.distance > 0 ? Math.round((state.progress / state.distance) * 100) : 0
    const fromName = CITIES[state.from]?.name || state.from
    const toName = CITIES[state.to]?.name || state.to
    return (
      <div style={ov.box}>
        <div style={ov.label}>{state.transport.toUpperCase()} JOURNEY</div>
        <div style={ov.title}>{fromName} → {toName}</div>
        <div style={ov.track}>
          <div style={{ ...ov.fill, width: `${pct}%`, background: player.color }} />
        </div>
        <div style={ov.sub}>{state.progress} / {state.distance} spaces ({pct}%)</div>
      </div>
    )
  }

  return null
}

const ov = {
  box: {
    position: 'absolute', bottom: 14, left: 14,
    background: 'rgba(10,26,44,0.88)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '8px', padding: '10px 14px', minWidth: '210px',
  },
  label: { fontSize: '9px', color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' },
  title: { fontSize: '14px', color: 'var(--cream)', fontWeight: 700, marginBottom: '6px' },
  sub: { fontSize: '11px', color: 'var(--cream)', opacity: 0.6, marginTop: '5px' },
  track: { height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' },
  fill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s', minWidth: '4px' },
}

const layout = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--board-green)', overflow: 'hidden' },
  topBar: {
    height: '50px', flexShrink: 0,
    background: '#122012',
    borderBottom: '2px solid var(--gold)',
    display: 'flex', alignItems: 'center', padding: '0 14px', gap: '16px',
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: '8px', flexShrink: 0 },
  brandItalic: { fontFamily: 'Playfair Display, serif', fontSize: '24px', fontStyle: 'italic', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 },
  brandSub: { fontSize: '11px', color: 'var(--cream)', opacity: 0.55, letterSpacing: '0.5px' },
  turnBadge: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  turnText: { fontSize: '13px', color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  diceChip: {
    background: 'rgba(201,162,39,0.18)',
    border: '1px solid var(--gold)',
    borderRadius: '10px', padding: '2px 8px',
    fontSize: '12px', color: 'var(--gold)', fontWeight: 700, flexShrink: 0,
  },
  btnGroup: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  rollBtn: {
    padding: '8px 22px',
    background: 'var(--gold)', color: '#1a0f00',
    border: 'none', borderRadius: '4px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
    fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
    letterSpacing: '0.3px',
    transition: 'filter 0.15s',
  },
  endBtn: {
    padding: '7px 14px',
    background: 'transparent', color: 'var(--cream)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  iconBtn: {
    width: '32px', height: '32px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: 'var(--cream)', fontSize: '16px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  boardArea: { flex: 1, overflow: 'hidden', position: 'relative' },
  mapContainer: { width: '100%', height: '100%', position: 'relative' },
  sidebar: { width: '215px', flexShrink: 0, overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.08)' },
  logStrip: { height: '88px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)' },
}
