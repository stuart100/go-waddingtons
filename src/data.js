// ── CURRENCIES ──────────────────────────────────────────────────────────────
// All rates are: 1 GBP = N units (approximate 1961 rates)
export const CURRENCIES = {
  GBP: { code: 'GBP', name: 'Pounds Sterling', symbol: '£', rate: 1 },
  USD: { code: 'USD', name: 'US Dollars', symbol: '$', rate: 2.80 },
  FRF: { code: 'FRF', name: 'French Francs', symbol: 'Fr', rate: 13.80 },
  DEM: { code: 'DEM', name: 'German Marks', symbol: 'DM', rate: 11.20 },
  RUB: { code: 'RUB', name: 'Soviet Roubles', symbol: 'R', rate: 9.00 },
  INR: { code: 'INR', name: 'Indian Rupees', symbol: '₹', rate: 13.33 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollars', symbol: 'HK$', rate: 19.60 },
  MXP: { code: 'MXP', name: 'Pesos', symbol: 'P', rate: 35.00 },
  PIA: { code: 'PIA', name: 'Piastres', symbol: 'PT', rate: 13.44 },
  ITL: { code: 'ITL', name: 'Italian Lire', symbol: 'L', rate: 1764 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 1008 },
}

export function gbpToLocal(gbpAmount, currencyCode) {
  const rate = CURRENCIES[currencyCode].rate
  return Math.round(gbpAmount * rate)
}

export function localToGbp(localAmount, currencyCode) {
  const rate = CURRENCIES[currencyCode].rate
  return localAmount / rate
}

export function formatMoney(amount, currencyCode) {
  const { symbol, rate } = CURRENCIES[currencyCode]
  if (rate >= 100) return `${symbol}${Math.round(amount).toLocaleString()}`
  if (rate >= 10) return `${symbol}${amount.toFixed(0)}`
  return `${symbol}${amount.toFixed(2)}`
}

// ── CITIES ───────────────────────────────────────────────────────────────────
// SVG viewport: 900 x 500 (equirectangular, hand-tuned for readability)
export const CITIES = {
  london:       { id: 'london',       name: 'London',         x: 385, y: 103, currency: 'GBP', isStart: true },
  paris:        { id: 'paris',        name: 'Paris',          x: 405, y: 123, currency: 'FRF' },
  frankfurt:    { id: 'frankfurt',    name: 'Frankfurt',      x: 438, y: 103, currency: 'DEM' },
  rome:         { id: 'rome',         name: 'Rome',           x: 447, y: 140, currency: 'ITL' },
  moscow:       { id: 'moscow',       name: 'Moscow',         x: 492, y: 78,  currency: 'RUB' },
  istanbul:     { id: 'istanbul',     name: 'Istanbul',       x: 478, y: 133, currency: 'PIA' },
  cairo:        { id: 'cairo',        name: 'Cairo',          x: 476, y: 162, currency: 'PIA' },
  nairobi:      { id: 'nairobi',      name: 'Nairobi',        x: 490, y: 247, currency: 'GBP' },
  bombay:       { id: 'bombay',       name: 'Bombay',         x: 568, y: 188, currency: 'INR' },
  hong_kong:    { id: 'hong_kong',    name: 'Hong Kong',      x: 657, y: 178, currency: 'HKD' },
  tokyo:        { id: 'tokyo',        name: 'Tokyo',          x: 726, y: 138, currency: 'JPY' },
  sydney:       { id: 'sydney',       name: 'Sydney',         x: 742, y: 330, currency: 'GBP' },
  singapore:    { id: 'singapore',    name: 'Singapore',      x: 638, y: 242, currency: 'HKD' },
  new_york:     { id: 'new_york',     name: 'New York',       x: 232, y: 130, currency: 'USD' },
  mexico_city:  { id: 'mexico_city',  name: 'Mexico City',    x: 175, y: 190, currency: 'MXP' },
  buenos_aires: { id: 'buenos_aires', name: 'Buenos Aires',   x: 265, y: 337, currency: 'MXP' },
  rio:          { id: 'rio',          name: 'Rio de Janeiro', x: 298, y: 302, currency: 'MXP' },
}

// Remote diversion locations (not playable cities — used by risk cards)
export const REMOTE_LOCATIONS = {
  heard_island:     { id: 'heard_island',     name: 'Heard Island',     x: 572, y: 420, nearestCity: 'sydney' },
  rockall:          { id: 'rockall',          name: 'Rockall',          x: 352, y: 120, nearestCity: 'london' },
  tristan_da_cunha: { id: 'tristan_da_cunha', name: 'Tristan da Cunha', x: 368, y: 335, nearestCity: 'nairobi' },
  midway:           { id: 'midway',           name: 'Midway Island',    x: 710, y: 210, nearestCity: 'tokyo' },
}

// ── ROUTES ───────────────────────────────────────────────────────────────────
// distance = number of spaces on the route (die-roll advancement)
// fareGBP  = ticket cost in GBP equivalent
// hazards  = space indices where a risk card must be drawn

export const ROUTES = [
  // Air — short haul
  { id: 'lon-par-air',  from: 'london',    to: 'paris',       type: 'air',  fareGBP: 15,  distance: 6,  hazards: [] },
  { id: 'lon-fra-air',  from: 'london',    to: 'frankfurt',   type: 'air',  fareGBP: 15,  distance: 6,  hazards: [] },
  { id: 'par-rom-air',  from: 'paris',     to: 'rome',        type: 'air',  fareGBP: 15,  distance: 6,  hazards: [] },
  { id: 'ist-cai-air',  from: 'istanbul',  to: 'cairo',       type: 'air',  fareGBP: 18,  distance: 7,  hazards: [] },
  { id: 'hkg-sin-air',  from: 'hong_kong', to: 'singapore',   type: 'air',  fareGBP: 20,  distance: 7,  hazards: [] },
  { id: 'rio-bue-air',  from: 'rio',       to: 'buenos_aires',type: 'air',  fareGBP: 15,  distance: 6,  hazards: [] },
  { id: 'ny-mex-air',   from: 'new_york',  to: 'mexico_city', type: 'air',  fareGBP: 20,  distance: 7,  hazards: [] },
  { id: 'rom-cai-air',  from: 'rome',      to: 'cairo',       type: 'air',  fareGBP: 25,  distance: 8,  hazards: [] },
  // Air — medium haul
  { id: 'lon-cai-air',  from: 'london',    to: 'cairo',       type: 'air',  fareGBP: 35,  distance: 12, hazards: [6] },
  { id: 'lon-nai-air',  from: 'london',    to: 'nairobi',     type: 'air',  fareGBP: 45,  distance: 14, hazards: [7] },
  { id: 'par-mos-air',  from: 'paris',     to: 'moscow',      type: 'air',  fareGBP: 35,  distance: 12, hazards: [] },
  { id: 'fra-mos-air',  from: 'frankfurt', to: 'moscow',      type: 'air',  fareGBP: 30,  distance: 10, hazards: [] },
  { id: 'fra-ist-air',  from: 'frankfurt', to: 'istanbul',    type: 'air',  fareGBP: 28,  distance: 10, hazards: [] },
  { id: 'cai-nai-air',  from: 'cairo',     to: 'nairobi',     type: 'air',  fareGBP: 28,  distance: 10, hazards: [] },
  { id: 'cai-bom-air',  from: 'cairo',     to: 'bombay',      type: 'air',  fareGBP: 35,  distance: 12, hazards: [6] },
  { id: 'bom-hkg-air',  from: 'bombay',    to: 'hong_kong',   type: 'air',  fareGBP: 38,  distance: 13, hazards: [6] },
  { id: 'bom-sin-air',  from: 'bombay',    to: 'singapore',   type: 'air',  fareGBP: 35,  distance: 12, hazards: [6] },
  { id: 'hkg-tok-air',  from: 'hong_kong', to: 'tokyo',       type: 'air',  fareGBP: 35,  distance: 12, hazards: [] },
  { id: 'sin-syd-air',  from: 'singapore', to: 'sydney',      type: 'air',  fareGBP: 40,  distance: 14, hazards: [7] },
  { id: 'hkg-syd-air',  from: 'hong_kong', to: 'sydney',      type: 'air',  fareGBP: 42,  distance: 14, hazards: [7] },
  { id: 'ny-rio-air',   from: 'new_york',  to: 'rio',         type: 'air',  fareGBP: 50,  distance: 15, hazards: [7] },
  { id: 'ny-bue-air',   from: 'new_york',  to: 'buenos_aires',type: 'air',  fareGBP: 55,  distance: 16, hazards: [8] },
  { id: 'mex-bue-air',  from: 'mexico_city',to:'buenos_aires', type: 'air',  fareGBP: 40,  distance: 13, hazards: [6] },
  { id: 'mos-bom-air',  from: 'moscow',    to: 'bombay',      type: 'air',  fareGBP: 50,  distance: 16, hazards: [8] },
  { id: 'par-ny-air',   from: 'paris',     to: 'new_york',    type: 'air',  fareGBP: 58,  distance: 18, hazards: [9] },
  // Air — long haul
  { id: 'lon-ny-air',   from: 'london',    to: 'new_york',    type: 'air',  fareGBP: 60,  distance: 18, hazards: [9] },
  { id: 'lon-bom-air',  from: 'london',    to: 'bombay',      type: 'air',  fareGBP: 65,  distance: 20, hazards: [10] },
  { id: 'lon-hkg-air',  from: 'london',    to: 'hong_kong',   type: 'air',  fareGBP: 75,  distance: 24, hazards: [12] },
  { id: 'lon-tok-air',  from: 'london',    to: 'tokyo',       type: 'air',  fareGBP: 82,  distance: 26, hazards: [13] },
  { id: 'lon-syd-air',  from: 'london',    to: 'sydney',      type: 'air',  fareGBP: 90,  distance: 28, hazards: [14] },
  { id: 'tok-ny-air',   from: 'tokyo',     to: 'new_york',    type: 'air',  fareGBP: 78,  distance: 26, hazards: [13] },
  // Sea routes
  { id: 'lon-ny-sea',   from: 'london',    to: 'new_york',    type: 'sea',  fareGBP: 22,  distance: 30, hazards: [15, 25] },
  { id: 'lon-bom-sea',  from: 'london',    to: 'bombay',      type: 'sea',  fareGBP: 28,  distance: 36, hazards: [12, 24, 30] },
  { id: 'lon-syd-sea',  from: 'london',    to: 'sydney',      type: 'sea',  fareGBP: 38,  distance: 48, hazards: [12, 24, 36] },
  { id: 'ny-rio-sea',   from: 'new_york',  to: 'rio',         type: 'sea',  fareGBP: 18,  distance: 24, hazards: [12] },
  { id: 'ny-bue-sea',   from: 'new_york',  to: 'buenos_aires',type: 'sea',  fareGBP: 20,  distance: 28, hazards: [14] },
  { id: 'rio-bue-sea',  from: 'rio',       to: 'buenos_aires',type: 'sea',  fareGBP: 8,   distance: 14, hazards: [] },
  { id: 'cai-bom-sea',  from: 'cairo',     to: 'bombay',      type: 'sea',  fareGBP: 18,  distance: 24, hazards: [12] },
  { id: 'bom-sin-sea',  from: 'bombay',    to: 'singapore',   type: 'sea',  fareGBP: 14,  distance: 20, hazards: [10] },
  { id: 'sin-syd-sea',  from: 'singapore', to: 'sydney',      type: 'sea',  fareGBP: 18,  distance: 24, hazards: [12] },
  { id: 'hkg-tok-sea',  from: 'hong_kong', to: 'tokyo',       type: 'sea',  fareGBP: 16,  distance: 20, hazards: [10] },
  { id: 'sin-hkg-sea',  from: 'singapore', to: 'hong_kong',   type: 'sea',  fareGBP: 12,  distance: 18, hazards: [] },
  { id: 'nai-bom-sea',  from: 'nairobi',   to: 'bombay',      type: 'sea',  fareGBP: 12,  distance: 20, hazards: [10] },
  // Rail routes
  { id: 'lon-par-rail', from: 'london',    to: 'paris',       type: 'rail', fareGBP: 8,   distance: 8,  hazards: [] },
  { id: 'par-fra-rail', from: 'paris',     to: 'frankfurt',   type: 'rail', fareGBP: 10,  distance: 10, hazards: [] },
  { id: 'par-rom-rail', from: 'paris',     to: 'rome',        type: 'rail', fareGBP: 12,  distance: 12, hazards: [] },
  { id: 'fra-mos-rail', from: 'frankfurt', to: 'moscow',      type: 'rail', fareGBP: 18,  distance: 20, hazards: [10] },
  { id: 'fra-ist-rail', from: 'frankfurt', to: 'istanbul',    type: 'rail', fareGBP: 16,  distance: 18, hazards: [9] },
  { id: 'mos-ist-rail', from: 'moscow',    to: 'istanbul',    type: 'rail', fareGBP: 14,  distance: 16, hazards: [8] },
  { id: 'ist-cai-rail', from: 'istanbul',  to: 'cairo',       type: 'rail', fareGBP: 10,  distance: 12, hazards: [] },
  { id: 'mos-bom-rail', from: 'moscow',    to: 'bombay',      type: 'rail', fareGBP: 22,  distance: 28, hazards: [14] },
  // Road routes
  { id: 'lon-par-road', from: 'london',    to: 'paris',       type: 'road', fareGBP: 5,   distance: 8,  hazards: [] },
  { id: 'par-fra-road', from: 'paris',     to: 'frankfurt',   type: 'road', fareGBP: 6,   distance: 10, hazards: [] },
  { id: 'par-rom-road', from: 'paris',     to: 'rome',        type: 'road', fareGBP: 8,   distance: 14, hazards: [7] },
  { id: 'fra-ist-road', from: 'frankfurt', to: 'istanbul',    type: 'road', fareGBP: 12,  distance: 18, hazards: [9] },
  { id: 'mex-bue-road', from: 'mexico_city',to:'buenos_aires', type: 'road', fareGBP: 10,  distance: 20, hazards: [10] },
]

// Build a lookup: cityId → routes available (deduped by from/to pair, both directions)
export function getRoutesForCity(cityId) {
  return ROUTES.filter(r => r.from === cityId || r.to === cityId).map(r => {
    if (r.to === cityId) {
      return { ...r, from: r.to, to: r.from, id: r.id + '_rev' }
    }
    return r
  })
}

export function getTransportTypesForCity(cityId) {
  return [...new Set(getRoutesForCity(cityId).map(r => r.type))]
}

// ── CITY SQUARES ─────────────────────────────────────────────────────────────
export const SQUARE_TYPES = {
  HOTEL:         'hotel',
  BANK:          'bank',
  BUREAU:        'bureau',
  THOMAS_COOK:   'thomas_cook',
  SOUVENIR:      'souvenir',
  AIR_TICKET:    'air_ticket',
  SEA_TICKET:    'sea_ticket',
  RAIL_TICKET:   'rail_ticket',
  ROAD_TICKET:   'road_ticket',
  LUCK_CARD:     'luck_card',
  CUSTOMS:       'customs',
  CASINO:        'casino',
  HOSPITAL:      'hospital',
  DEPART:        'depart',
}

const SQ = SQUARE_TYPES

export function buildCitySquares(cityId) {
  const transports = getTransportTypesForCity(cityId)
  const squares = [
    { type: SQ.HOTEL,       label: 'Hotel',            desc: 'Welcome to the city!' },
    { type: SQ.BANK,        label: 'Bank',             desc: 'Exchange currency at official rates.' },
    { type: SQ.LUCK_CARD,   label: 'Luck Card!',       desc: 'Draw a Luck card.' },
    transports.includes('air')  && { type: SQ.AIR_TICKET,  label: 'Air Ticket Office',  desc: 'Purchase an air ticket.' },
    transports.includes('sea')  && { type: SQ.SEA_TICKET,  label: 'Sea Ticket Office',  desc: 'Purchase a sea ticket.' },
    transports.includes('rail') && { type: SQ.RAIL_TICKET, label: 'Rail Station',        desc: 'Purchase a rail ticket.' },
    transports.includes('road') && { type: SQ.ROAD_TICKET, label: 'Road Office',         desc: 'Purchase a road ticket.' },
    { type: SQ.SOUVENIR,    label: 'Souvenir Shop',    desc: 'Purchase a souvenir of this city.' },
    { type: SQ.THOMAS_COOK, label: "Thomas Cook & Son",desc: 'Buy any ticket or exchange money.' },
    { type: SQ.CUSTOMS,     label: 'Customs',          desc: 'Draw a Risk card.' },
    { type: SQ.BUREAU,      label: 'Bureau de Change', desc: 'Exchange currency quickly.' },
    { type: SQ.LUCK_CARD,   label: 'Luck Card!',       desc: 'Draw a Luck card.' },
    { type: SQ.CASINO,      label: 'Casino',           desc: 'Roll the die — win or lose £50.' },
    { type: SQ.HOSPITAL,    label: 'City Hospital',    desc: 'Miss your next turn.' },
    { type: SQ.DEPART,      label: 'Depart',           desc: 'Set off on your journey (ticket required).' },
  ].filter(Boolean)
  return squares
}

// Pre-build squares for each city
export const CITY_SQUARES = Object.fromEntries(
  Object.keys(CITIES).map(id => [id, buildCitySquares(id)])
)

// ── CARDS ─────────────────────────────────────────────────────────────────────
export const LUCK_CARDS = [
  { id: 'l01', title: 'Stock Exchange Windfall', desc: 'Your investments pay off. Collect £50.', effect: { type: 'collect_gbp', amount: 50 } },
  { id: 'l02', title: 'Travel Prize', desc: 'You\'ve won a travel competition! Receive £40 in Traveller\'s Cheques.', effect: { type: 'collect_cheques', amount: 40 } },
  { id: 'l03', title: 'Casino Win', desc: 'Your lucky streak at the casino earns you £35.', effect: { type: 'collect_gbp', amount: 35 } },
  { id: 'l04', title: 'Business Deal', desc: 'An unexpected deal comes off splendidly. Collect £60.', effect: { type: 'collect_gbp', amount: 60 } },
  { id: 'l05', title: 'Lost Wallet Returned', desc: 'An honest local returns your lost wallet. Collect £20.', effect: { type: 'collect_gbp', amount: 20 } },
  { id: 'l06', title: 'Insurance Payout', desc: 'Your travel insurance covers a claim. Receive £30.', effect: { type: 'collect_gbp', amount: 30 } },
  { id: 'l07', title: 'Duty-Free Bargain', desc: 'Exceptional duty-free shopping saves you money. Collect £10.', effect: { type: 'collect_gbp', amount: 10 } },
  { id: 'l08', title: 'Airline Compensation', desc: 'Overbooking compensation from the airline. Collect £25.', effect: { type: 'collect_gbp', amount: 25 } },
  { id: 'l09', title: 'Hotel Refund', desc: 'The hotel refunds you for poor service. Receive £15.', effect: { type: 'collect_gbp', amount: 15 } },
  { id: 'l10', title: 'Local Lottery Win', desc: 'Your ticket comes up! Collect £45.', effect: { type: 'collect_gbp', amount: 45 } },
  { id: 'l11', title: 'Thomas Cook Voucher', desc: 'You find a voucher in your pocket. Next ticket purchase is half price.', effect: { type: 'half_fare_next' } },
  { id: 'l12', title: "Traveller's Cheque Bonus", desc: 'The bank issues you extra cheques. Receive £50 in Traveller\'s Cheques.', effect: { type: 'collect_cheques', amount: 50 } },
  { id: 'l13', title: 'Favourable Exchange Rate', desc: 'Currency markets favour you today. Collect £18.', effect: { type: 'collect_gbp', amount: 18 } },
  { id: 'l14', title: 'Tour Group Discount', desc: 'You join a tour group and save. Next ticket is half price.', effect: { type: 'half_fare_next' } },
  { id: 'l15', title: 'Journalist Interview', desc: 'A journalist pays for your story. Receive £25.', effect: { type: 'collect_gbp', amount: 25 } },
  { id: 'l16', title: 'Express Upgrade', desc: 'You\'re upgraded to first class — journey speed doubled!', effect: { type: 'double_journey_progress' } },
  { id: 'l17', title: 'Gift from Host Family', desc: 'A generous local family insists you accept a gift. Collect £12.', effect: { type: 'collect_gbp', amount: 12 } },
  { id: 'l18', title: 'Currency Speculation', desc: 'A timely trade pays off. Collect £55.', effect: { type: 'collect_gbp', amount: 55 } },
  { id: 'l19', title: 'Free Night\'s Stay', desc: 'A charming innkeeper offers you a complimentary night. Collect £8.', effect: { type: 'collect_gbp', amount: 8 } },
  { id: 'l20', title: 'Diplomatic Cocktail Party', desc: 'You\'re invited to a reception and make useful contacts. Collect £20.', effect: { type: 'collect_gbp', amount: 20 } },
  { id: 'l21', title: 'Film Location Extra', desc: 'A film crew pays you to appear in their movie. Collect £30.', effect: { type: 'collect_gbp', amount: 30 } },
  { id: 'l22', title: 'Stock Dividend', desc: 'Your portfolio pays an unexpected dividend. Collect £40.', effect: { type: 'collect_gbp', amount: 40 } },
  { id: 'l23', title: 'Celebrity Encounter', desc: 'Your photo with a celebrity sells to the press. Collect £22.', effect: { type: 'collect_gbp', amount: 22 } },
  { id: 'l24', title: 'Rare Stamp Find', desc: 'You discover a valuable stamp at a market. Collect £35.', effect: { type: 'collect_gbp', amount: 35 } },
  { id: 'l25', title: 'Bank Error in Your Favour', desc: 'The bank credits your account by mistake — keep it! Collect £28.', effect: { type: 'collect_gbp', amount: 28 } },
  { id: 'l26', title: 'Publishing Advance', desc: 'A publisher wants your travel memoirs. Receive £50.', effect: { type: 'collect_gbp', amount: 50 } },
  { id: 'l27', title: 'Antique Discovery', desc: 'A street market find proves valuable. Collect £38.', effect: { type: 'collect_gbp', amount: 38 } },
  { id: 'l28', title: 'Sporting Bet Win', desc: 'Your sporting prediction was correct! Collect £32.', effect: { type: 'collect_gbp', amount: 32 } },
  { id: 'l29', title: 'Radio Competition', desc: 'You phone in the correct answer. Receive £20 in cheques.', effect: { type: 'collect_cheques', amount: 20 } },
  { id: 'l30', title: 'Concert Performance', desc: 'You improvise on stage and pass the hat. Collect £15.', effect: { type: 'collect_gbp', amount: 15 } },
  { id: 'l31', title: 'Lucky Horseshoe', desc: 'Fortune smiles on you. Collect £24.', effect: { type: 'collect_gbp', amount: 24 } },
  { id: 'l32', title: 'Market Speculation', desc: 'Shares bought on a whim triple in value. Collect £65.', effect: { type: 'collect_gbp', amount: 65 } },
  { id: 'l33', title: 'Ambassador\'s Assistance', desc: 'The embassy smooths your travel. Next journey has no hazards.', effect: { type: 'next_journey_safe' } },
  { id: 'l34', title: 'Sea Captain\'s Shortcut', desc: 'Your captain knows a secret route. Current journey advanced by 8 spaces.', effect: { type: 'advance_journey', amount: 8 } },
  { id: 'l35', title: 'Favourable Winds', desc: 'Exceptional weather cuts your journey short. Advance 6 spaces.', effect: { type: 'advance_journey', amount: 6 } },
  { id: 'l36', title: 'Pilot Friend', desc: 'An old friend is your pilot — express service! Advance 10 spaces.', effect: { type: 'advance_journey', amount: 10 } },
]

export const RISK_CARDS = [
  { id: 'r01', title: 'Storm Diversion', desc: 'Your aircraft is diverted by a severe storm. You are stranded on Heard Island. Miss 2 turns.', effect: { type: 'divert', location: 'heard_island', missedTurns: 2 } },
  { id: 'r02', title: 'Customs Delay', desc: 'Officials insist on a thorough inspection. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r03', title: 'Passport Difficulties', desc: 'Your passport has an irregularity. Pay £20 and miss 1 turn.', effect: { type: 'pay_and_miss', gbpAmount: 20, missedTurns: 1 } },
  { id: 'r04', title: 'Luggage Lost', desc: 'The airline has misplaced your luggage. Pay £30 for emergency replacements.', effect: { type: 'pay_gbp', amount: 30 } },
  { id: 'r05', title: 'Food Poisoning', desc: 'A dodgy meal lays you low. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r06', title: 'Engine Trouble', desc: 'Your aircraft develops engine trouble and returns to base. Go back to your last city.', effect: { type: 'return_to_last_city' } },
  { id: 'r07', title: 'Airport Strike', desc: 'All airport staff are on strike. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r08', title: 'Visa Problem', desc: 'Your visa does not cover this region. Miss 1 turn and pay £15.', effect: { type: 'pay_and_miss', gbpAmount: 15, missedTurns: 1 } },
  { id: 'r09', title: 'Storm at Sea', desc: 'Rough weather delays your voyage. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r10', title: 'Train Derailment', desc: 'A minor derailment stops the line. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r11', title: 'Car Breakdown', desc: 'Your hired car has broken down. Pay £10 for repairs.', effect: { type: 'pay_gbp', amount: 10 } },
  { id: 'r12', title: 'Pickpocket!', desc: 'A thief relieves you of your wallet in a crowded market. Lose £25.', effect: { type: 'pay_gbp', amount: 25 } },
  { id: 'r13', title: 'Wrong Train', desc: 'You board the wrong train entirely. Return to your last city.', effect: { type: 'return_to_last_city' } },
  { id: 'r14', title: 'Grounded by Weather', desc: 'Thick fog grounds all flights. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r15', title: 'Souvenir Confiscated', desc: 'Customs confiscates one of your souvenirs. Lose 1 souvenir.', effect: { type: 'lose_souvenir' } },
  { id: 'r16', title: 'Hotel Overbooking', desc: 'No room at the inn! Spend a turn finding alternative accommodation. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r17', title: 'Diverted to Rockall', desc: 'Navigation error leaves you stranded off the Atlantic coast. Miss 2 turns.', effect: { type: 'divert', location: 'rockall', missedTurns: 2 } },
  { id: 'r18', title: 'Language Barrier', desc: 'A misunderstanding costs you time and money. Pay £15.', effect: { type: 'pay_gbp', amount: 15 } },
  { id: 'r19', title: 'Quarantine', desc: 'Medical inspection requires you to stay put. Miss 2 turns.', effect: { type: 'miss_turns', amount: 2 } },
  { id: 'r20', title: 'Delayed Connection', desc: 'Your connecting service is hours late. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r21', title: 'Curfew', desc: 'Local curfew prevents departure. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r22', title: 'Typhoon Warning', desc: 'Ships diverted due to typhoon. Your vessel makes for the nearest haven. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r23', title: 'Currency Crisis', desc: 'Local currency is temporarily non-convertible. Pay £20 in black-market fees.', effect: { type: 'pay_gbp', amount: 20 } },
  { id: 'r24', title: 'Diverted to Tristan da Cunha', desc: 'A navigation error takes you to the world\'s most remote inhabited island. Miss 2 turns.', effect: { type: 'divert', location: 'tristan_da_cunha', missedTurns: 2 } },
  { id: 'r25', title: 'Medical Emergency', desc: 'A fellow passenger requires assistance; you volunteer to stay and help. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r26', title: 'Border Closed', desc: 'The border crossing is unexpectedly shut. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r27', title: 'Missed Flight', desc: 'You arrive at the airport after the gate has closed. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r28', title: 'Damaged Documents', desc: 'Rain ruins your papers. Pay £12 for replacements and miss 1 turn.', effect: { type: 'pay_and_miss', gbpAmount: 12, missedTurns: 1 } },
  { id: 'r29', title: 'Diverted to Midway Island', desc: 'Fuel shortage forces a stop at this remote Pacific atoll. Miss 2 turns.', effect: { type: 'divert', location: 'midway', missedTurns: 2 } },
  { id: 'r30', title: 'Excess Baggage Fine', desc: 'The airline charges you for overweight luggage. Pay £18.', effect: { type: 'pay_gbp', amount: 18 } },
  { id: 'r31', title: 'Embassy Closed', desc: 'The embassy is shut for a national holiday. Miss 1 turn.', effect: { type: 'miss_turns', amount: 1 } },
  { id: 'r32', title: 'Navigation Error', desc: 'Your captain is hopelessly lost. Lose 8 spaces of journey progress.', effect: { type: 'lose_journey_progress', amount: 8 } },
  { id: 'r33', title: 'Ship Detour', desc: 'Cargo requirements force a lengthy detour. Lose 6 spaces of progress.', effect: { type: 'lose_journey_progress', amount: 6 } },
  { id: 'r34', title: 'Road Closed', desc: 'Road works block the route. Pay £8 for alternative transport.', effect: { type: 'pay_gbp', amount: 8 } },
  { id: 'r35', title: 'Robbery!', desc: 'Armed bandits stop your vehicle. Pay £35.', effect: { type: 'pay_gbp', amount: 35 } },
  { id: 'r36', title: 'Mechanical Failure', desc: 'A serious mechanical failure halts your journey. Return to your last city.', effect: { type: 'return_to_last_city' } },
]

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const PLAYER_COLORS = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085']
export const SOUVENIR_TARGET_OPTIONS = [3, 5, 7, 10]
