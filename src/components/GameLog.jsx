export default function GameLog({ log }) {
  return (
    <div style={s.wrap}>
      <div style={s.head}>Game Log</div>
      <div style={s.entries}>
        {log.map((entry, i) => (
          <div key={i} style={{ ...s.entry, opacity: i === 0 ? 1 : Math.max(0.35, 1 - i * 0.06) }}>
            {i === 0 && <span style={s.bullet}>▶</span>}
            {entry}
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  wrap: {
    height: '100%', display: 'flex', flexDirection: 'column',
    background: 'rgba(0,0,0,0.25)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  head: {
    fontSize: '9px', letterSpacing: '2px', color: 'var(--gold)',
    textTransform: 'uppercase', fontWeight: 600,
    padding: '5px 12px 3px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  entries: { overflowY: 'auto', flex: 1, padding: '5px 12px', scrollbarWidth: 'thin' },
  entry: {
    fontSize: '12px', lineHeight: 1.4, color: 'var(--cream)',
    padding: '2px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    display: 'flex', alignItems: 'flex-start', gap: '5px',
  },
  bullet: { color: 'var(--gold)', fontSize: '8px', flexShrink: 0, paddingTop: '3px' },
}
