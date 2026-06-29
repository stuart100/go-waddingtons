import { CITIES, CURRENCIES, REMOTE_LOCATIONS, ROUTES as AllRoutes } from '../data.js'

const TRANSPORT_COLORS = { air: '#c0392b', sea: '#2471a3', rail: '#6c3483', road: '#d35400' }

export default function PlayerPanel({ players, currentPlayerIndex, souvenirTarget }) {
  return (
    <div style={s.panel}>
      <div style={s.heading}>Players</div>
      <div style={s.list}>
        {players.map((p, i) => (
          <PlayerCard key={p.id} player={p} isActive={i === currentPlayerIndex} souvenirTarget={souvenirTarget} />
        ))}
      </div>
    </div>
  )
}

function PlayerCard({ player, isActive, souvenirTarget }) {
  const { state, wallet, souvenirs, travellersChecques, tickets, missedTurns } = player

  const locationLabel = (() => {
    if (state.type === 'city') {
      return CITIES[state.cityId]?.name || state.cityId
    }
    if (state.type === 'traveling') {
      const pct = state.distance > 0 ? Math.round((state.progress / state.distance) * 100) : 0
      return `${CITIES[state.from]?.name} → ${CITIES[state.to]?.name} (${pct}%)`
    }
    if (state.type === 'diverted') {
      const loc = REMOTE_LOCATIONS[state.location]?.name || state.location
      return `Stranded: ${loc} (${state.missedTurns}t)`
    }
    return '—'
  })()

  const totalGBP = wallet.GBP + travellersChecques +
    Object.entries(wallet)
      .filter(([k]) => k !== 'GBP')
      .reduce((sum, [k, v]) => sum + v / CURRENCIES[k].rate, 0)

  const nonZeroWallet = Object.entries(wallet).filter(([, v]) => v > 0)
  const collectedSouvenirs = souvenirs.filter(id => id !== 'london')

  return (
    <div style={{ ...s.card, borderColor: isActive ? player.color : 'rgba(255,255,255,0.1)', borderWidth: isActive ? 2 : 1 }}>
      <div style={s.cardTop}>
        <div style={{ ...s.colorBar, background: player.color }} />
        <span style={{ ...s.name, color: isActive ? player.color : 'var(--cream)' }}>{player.name}</span>
        {isActive && <span style={s.activePip}>●</span>}
      </div>

      <div style={s.body}>
        <Row label="Location" value={locationLabel} />

        {state.type === 'traveling' && (
          <div style={s.progressWrap}>
            <div style={{ ...s.progressBar, width: `${Math.round((state.progress / state.distance) * 100)}%`, background: player.color }} />
          </div>
        )}

        <Row
          label="Souvenirs"
          value={
            <span>
              {collectedSouvenirs.length}/{souvenirTarget}
              {'  '}
              {collectedSouvenirs.map(id => (
                <span key={id} title={CITIES[id]?.name} style={{ color: 'var(--gold)', fontSize: '10px' }}>★</span>
              ))}
            </span>
          }
        />

        <div style={s.walletWrap}>
          <div style={s.sectionHead}>Wallet</div>
          {travellersChecques > 0 && (
            <div style={s.moneyRow}>
              <span style={s.curCode}>T/Cheques</span>
              <span style={s.amt}>£{travellersChecques}</span>
            </div>
          )}
          {nonZeroWallet.map(([code, amount]) => (
            <div key={code} style={s.moneyRow}>
              <span style={s.curCode}>{code}</span>
              <span style={s.amt}>{CURRENCIES[code].symbol}{Math.round(amount)}</span>
            </div>
          ))}
          <div style={{ ...s.moneyRow, marginTop: 3, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={s.curCode}>≈ Total</span>
            <span style={{ ...s.amt, color: 'var(--gold)' }}>£{Math.round(totalGBP)}</span>
          </div>
        </div>

        {tickets.length > 0 && (
          <div style={s.walletWrap}>
            <div style={s.sectionHead}>Tickets</div>
            {tickets.map(tid => <TicketChip key={tid} ticketId={tid} />)}
          </div>
        )}

        {missedTurns > 0 && (
          <div style={s.flag}>⚠ Miss {missedTurns} turn{missedTurns > 1 ? 's' : ''}</div>
        )}
        {player.halfFareNext && (
          <div style={{ ...s.flag, background: 'rgba(201,162,39,0.12)', borderColor: 'var(--gold)', color: 'var(--gold)' }}>
            ★ Half-fare next ticket
          </div>
        )}
        {player.nextJourneySafe && (
          <div style={{ ...s.flag, background: 'rgba(26,107,58,0.2)', borderColor: '#1a6b3a', color: '#2ecc71' }}>
            ✓ Next journey safe
          </div>
        )}
      </div>
    </div>
  )
}

function TicketChip({ ticketId }) {
  const route = AllRoutes.find(r => r.id === ticketId || r.id + '_rev' === ticketId)
  if (!route) return null
  const destCity = CITIES[route.to]
  if (!destCity) return null
  return (
    <div style={s.chip}>
      <span style={{ ...s.typeBadge, background: TRANSPORT_COLORS[route.type] || '#555' }}>
        {route.type[0].toUpperCase()}
      </span>
      <span style={s.chipDest}>→ {destCity.name}</span>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={s.row}>
      <span style={s.lbl}>{label}</span>
      <span style={s.val}>{value}</span>
    </div>
  )
}

const s = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--board-mid)', borderLeft: '2px solid rgba(255,255,255,0.08)' },
  heading: { fontFamily: 'Playfair Display, serif', fontSize: '11px', fontWeight: 700, color: 'var(--gold)', padding: '9px 12px 7px', borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: '2px', textTransform: 'uppercase' },
  list: { flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' },
  card: { border: '1px solid', borderRadius: '6px', background: 'rgba(0,0,0,0.25)', overflow: 'hidden' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: '30px' },
  colorBar: { width: '4px', alignSelf: 'stretch' },
  name: { fontWeight: 700, fontSize: '13px', padding: '6px 7px', flex: 1 },
  activePip: { color: '#2ecc71', fontSize: '8px', paddingRight: '8px' },
  body: { padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: '3px' },
  row: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', padding: '1px 0' },
  lbl: { fontSize: '10px', color: 'var(--cream)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  val: { fontSize: '12px', color: 'var(--cream)', textAlign: 'right' },
  progressWrap: { height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '2px 0' },
  progressBar: { height: '100%', borderRadius: '2px', transition: 'width 0.3s', minWidth: '4px' },
  walletWrap: { paddingTop: '5px', marginTop: '3px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  sectionHead: { fontSize: '9px', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' },
  moneyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 0' },
  curCode: { fontSize: '10px', color: 'var(--cream)', opacity: 0.55 },
  amt: { fontSize: '12px', color: 'var(--cream)', fontWeight: 600 },
  chip: { display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', padding: '2px 5px', marginBottom: '2px', fontSize: '11px', color: 'var(--cream)' },
  typeBadge: { padding: '1px 4px', borderRadius: '2px', color: 'white', fontSize: '9px', fontWeight: 700 },
  chipDest: {},
  flag: { margin: '3px 0 0', padding: '3px 6px', borderRadius: '3px', fontSize: '11px', border: '1px solid rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.08)', color: '#faa' },
}
