import { useState } from 'react'
import {
  CITIES, CITY_SQUARES, SQUARE_TYPES, ROUTES as AllRoutes,
  CURRENCIES as AllCurrencies, getRoutesForCity, gbpToLocal,
} from '../data.js'

const SQ = SQUARE_TYPES

const SQUARE_META = {
  [SQ.HOTEL]:       { bg: '#2c5f2e', color: '#f5edd6', icon: '⌂' },
  [SQ.BANK]:        { bg: '#1a4b6e', color: '#f5edd6', icon: '₤' },
  [SQ.BUREAU]:      { bg: '#1f5a82', color: '#f5edd6', icon: '⇄' },
  [SQ.THOMAS_COOK]: { bg: '#b8860b', color: '#fff8e1', icon: 'TC' },
  [SQ.SOUVENIR]:    { bg: '#7d3c98', color: '#f5edd6', icon: '★' },
  [SQ.AIR_TICKET]:  { bg: '#c0392b', color: '#f5edd6', icon: '✈' },
  [SQ.SEA_TICKET]:  { bg: '#2471a3', color: '#f5edd6', icon: '⚓' },
  [SQ.RAIL_TICKET]: { bg: '#6c3483', color: '#f5edd6', icon: '⊗' },
  [SQ.ROAD_TICKET]: { bg: '#d35400', color: '#f5edd6', icon: '⊕' },
  [SQ.LUCK_CARD]:   { bg: '#1a6b3a', color: '#f5edd6', icon: '?' },
  [SQ.CUSTOMS]:     { bg: '#922b21', color: '#f5edd6', icon: '!' },
  [SQ.CASINO]:      { bg: '#1a1a2e', color: '#f1c40f', icon: '♠' },
  [SQ.HOSPITAL]:    { bg: '#bfbfbf', color: '#c0392b', icon: '+' },
  [SQ.DEPART]:      { bg: '#c9a227', color: '#1a1a1a', icon: '>' },
}

const TRANSPORT_COLORS = { air: '#c0392b', sea: '#2471a3', rail: '#6c3483', road: '#d35400' }

export default function CityView({ player, dispatch, turnPhase }) {
  const { state } = player
  if (state.type !== 'city') return null

  const city = CITIES[state.cityId]
  const squares = CITY_SQUARES[state.cityId]
  const currentSq = squares[state.squareIndex]
  const currency = AllCurrencies[city.currency]
  const canAct = turnPhase === 'free'

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={s.cityName}>{city.name}</div>
          <div style={s.currSub}>Currency: {currency.name} ({currency.symbol})</div>
        </div>
        <div style={{ ...s.playerChip, borderColor: player.color }}>
          <div style={{ ...s.dot, background: player.color }} />
          {player.name}
        </div>
      </div>

      {/* Outer ring track */}
      <div style={s.trackWrap}>
        <div style={s.trackLabel}>OUTER BOARD — {city.name.toUpperCase()}</div>
        <div style={s.track}>
          {squares.map((sq, idx) => {
            const meta = SQUARE_META[sq.type] || { bg: '#444', color: '#fff', icon: '?' }
            const isCur = idx === state.squareIndex
            return (
              <div
                key={idx}
                title={sq.desc}
                style={{
                  ...s.square,
                  background: meta.bg,
                  color: meta.color,
                  boxShadow: isCur ? `0 0 0 3px white, 0 0 0 5px ${player.color}` : 'none',
                  transform: isCur ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isCur ? 2 : 1,
                }}
              >
                <div style={s.sqIcon}>{meta.icon}</div>
                <div style={s.sqLabel}>{sq.label}</div>
                {isCur && <div style={s.sqCaret}>▲</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action area */}
      <div style={s.actions}>
        <div style={s.sqHeader}>
          <span style={{ ...s.sqTag, background: (SQUARE_META[currentSq.type] || {}).bg || '#555' }}>
            {(SQUARE_META[currentSq.type] || {}).icon} {currentSq.label}
          </span>
          <span style={s.sqDesc}>{currentSq.desc}</span>
        </div>

        {canAct && currentSq.type === SQ.SOUVENIR &&
          <SouvenirPanel player={player} city={city} currency={currency} dispatch={dispatch} />}

        {canAct && currentSq.type === SQ.DEPART &&
          <DepartPanel player={player} city={city} dispatch={dispatch} />}

        {canAct && [SQ.BANK, SQ.BUREAU, SQ.THOMAS_COOK].includes(currentSq.type) &&
          <ExchangePanel player={player} city={city} dispatch={dispatch} />}

        {canAct && [SQ.AIR_TICKET, SQ.SEA_TICKET, SQ.RAIL_TICKET, SQ.ROAD_TICKET, SQ.THOMAS_COOK].includes(currentSq.type) &&
          <TicketPanel player={player} city={city} dispatch={dispatch} squareType={currentSq.type} />}
      </div>
    </div>
  )
}

function SouvenirPanel({ player, city, currency, dispatch }) {
  const already = player.souvenirs.includes(city.id)
  const localCost = Math.round(15 * currency.rate)
  const hasLocal = (player.wallet[city.currency] || 0) >= localCost
  const hasGBP = (player.wallet.GBP || 0) >= 15
  const hasCheques = player.travellersChecques >= 15
  const canAfford = hasLocal || hasGBP || hasCheques
  if (city.id === 'london') return <Info>London is your home city — no souvenir needed here.</Info>
  if (already) return <Info>You already have a souvenir from {city.name}.</Info>
  const payMethod = hasLocal ? `${currency.symbol}${localCost}` : hasGBP ? '£15 GBP' : '£15 T/Cheques'
  return (
    <div style={s.actionBody}>
      <p style={s.p}>Buy a souvenir of {city.name} for <strong>{currency.symbol}{localCost}</strong> (≈ £15).</p>
      <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'BUY_SOUVENIR' })} disabled={!canAfford}>
        Buy Souvenir ({payMethod})
      </button>
      {!canAfford && <span style={s.warn}>Need local currency, GBP, or traveller's cheques.</span>}
    </div>
  )
}

function DepartPanel({ player, city, dispatch }) {
  if (player.tickets.length === 0) return <Info>No tickets held. Buy a ticket before departing.</Info>
  return (
    <div style={s.actionBody}>
      <p style={s.p}>Depart {city.name} using one of your tickets:</p>
      {player.tickets.map(tid => {
        const route = AllRoutes.find(r => r.id === tid || r.id + '_rev' === tid)
        if (!route) return null
        const destId = route.from === city.id ? route.to : route.from
        const destCity = CITIES[destId]
        if (!destCity) return null
        return (
          <div key={tid} style={s.ticketRow}>
            <span style={{ ...s.typeBadge, background: TRANSPORT_COLORS[route.type] }}>{route.type.toUpperCase()}</span>
            <span style={s.dest}>→ {destCity.name}</span>
            <span style={s.dist}>{route.distance} spaces</span>
            <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'DEPART', ticketId: tid })}>Depart</button>
          </div>
        )
      })}
    </div>
  )
}

function ExchangePanel({ player, city, dispatch }) {
  const localCur = city.currency
  const heldCurrencies = Object.keys(AllCurrencies).filter(k => (player.wallet[k] || 0) > 0)
  const defaultFrom = heldCurrencies.includes(localCur) ? localCur : (heldCurrencies[0] || 'GBP')
  const [fromCur, setFromCur] = useState(() => defaultFrom)
  const [amount, setAmount] = useState('')

  const balance = player.wallet[fromCur] || 0
  const toOptions = Object.keys(AllCurrencies).filter(k => k !== fromCur)
  const defaultTo = fromCur !== localCur ? localCur : (toOptions[0] || 'USD')
  const [to, setTo] = useState(() => defaultTo)
  const effectiveTo = toOptions.includes(to) ? to : toOptions[0]

  const gbpEquiv = Number(amount) / AllCurrencies[fromCur].rate
  const toAmount = Math.round(gbpEquiv * AllCurrencies[effectiveTo].rate)
  const canExchange = Number(amount) > 0 && Number(amount) <= balance

  if (heldCurrencies.length === 0) return <Info>No currency to exchange.</Info>

  function handleFromChange(newFrom) {
    setFromCur(newFrom)
    setAmount('')
    if (newFrom !== localCur && effectiveTo !== localCur) setTo(localCur)
  }

  return (
    <div style={s.actionBody}>
      <div style={s.row}>
        <select style={s.sel} value={fromCur} onChange={e => handleFromChange(e.target.value)}>
          {heldCurrencies.map(k => (
            <option key={k} value={k}>{AllCurrencies[k].name} ({AllCurrencies[k].symbol}{Math.round(player.wallet[k])})</option>
          ))}
        </select>
        <input
          type="number" min="0" max={Math.floor(balance)} style={s.numIn}
          value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount"
        />
        <span style={s.arrowText}>→</span>
        <select style={s.sel} value={effectiveTo} onChange={e => setTo(e.target.value)}>
          {toOptions.map(k => <option key={k} value={k}>{AllCurrencies[k].name}</option>)}
        </select>
      </div>
      {amount && <div style={s.preview}>≈ {AllCurrencies[effectiveTo].symbol}{toAmount}</div>}
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => { dispatch({ type: 'EXCHANGE_CURRENCY', fromCurrency: fromCur, toCurrency: effectiveTo, fromAmount: Number(amount) }); setAmount('') }}
        disabled={!canExchange}
      >
        Exchange
      </button>
    </div>
  )
}

function TicketPanel({ player, city, dispatch, squareType }) {
  const filterMap = {
    [SQ.AIR_TICKET]: 'air', [SQ.SEA_TICKET]: 'sea',
    [SQ.RAIL_TICKET]: 'rail', [SQ.ROAD_TICKET]: 'road',
    [SQ.THOMAS_COOK]: null,
  }
  const typeFilter = filterMap[squareType]
  const routes = getRoutesForCity(city.id).filter(r => !typeFilter || r.type === typeFilter)
  if (routes.length === 0) return <Info>No {typeFilter || ''} routes available from {city.name}.</Info>

  const cur = city.currency

  return (
    <div style={s.actionBody}>
      <p style={s.p}>Available {typeFilter || ''} routes from {city.name}:</p>
      <div style={s.routeList}>
        {routes.map(r => {
          let fare = r.fareGBP
          if (player.halfFareNext) fare = Math.ceil(fare / 2)
          const localFare = gbpToLocal(fare, cur)
          const canAfford = player.wallet[cur] >= localFare || player.travellersChecques >= fare
          const destCity = CITIES[r.to]
          if (!destCity) return null
          return (
            <div key={r.id} style={s.routeRow}>
              <span style={{ ...s.typeBadge, background: TRANSPORT_COLORS[r.type] }}>{r.type.toUpperCase()}</span>
              <span style={s.dest}>→ {destCity.name}</span>
              <span style={s.fare}>{AllCurrencies[cur].symbol}{localFare}</span>
              <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'BUY_TICKET', routeId: r.id })} disabled={!canAfford}>Buy</button>
            </div>
          )
        })}
      </div>
      {player.halfFareNext && <div style={s.discount}>★ Half-price ticket active!</div>}
    </div>
  )
}

function Info({ children }) {
  return <div style={s.info}>{children}</div>
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: {
    background: 'var(--board-mid)', borderBottom: '2px solid var(--gold)',
    padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cityName: { fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--gold)', fontWeight: 700 },
  currSub: { fontSize: '11px', color: 'var(--cream)', opacity: 0.75, marginTop: '2px' },
  playerChip: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(0,0,0,0.3)', borderRadius: '20px',
    padding: '4px 10px', color: 'var(--cream)', fontSize: '13px',
    border: '1px solid',
  },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  trackWrap: {
    padding: '8px 12px 6px',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  trackLabel: {
    fontSize: '9px', letterSpacing: '2px', color: 'var(--gold)',
    textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600,
  },
  track: { display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' },
  square: {
    flexShrink: 0, width: '62px', minHeight: '60px',
    borderRadius: '5px', padding: '5px 3px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', cursor: 'default',
    transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative',
  },
  sqIcon: { fontSize: '16px', lineHeight: 1, fontWeight: 700 },
  sqLabel: { fontSize: '8px', marginTop: '3px', lineHeight: 1.2, fontWeight: 600, textAlign: 'center' },
  sqCaret: {
    position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
    fontSize: '11px', color: 'var(--gold)',
  },
  actions: { flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  sqHeader: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  sqTag: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 9px', borderRadius: '10px',
    color: 'white', fontSize: '11px', fontWeight: 700,
  },
  sqDesc: { fontSize: '12px', color: 'var(--cream)', opacity: 0.75 },
  actionBody: { display: 'flex', flexDirection: 'column', gap: '7px' },
  info: {
    background: 'rgba(255,255,255,0.06)', borderRadius: '4px',
    padding: '7px 10px', fontSize: '12px', color: 'var(--cream)', opacity: 0.7,
  },
  p: { color: 'var(--cream)', fontSize: '13px', lineHeight: 1.5 },
  warn: { fontSize: '11px', color: '#f88' },
  ticketRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  routeList: { display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '180px', overflowY: 'auto' },
  routeRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  typeBadge: { padding: '2px 6px', borderRadius: '3px', color: 'white', fontSize: '9px', fontWeight: 700, flexShrink: 0 },
  dest: { flex: 1, color: 'var(--cream)', fontSize: '13px', minWidth: '90px' },
  dist: { color: 'var(--cream)', opacity: 0.5, fontSize: '11px' },
  fare: { color: 'var(--gold)', fontSize: '13px', fontWeight: 600 },
  discount: {
    background: 'rgba(201,162,39,0.15)', border: '1px solid var(--gold)',
    borderRadius: '4px', padding: '4px 8px', color: 'var(--gold)', fontSize: '11px', fontWeight: 600,
  },
  row: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  numIn: {
    width: '85px', padding: '5px 7px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: 'var(--cream)', fontSize: '13px',
  },
  arrowText: { color: 'var(--gold)', fontSize: '14px' },
  sel: {
    padding: '5px 7px', background: '#1a2e1a',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
    color: 'var(--cream)', fontSize: '13px',
  },
  preview: { fontSize: '13px', color: 'var(--gold)', fontWeight: 600 },
}
