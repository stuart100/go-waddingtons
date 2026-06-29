import {
  CITIES, ROUTES, CITY_SQUARES, SQUARE_TYPES, LUCK_CARDS, RISK_CARDS,
  CURRENCIES, shuffleArray, gbpToLocal, localToGbp, PLAYER_COLORS,
  REMOTE_LOCATIONS, getRoutesForCity,
} from './data.js'

// ── INITIAL STATE ────────────────────────────────────────────────────────────

export function createInitialWallet() {
  return Object.fromEntries(Object.keys(CURRENCIES).map(k => [k, 0]))
}

export function createPlayer(index, name) {
  const wallet = createInitialWallet()
  wallet.GBP = 300
  return {
    id: index,
    name,
    color: PLAYER_COLORS[index],
    state: {
      type: 'city',
      cityId: 'london',
      squareIndex: 0,
    },
    wallet,
    travellersChecques: 50,
    souvenirs: [],       // array of cityIds collected
    tickets: [],         // array of route ids held
    lastCityId: 'london',
    halfFareNext: false,
    nextJourneySafe: false,
    missedTurns: 0,
  }
}

export function createInitialState(playerNames, souvenirTarget) {
  return {
    phase: 'playing',
    players: playerNames.map((name, i) => createPlayer(i, name)),
    currentPlayerIndex: 0,
    souvenirTarget,
    turnPhase: 'roll',   // 'roll' | 'square' | 'card' | 'free' | 'won'
    diceResult: null,
    pendingCard: null,   // { card, deckType }
    pendingSquare: null, // { squareType } — for modal interactions
    luckDeck: shuffleArray(LUCK_CARDS),
    luckDiscard: [],
    riskDeck: shuffleArray(RISK_CARDS),
    riskDiscard: [],
    log: ['The game has begun! All players start in London.'],
    winner: null,
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function getPlayer(state) { return state.players[state.currentPlayerIndex] }

function updatePlayer(state, updater) {
  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? updater(p) : p
  )
  return { ...state, players }
}

function addLog(state, msg) {
  return { ...state, log: [msg, ...state.log].slice(0, 100) }
}

function drawCard(deck, discard) {
  if (deck.length === 0) {
    deck = shuffleArray(discard)
    discard = []
  }
  const [card, ...rest] = deck
  return { card, deck: rest, discard }
}

function deductGBP(player, gbpAmount) {
  // Pay from GBP first, then other currencies, then traveller's cheques
  let remaining = gbpAmount
  const wallet = { ...player.wallet }
  if (wallet.GBP >= remaining) {
    wallet.GBP -= remaining
    remaining = 0
  } else {
    remaining -= wallet.GBP
    wallet.GBP = 0
  }
  // Try traveller's cheques
  const tq = player.travellersChecques
  if (remaining > 0 && tq > 0) {
    const used = Math.min(remaining, tq)
    remaining -= used
    return { ...player, wallet, travellersChecques: tq - used }
  }
  return { ...player, wallet }
}

function canAffordGBP(player, gbpAmount) {
  const totalGBP = player.wallet.GBP + player.travellersChecques +
    Object.entries(player.wallet)
      .filter(([k]) => k !== 'GBP')
      .reduce((sum, [k, v]) => sum + localToGbp(v, k), 0)
  return totalGBP >= gbpAmount
}

function getTotalWealthGBP(player) {
  return player.wallet.GBP + player.travellersChecques +
    Object.entries(player.wallet)
      .filter(([k]) => k !== 'GBP')
      .reduce((sum, [k, v]) => sum + localToGbp(v, k), 0)
}

function applyCardEffect(state, card) {
  const effect = card.effect
  const player = getPlayer(state)
  let msg = `${player.name} drew "${card.title}": ${card.desc}`

  switch (effect.type) {
    case 'collect_gbp': {
      state = updatePlayer(state, p => ({ ...p, wallet: { ...p.wallet, GBP: p.wallet.GBP + effect.amount } }))
      break
    }
    case 'collect_cheques': {
      state = updatePlayer(state, p => ({ ...p, travellersChecques: p.travellersChecques + effect.amount }))
      break
    }
    case 'half_fare_next': {
      state = updatePlayer(state, p => ({ ...p, halfFareNext: true }))
      break
    }
    case 'next_journey_safe': {
      state = updatePlayer(state, p => ({ ...p, nextJourneySafe: true }))
      break
    }
    case 'double_journey_progress': {
      const p = getPlayer(state)
      if (p.state.type === 'traveling') {
        const extra = Math.floor((p.state.distance - p.state.progress) / 2)
        state = updatePlayer(state, pl => ({
          ...pl,
          state: { ...pl.state, progress: Math.min(pl.state.distance, pl.state.progress + extra) }
        }))
      }
      break
    }
    case 'advance_journey': {
      const p2 = getPlayer(state)
      if (p2.state.type === 'traveling') {
        state = updatePlayer(state, pl => ({
          ...pl,
          state: { ...pl.state, progress: Math.min(pl.state.distance, pl.state.progress + effect.amount) }
        }))
      }
      break
    }
    case 'pay_gbp': {
      state = updatePlayer(state, p => deductGBP(p, effect.amount))
      break
    }
    case 'pay_and_miss': {
      state = updatePlayer(state, p => ({
        ...deductGBP(p, effect.gbpAmount),
        missedTurns: p.missedTurns + effect.missedTurns,
      }))
      break
    }
    case 'miss_turns': {
      state = updatePlayer(state, p => ({ ...p, missedTurns: p.missedTurns + effect.amount }))
      break
    }
    case 'divert': {
      const remote = REMOTE_LOCATIONS[effect.location]
      state = updatePlayer(state, p => ({
        ...p,
        state: { type: 'diverted', location: effect.location, missedTurns: effect.missedTurns, returnTo: remote.nearestCity },
      }))
      break
    }
    case 'return_to_last_city': {
      const p3 = getPlayer(state)
      const returnCity = p3.lastCityId
      const squares = CITY_SQUARES[returnCity]
      state = updatePlayer(state, pl => ({
        ...pl,
        state: { type: 'city', cityId: returnCity, squareIndex: 0 },
        tickets: [],
      }))
      msg += ` Returns to ${CITIES[returnCity].name}.`
      break
    }
    case 'lose_souvenir': {
      const p4 = getPlayer(state)
      if (p4.souvenirs.length > 0) {
        const lost = p4.souvenirs[p4.souvenirs.length - 1]
        state = updatePlayer(state, pl => ({ ...pl, souvenirs: pl.souvenirs.slice(0, -1) }))
        msg += ` Lost souvenir from ${CITIES[lost]?.name || lost}.`
      } else {
        msg += ' (No souvenirs to lose.)'
      }
      break
    }
    case 'lose_journey_progress': {
      const p5 = getPlayer(state)
      if (p5.state.type === 'traveling') {
        state = updatePlayer(state, pl => ({
          ...pl,
          state: { ...pl.state, progress: Math.max(0, pl.state.progress - effect.amount) }
        }))
      }
      break
    }
    default:
      break
  }

  return addLog(state, msg)
}

function arriveInCity(state, cityId) {
  const player = getPlayer(state)
  const city = CITIES[cityId]
  state = updatePlayer(state, p => ({
    ...p,
    state: { type: 'city', cityId, squareIndex: 0 },
    lastCityId: cityId,
    nextJourneySafe: false,
  }))
  state = addLog(state, `${player.name} has arrived in ${city.name}!`)

  // Check win condition: returned to London with enough souvenirs
  const updated = getPlayer(state)
  const collectedCount = updated.souvenirs.filter(id => id !== 'london').length
  if (cityId === 'london' && collectedCount >= state.souvenirTarget) {
    state = addLog(state, `🏆 ${updated.name} has returned to London with ${collectedCount} souvenirs — WINNER!`)
    return { ...state, phase: 'won', winner: state.currentPlayerIndex, turnPhase: 'won' }
  }

  return state
}

// ── REDUCER ───────────────────────────────────────────────────────────────────

export function reducer(state, action) {
  switch (action.type) {

    case 'ROLL_DICE': {
      if (state.turnPhase !== 'roll') return state
      const player = getPlayer(state)

      // Handle missed turns (diverted or hospital)
      if (player.state.type === 'diverted') {
        const remaining = player.state.missedTurns - 1
        if (remaining <= 0) {
          const returnCity = player.state.returnTo
          state = updatePlayer(state, p => ({
            ...p,
            state: { type: 'city', cityId: returnCity, squareIndex: 0 },
            lastCityId: returnCity,
          }))
          state = addLog(state, `${player.name} is rescued and returns to ${CITIES[returnCity].name}.`)
        } else {
          state = updatePlayer(state, p => ({
            ...p, state: { ...p.state, missedTurns: remaining }
          }))
          state = addLog(state, `${player.name} is stranded at ${REMOTE_LOCATIONS[player.state.location].name}. ${remaining} turn(s) remaining.`)
          return advanceTurn(state)
        }
        return advanceTurn(state)
      }

      if (player.missedTurns > 0) {
        state = updatePlayer(state, p => ({ ...p, missedTurns: p.missedTurns - 1 }))
        state = addLog(state, `${player.name} misses this turn (${player.missedTurns - 1} remaining).`)
        return advanceTurn(state)
      }

      const dice = Math.floor(Math.random() * 6) + 1
      state = { ...state, diceResult: dice }
      state = addLog(state, `${player.name} rolls a ${dice}.`)

      if (player.state.type === 'city') {
        // Move around outer ring
        const squares = CITY_SQUARES[player.state.cityId]
        const newIndex = (player.state.squareIndex + dice) % squares.length
        state = updatePlayer(state, p => ({
          ...p, state: { ...p.state, squareIndex: newIndex }
        }))
        const sq = squares[newIndex]
        state = addLog(state, `${getPlayer(state).name} lands on: ${sq.label}`)
        state = { ...state, turnPhase: 'square' }
        return resolveSquare(state, sq)
      }

      if (player.state.type === 'traveling') {
        return advanceJourney(state, dice)
      }

      return state
    }

    case 'BUY_TICKET': {
      const { routeId } = action
      const route = ROUTES.find(r => r.id === routeId || r.id + '_rev' === routeId)
      if (!route) return state
      const player = getPlayer(state)
      let fareGBP = route.fareGBP
      if (player.halfFareNext) fareGBP = Math.ceil(fareGBP / 2)
      // Pay in local currency of current city
      const cityId = player.state.type === 'city' ? player.state.cityId : player.lastCityId
      const currency = CITIES[cityId].currency
      const localFare = gbpToLocal(fareGBP, currency)
      if (player.wallet[currency] < localFare && player.travellersChecques < fareGBP) {
        return addLog(state, `${player.name} cannot afford this ticket (${CURRENCIES[currency].symbol}${localFare}).`)
      }
      let newPlayer = { ...player, halfFareNext: false }
      if (newPlayer.wallet[currency] >= localFare) {
        newPlayer = { ...newPlayer, wallet: { ...newPlayer.wallet, [currency]: newPlayer.wallet[currency] - localFare } }
      } else {
        newPlayer = { ...newPlayer, travellersChecques: newPlayer.travellersChecques - fareGBP }
      }
      newPlayer = { ...newPlayer, tickets: [...newPlayer.tickets, routeId] }
      state = { ...state, players: state.players.map((p, i) => i === state.currentPlayerIndex ? newPlayer : p) }
      state = addLog(state, `${player.name} buys a ${route.type} ticket to ${CITIES[route.to]?.name || CITIES[route.from]?.name}. Cost: ${CURRENCIES[currency].symbol}${localFare}.`)
      return { ...state, turnPhase: 'free' }
    }

    case 'EXCHANGE_CURRENCY': {
      const { fromCurrency, toCurrency, fromAmount } = action
      const player = getPlayer(state)
      if (player.wallet[fromCurrency] < fromAmount) return state
      const gbpValue = localToGbp(fromAmount, fromCurrency)
      const toAmount = gbpToLocal(gbpValue, toCurrency)
      state = updatePlayer(state, p => ({
        ...p,
        wallet: {
          ...p.wallet,
          [fromCurrency]: p.wallet[fromCurrency] - fromAmount,
          [toCurrency]: p.wallet[toCurrency] + toAmount,
        }
      }))
      state = addLog(state, `${player.name} exchanges ${CURRENCIES[fromCurrency].symbol}${fromAmount} → ${CURRENCIES[toCurrency].symbol}${Math.round(toAmount)}.`)
      return { ...state, turnPhase: 'free' }
    }

    case 'BUY_SOUVENIR': {
      const player = getPlayer(state)
      if (player.state.type !== 'city') return state
      const cityId = player.state.cityId
      if (player.souvenirs.includes(cityId)) {
        return addLog(state, `${player.name} already has a souvenir from ${CITIES[cityId].name}.`)
      }
      const currency = CITIES[cityId].currency
      const localCost = gbpToLocal(15, currency)
      const gbpCost = 15
      const hasLocal = (player.wallet[currency] || 0) >= localCost
      const hasGBP = (player.wallet.GBP || 0) >= gbpCost
      const hasCheques = player.travellersChecques >= gbpCost
      if (!hasLocal && !hasGBP && !hasCheques) {
        return addLog(state, `${player.name} cannot afford the souvenir (${CURRENCIES[currency].symbol}${localCost}).`)
      }
      state = updatePlayer(state, p => {
        if (hasLocal) return { ...p, wallet: { ...p.wallet, [currency]: p.wallet[currency] - localCost }, souvenirs: [...p.souvenirs, cityId] }
        if (hasGBP) return { ...p, wallet: { ...p.wallet, GBP: p.wallet.GBP - gbpCost }, souvenirs: [...p.souvenirs, cityId] }
        return { ...p, travellersChecques: p.travellersChecques - gbpCost, souvenirs: [...p.souvenirs, cityId] }
      })
      const updated = getPlayer(state)
      state = addLog(state, `${updated.name} buys a souvenir from ${CITIES[cityId].name}! (${updated.souvenirs.length}/${state.souvenirTarget} collected)`)

      // Check win condition
      if (cityId === 'london' && updated.souvenirs.filter(s => s !== 'london').length >= state.souvenirTarget) {
        state = addLog(state, `🏆 ${updated.name} has returned to London with ${state.souvenirTarget} souvenirs. WINNER!`)
        return { ...state, turnPhase: 'won', phase: 'won', winner: state.currentPlayerIndex }
      }
      return { ...state, turnPhase: 'free' }
    }

    case 'DEPART': {
      const { ticketId } = action
      const player = getPlayer(state)
      if (player.state.type !== 'city') return state

      // Find route
      const route = ROUTES.find(r => r.id === ticketId || r.id + '_rev' === ticketId)
      if (!route) return state

      // Determine actual destination
      const destination = route.from === player.state.cityId ? route.to : route.from

      state = updatePlayer(state, p => ({
        ...p,
        state: {
          type: 'traveling',
          from: player.state.cityId,
          to: destination,
          routeId: route.id,
          transport: route.type,
          progress: 0,
          distance: route.distance,
          hazards: route.hazards,
        },
        tickets: p.tickets.filter(t => t !== ticketId),
        lastCityId: player.state.cityId,
      }))
      state = addLog(state, `${player.name} departs ${CITIES[player.state.cityId].name} by ${route.type} to ${CITIES[destination].name}.`)
      return advanceTurn(state)
    }

    case 'ACKNOWLEDGE_CARD': {
      const card = state.pendingCard
      if (!card) return { ...state, turnPhase: 'free' }
      state = applyCardEffect(state, card.card)
      state = { ...state, pendingCard: null }

      // After a risk card, check if player is now diverted — go to free phase (end of turn)
      const p = getPlayer(state)
      if (p.state.type === 'diverted') {
        return advanceTurn(state)
      }
      // Check if traveling and journey is now complete after luck card
      if (p.state.type === 'traveling' && p.state.progress >= p.state.distance) {
        return arriveInCityState(state, p.state.to)
      }
      return { ...state, turnPhase: 'free' }
    }

    case 'END_TURN': {
      return advanceTurn(state)
    }

    default:
      return state
  }
}

function resolveSquare(state, sq) {
  const player = getPlayer(state)
  switch (sq.type) {
    case SQUARE_TYPES.LUCK_CARD: {
      const result = drawCard(state.luckDeck, state.luckDiscard)
      state = { ...state, luckDeck: result.deck, luckDiscard: result.discard }
      state = { ...state, pendingCard: { card: result.card, deckType: 'luck' }, turnPhase: 'card' }
      return state
    }
    case SQUARE_TYPES.CUSTOMS: {
      const result = drawCard(state.riskDeck, state.riskDiscard)
      state = { ...state, riskDeck: result.deck, riskDiscard: result.discard }
      state = { ...state, pendingCard: { card: result.card, deckType: 'risk' }, turnPhase: 'card' }
      return state
    }
    case SQUARE_TYPES.HOSPITAL: {
      state = updatePlayer(state, p => ({ ...p, missedTurns: p.missedTurns + 1 }))
      state = addLog(state, `${player.name} is admitted to hospital. Miss 1 turn.`)
      return { ...state, turnPhase: 'free' }
    }
    case SQUARE_TYPES.CASINO: {
      const roll = Math.floor(Math.random() * 6) + 1
      const win = roll >= 4
      if (win) {
        state = updatePlayer(state, p => ({ ...p, wallet: { ...p.wallet, GBP: p.wallet.GBP + 50 } }))
        state = addLog(state, `${player.name} rolls ${roll} at the casino — wins £50!`)
      } else {
        state = updatePlayer(state, p => deductGBP(p, 50))
        state = addLog(state, `${player.name} rolls ${roll} at the casino — loses £50.`)
      }
      return { ...state, turnPhase: 'free' }
    }
    case SQUARE_TYPES.HOTEL:
    case SQUARE_TYPES.BANK:
    case SQUARE_TYPES.BUREAU:
    case SQUARE_TYPES.THOMAS_COOK:
    case SQUARE_TYPES.AIR_TICKET:
    case SQUARE_TYPES.SEA_TICKET:
    case SQUARE_TYPES.RAIL_TICKET:
    case SQUARE_TYPES.ROAD_TICKET:
    case SQUARE_TYPES.SOUVENIR:
    case SQUARE_TYPES.DEPART:
      return { ...state, turnPhase: 'free' }
    default:
      return { ...state, turnPhase: 'free' }
  }
}

function advanceJourney(state, dice) {
  const player = getPlayer(state)
  const { progress, distance, hazards, to, from: fromCity } = player.state
  const isSafe = player.nextJourneySafe

  const newProgress = Math.min(distance, progress + dice)

  // Check if any hazard was crossed
  const crossedHazards = !isSafe
    ? hazards.filter(h => h > progress && h <= newProgress)
    : []

  state = updatePlayer(state, p => ({
    ...p,
    state: { ...p.state, progress: newProgress }
  }))

  if (newProgress >= distance) {
    // Arrived!
    state = arriveInCity(state, to)
    return advanceTurn(state)
  }

  state = addLog(state, `${player.name} advances ${dice} spaces (${newProgress}/${distance}).`)

  if (crossedHazards.length > 0) {
    const result = drawCard(state.riskDeck, state.riskDiscard)
    state = { ...state, riskDeck: result.deck, riskDiscard: result.discard }
    state = { ...state, pendingCard: { card: result.card, deckType: 'risk' }, turnPhase: 'card' }
    return state
  }

  return advanceTurn(state)
}

function arriveInCityState(state, cityId) {
  state = arriveInCity(state, cityId)
  return advanceTurn(state)
}

function advanceTurn(state) {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnPhase: 'roll',
    diceResult: null,
    pendingCard: null,
  }
}
