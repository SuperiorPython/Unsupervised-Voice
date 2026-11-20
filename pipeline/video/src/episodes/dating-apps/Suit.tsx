// The business suit worn in every "corporate" bit of the episode: the pitch meeting, the boardroom
// and the soulmate warehouse door. Use it as <Astronaut torsoExtra={<FakeSuit />} outfit={SUIT} />.
import React from "react";
import { colors, fonts } from "../../theme";

// Sleeves and trousers for the suit: charcoal, red hands, black shoes.
export const SUIT = { front: "#3B3B4A", top: "#4C4C5E", side: "#2A2A36", cuff: "#E02A3C", cuffSide: "#A01826", shoe: "#16161A", shoeSide: "#0A0A0D" };

// The obviously fake suit: a flat, painted-on jacket with a clip-on tie and the price tag
// still attached. Sleeves and trousers come from SUIT below. Drawn in the astronaut's own coordinates and attached to his torso,
// so it bobs with him. (This is the jacket front; sleeves and trousers are the astronaut's `outfit` prop.)
export const FakeSuit: React.FC = () => (
  <g>
    {/* jacket panels */}
    <polygon points="-75,-98 -30,-98 0,24 0,92 -75,92" fill="#3B3B4A" stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
    <polygon points="75,-98 30,-98 0,24 0,92 75,92" fill="#3B3B4A" stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
    {/* shirt */}
    <polygon points="-30,-98 30,-98 0,24" fill={colors.paper} stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
    {/* lapels */}
    <polygon points="-30,-98 -50,-64 -20,-30 0,24" fill="#5A5A70" stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
    <polygon points="30,-98 50,-64 20,-30 0,24" fill="#5A5A70" stroke={colors.ink} strokeWidth={4} strokeLinejoin="round" />
    {/* clip-on tie: straight, and kept inside the shirt opening */}
    <polygon points="-8,-96 8,-96 6,-80 -6,-80" fill={colors.redDark} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
    <polygon points="-6,-80 6,-80 12,-30 0,6 -12,-30" fill={colors.red} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
    {/* buttons and pocket square */}
    <circle cx={-14} cy={44} r={5} fill={colors.ink} />
    <circle cx={-14} cy={68} r={5} fill={colors.ink} />
    <polygon points="-62,-30 -40,-30 -51,-46" fill={colors.paper} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
    {/* the price tag, still on, hanging from the lapel */}
    <path d="M46 -62 L62 -26" stroke={colors.paper} strokeWidth={3} fill="none" />
    <g transform="rotate(10 62 -20)">
      <rect x={40} y={-26} width={44} height={26} fill="#FFF3F4" stroke={colors.ink} strokeWidth={3} />
      <text x={62} y={-7} textAnchor="middle" fontFamily={fonts.sans} fontWeight={900} fontSize={15} fill={colors.red}>$9.99</text>
    </g>
  </g>
);
