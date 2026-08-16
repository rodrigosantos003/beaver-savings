/**
 * Beaver Savings color palette — programmatic access for charts, SVGs, etc.
 * Source of truth for hex values is `app/globals.css`.
 */

export const beaver = {
  50: "#faf6f1",
  100: "#f0e6d8",
  200: "#e0ceb8",
  300: "#c9ad8c",
  400: "#a8855c",
  500: "#8b5e34",
  600: "#704a28",
  700: "#57381e",
  800: "#3d2715",
  900: "#26180d",
  950: "#1a1108",
} as const;

/** Savings green — growth, deposits, positive balances */
export const savings = {
  50: "#edf7f2",
  100: "#d4ede0",
  200: "#a8dbc1",
  300: "#6bbf94",
  400: "#3da06e",
  500: "#2d8659",
  600: "#236b47",
  700: "#1a5035",
  800: "#123624",
  900: "#0a1f15",
  950: "#051009",
} as const;

/** Coin gold — rewards, milestones, highlights */
export const coin = {
  50: "#fdf8eb",
  100: "#faefc8",
  200: "#f5de91",
  300: "#eec956",
  400: "#e5b318",
  500: "#d4a017",
  600: "#b8860b",
  700: "#946e09",
  800: "#6b5007",
  900: "#423205",
  950: "#2a1f03",
} as const;

/** River blue — trust, links, informational UI */
export const river = {
  50: "#f8fafb",
  100: "#e8eef2",
  200: "#c5d5e0",
  300: "#94b5c9",
  400: "#5e8fa8",
  500: "#457b9d",
  600: "#366280",
  700: "#284a61",
  800: "#1b3342",
  900: "#0f1e27",
  950: "#081219",
} as const;

export const palette = { beaver, savings, coin, river } as const;
