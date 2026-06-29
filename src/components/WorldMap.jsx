import { CITIES, ROUTES, REMOTE_LOCATIONS } from '../data.js'

const W = 900, H = 500

// Simplified continent outlines (SVG path data, equirectangular-ish, hand-tuned)
const CONTINENTS = [
  // North America
  { id: 'na', d: 'M 25,55 L 75,42 L 140,38 L 200,72 L 228,100 L 245,130 L 235,160 L 245,185 L 235,212 L 220,230 L 200,220 L 178,208 L 155,195 L 130,195 L 105,188 L 78,175 L 55,158 L 40,135 L 28,108 Z' },
  // South America
  { id: 'sa', d: 'M 218,232 L 260,225 L 305,238 L 325,265 L 330,298 L 318,345 L 290,388 L 260,402 L 228,390 L 205,358 L 195,316 L 200,272 Z' },
  // Europe (main body + Iberian + Scandinavian hint)
  { id: 'eu', d: 'M 345,68 L 360,55 L 380,52 L 400,54 L 425,52 L 452,56 L 475,68 L 498,82 L 502,100 L 495,120 L 480,132 L 462,138 L 445,132 L 430,142 L 412,136 L 396,132 L 382,137 L 368,128 L 356,115 L 348,97 Z' },
  // Africa
  { id: 'af', d: 'M 360,148 L 400,142 L 432,142 L 462,148 L 490,158 L 510,175 L 522,202 L 525,245 L 520,292 L 505,338 L 480,378 L 455,388 L 428,378 L 408,345 L 390,308 L 372,268 L 358,230 L 350,195 L 350,170 Z' },
  // Asia (mainland, rough)
  { id: 'as', d: 'M 492,68 L 548,52 L 618,45 L 688,50 L 748,60 L 782,85 L 792,115 L 778,145 L 755,162 L 732,178 L 708,198 L 678,218 L 648,232 L 615,245 L 580,252 L 550,255 L 520,252 L 498,242 L 480,225 L 468,205 L 460,180 L 458,150 L 465,125 L 476,102 Z' },
  // Indian subcontinent
  { id: 'in', d: 'M 535,195 L 555,185 L 580,188 L 600,205 L 605,230 L 590,252 L 570,258 L 548,252 L 535,235 L 530,215 Z' },
  // Southeast Asia peninsulas (rough)
  { id: 'sea', d: 'M 608,238 L 628,225 L 648,228 L 660,245 L 652,265 L 635,272 L 618,262 Z' },
  // Australia
  { id: 'au', d: 'M 648,285 L 710,272 L 760,278 L 785,305 L 782,348 L 760,378 L 720,388 L 682,380 L 655,352 L 642,318 Z' },
  // Japan (simplified)
  { id: 'jp', d: 'M 718,128 L 732,122 L 742,135 L 736,152 L 722,148 L 715,138 Z' },
  // UK (simplified)
  { id: 'uk', d: 'M 372,88 L 380,82 L 392,85 L 395,100 L 385,108 L 374,102 Z' },
]

const TRANSPORT_COLORS = {
  air:  '#e74c3c',
  sea:  '#2980b9',
  rail: '#8e44ad',
  road: '#e67e22',
}
const TRANSPORT_DASH = {
  air:  '6 4',
  sea:  '2 6',
  rail: '8 3',
  road: '4 4',
}

export default function WorldMap({ players, currentPlayerIndex, highlightRoute }) {
  // Deduplicate routes visually (show each city pair once per transport type)
  const drawnPairs = new Set()
  const visibleRoutes = ROUTES.filter(r => {
    const key = [r.from, r.to, r.type].sort().join('-')
    if (drawnPairs.has(key)) return false
    drawnPairs.add(key)
    return true
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ocean */}
      <rect width={W} height={H} fill="#1a4b6e" />

      {/* Grid lines (latitude/longitude hint) */}
      {[100, 200, 300, 400].map(y => (
        <line key={`lat${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1e5278" strokeWidth={0.5} />
      ))}
      {[100, 200, 300, 400, 500, 600, 700, 800].map(x => (
        <line key={`lon${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1e5278" strokeWidth={0.5} />
      ))}

      {/* Continents */}
      {CONTINENTS.map(c => (
        <path key={c.id} d={c.d} fill="#c8a96e" stroke="#9a7a45" strokeWidth={1.2} />
      ))}

      {/* Routes */}
      {visibleRoutes.map(r => {
        const from = CITIES[r.from]
        const to = CITIES[r.to]
        if (!from || !to) return null
        const isHighlighted = highlightRoute && (
          (highlightRoute.from === r.from && highlightRoute.to === r.to) ||
          (highlightRoute.from === r.to && highlightRoute.to === r.from)
        ) && highlightRoute.type === r.type
        return (
          <line
            key={r.id}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke={isHighlighted ? '#f1c40f' : TRANSPORT_COLORS[r.type]}
            strokeWidth={isHighlighted ? 3 : 1.2}
            strokeDasharray={TRANSPORT_DASH[r.type]}
            opacity={isHighlighted ? 1 : 0.55}
          />
        )
      })}

      {/* Remote locations */}
      {Object.values(REMOTE_LOCATIONS).map(loc => (
        <g key={loc.id}>
          <circle cx={loc.x} cy={loc.y} r={5} fill="#c0392b" opacity={0.6} />
          <text
            x={loc.x} y={loc.y - 9}
            textAnchor="middle"
            fill="#f8a"
            fontSize={8}
            fontStyle="italic"
          >{loc.name}</text>
        </g>
      ))}

      {/* City dots and labels */}
      {Object.values(CITIES).map(city => {
        const isStart = city.isStart
        return (
          <g key={city.id}>
            <circle
              cx={city.x} cy={city.y}
              r={isStart ? 7 : 5}
              fill={isStart ? '#f1c40f' : '#f5edd6'}
              stroke={isStart ? '#c9a227' : '#8b7355'}
              strokeWidth={1.5}
            />
            <text
              x={city.x} y={city.y - 9}
              textAnchor="middle"
              fill="#f5edd6"
              fontSize={isStart ? 10 : 9}
              fontWeight={isStart ? 700 : 400}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >{city.name}</text>
          </g>
        )
      })}

      {/* Player tokens on map */}
      {players.map((player, i) => {
        const { state } = player
        let x, y, label

        if (state.type === 'city') {
          const city = CITIES[state.cityId]
          if (!city) return null
          // Offset overlapping players
          const offset = getPlayerCityOffset(players, i)
          x = city.x + offset.dx
          y = city.y + offset.dy
          label = city.name
        } else if (state.type === 'traveling') {
          const fromCity = CITIES[state.from]
          const toCity = CITIES[state.to]
          if (!fromCity || !toCity) return null
          const t = state.distance > 0 ? state.progress / state.distance : 0
          x = fromCity.x + (toCity.x - fromCity.x) * t
          y = fromCity.y + (toCity.y - fromCity.y) * t
        } else if (state.type === 'diverted') {
          const remote = REMOTE_LOCATIONS[state.location]
          if (!remote) return null
          x = remote.x
          y = remote.y
        } else {
          return null
        }

        const isCurrentPlayer = i === currentPlayerIndex
        return (
          <g key={player.id} transform={`translate(${x},${y})`}>
            <circle
              r={isCurrentPlayer ? 9 : 7}
              fill={player.color}
              stroke="white"
              strokeWidth={isCurrentPlayer ? 2.5 : 1.5}
              opacity={0.9}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={isCurrentPlayer ? 9 : 8}
              fontWeight={700}
            >{player.name[0]}</text>
            {isCurrentPlayer && (
              <circle r={12} fill="none" stroke={player.color} strokeWidth={1.5} opacity={0.5} />
            )}
          </g>
        )
      })}

      {/* Legend */}
      <g transform="translate(12, 12)">
        <rect width={130} height={78} rx={4} fill="rgba(10,30,50,0.75)" />
        {Object.entries(TRANSPORT_COLORS).map(([type, color], i) => (
          <g key={type} transform={`translate(8, ${14 + i * 16})`}>
            <line x1={0} y1={0} x2={22} y2={0} stroke={color} strokeWidth={2} strokeDasharray={TRANSPORT_DASH[type]} />
            <text x={28} y={4} fill="#f5edd6" fontSize={10} fontFamily="Source Sans 3, sans-serif" textTransform="capitalize">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </text>
          </g>
        ))}
        <text x={8} y={8} fill="#c9a227" fontSize={9} fontFamily="Source Sans 3, sans-serif" fontWeight={600}>ROUTES</text>
      </g>
    </svg>
  )
}

function getPlayerCityOffset(players, playerIndex) {
  const player = players[playerIndex]
  if (player.state.type !== 'city') return { dx: 0, dy: 0 }
  const cityId = player.state.cityId
  const sameCityPlayers = players
    .filter(p => p.state.type === 'city' && p.state.cityId === cityId)
    .map(p => p.id)
  const posInGroup = sameCityPlayers.indexOf(player.id)
  const angles = [0, 90, 180, 270, 45, 135]
  const angle = (angles[posInGroup] || 0) * Math.PI / 180
  const dist = posInGroup === 0 ? 0 : 12
  return { dx: Math.round(Math.cos(angle) * dist), dy: Math.round(Math.sin(angle) * dist) }
}
