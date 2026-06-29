import { CITIES } from '../data.js'

export default function WinModal({ winner, players, souvenirTarget, onRestart }) {
  if (winner === null || winner === undefined) return null
  const player = players[winner]

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.banner}>
          <div style={s.trophy}>🏆</div>
          <div style={s.headline}>Winner!</div>
        </div>
        <div style={s.body}>
          <div style={{ ...s.winnerName, color: player.color }}>{player.name}</div>
          <p style={s.sub}>has returned to London with {souvenirTarget} souvenirs!</p>
          <div style={s.souvenirs}>
            {player.souvenirs.filter(id => id !== 'london').slice(0, souvenirTarget).map(id => (
              <div key={id} style={s.suvChip}>
                <span style={{ color: 'var(--gold)' }}>★</span>
                {' '}{CITIES[id]?.name || id}
              </div>
            ))}
          </div>
        </div>
        <div style={s.footer}>
          <button style={s.btn} onClick={onRestart}>New Game</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { width: '380px', background: 'var(--cream)', borderRadius: '12px', border: '3px solid var(--gold)', overflow: 'hidden', boxShadow: '0 12px 60px rgba(0,0,0,0.8)' },
  banner: { background: 'var(--board-green)', padding: '24px', textAlign: 'center', borderBottom: '3px solid var(--gold)' },
  trophy: { fontSize: '52px', lineHeight: 1 },
  headline: { fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--gold)', fontStyle: 'italic', marginTop: '6px' },
  body: { padding: '22px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' },
  winnerName: { fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700 },
  sub: { color: 'var(--text-mid)', fontSize: '15px' },
  souvenirs: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '8px' },
  suvChip: { background: '#f9f4e8', border: '1px solid var(--cream-dark)', borderRadius: '4px', padding: '4px 10px', fontSize: '13px', color: 'var(--text-dark)' },
  footer: { padding: '14px 20px', borderTop: '1px solid var(--cream-dark)', display: 'flex', justifyContent: 'center' },
  btn: {
    padding: '12px 36px', borderRadius: '6px',
    background: 'var(--board-green)', color: 'var(--gold)',
    border: '2px solid var(--gold)',
    fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
    fontSize: '16px', cursor: 'pointer',
  },
}
