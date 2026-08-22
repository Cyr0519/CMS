import type { SVGProps } from "react";

/**
 * Bibliothèque d'icônes unique du CMS : traits de 1.75, grille 24, extrémités
 * arrondies. Aucune dépendance externe, donc aucun mélange de styles possible.
 * Toute nouvelle icône s'ajoute ici et nulle part ailleurs.
 */
const paths = {
  dashboard: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  article: <><path d="M4 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-8h4" /><path d="M10 7h6M10 11h6M10 15h4" /></>,
  tag: <><path d="M3 3h7.17a2 2 0 0 1 1.42.59l8.82 8.82a2 2 0 0 1 0 2.83l-5.17 5.17a2 2 0 0 1-2.83 0L3.59 11.6A2 2 0 0 1 3 10.17V3Z" /><circle cx="7.5" cy="7.5" r="1.25" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M20 21v-1a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v1" /></>,
  comment: <path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />,
  settings: <><path d="M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3" /><path d="M1.5 15h5M9.5 8h5M17.5 17h5" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  search: <><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.3-4.3" /></>,
  bell: <><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5" /><path d="M13.73 20.5a2 2 0 0 1-3.46 0" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  arrowLeft: <path d="M19 12H5m7 7-7-7 7-7" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  plus: <path d="M12 5v14M5 12h14" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z" /></>,
  trash: <><path d="M3.5 6h17M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" /><path d="M18.5 6v13.5A1.5 1.5 0 0 1 17 21H7a1.5 1.5 0 0 1-1.5-1.5V6" /><path d="M10 10.5v6M14 10.5v6" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.75" cy="8.75" r="1.5" /><path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></>,
  check: <path d="m20 6-11 11-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8.25 12.25 2.5 2.5 5-5.5" /></>,
  alert: <><path d="m10.3 3.9-8.2 14A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-3.1l-8.2-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4M12 17.5h.01" /></>,
  alertCircle: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16.5V11M12 7.75h.01" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.25l3.25 1.75" /></>,
  send: <><path d="m21.5 2.5-8 19-3.5-8.5-8.5-3.5Z" /><path d="M21.5 2.5 10 13.5" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M8 3v5h7" /></>,
  filter: <path d="M21 4H3l7.2 8.5V19l3.6 2v-8.5L21 4Z" />,
  panel: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9.5 3v18" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10.5h18" /></>,
  more: <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>,
  inbox: <><path d="M22 12h-5.5l-1.7 3h-5.6L7.5 12H2" /><path d="M5.6 4.9 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.6-7.1A2 2 0 0 0 16.6 4H7.4a2 2 0 0 0-1.8.9Z" /></>,
  refresh: <><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" /><path d="M20.5 3v5h-5" /></>,
  trend: <><path d="m3 16.5 6-6 4 4 8-8" /><path d="M16.5 6.5H21v4.5" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10.5 13.5" /><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  shield: <path d="M12 21s7.5-3.6 7.5-9.4V5.6L12 3 4.5 5.6v6c0 5.8 7.5 9.4 7.5 9.4Z" />,
  heart: <path d="M12 20.5 4.7 13.2A4.9 4.9 0 0 1 3.5 9.9 4.6 4.6 0 0 1 8 4.5c1.6 0 2.9.6 4 2 1.1-1.4 2.4-2 4-2a4.6 4.6 0 0 1 4.5 5.4 4.9 4.9 0 0 1-1.2 3.3Z" />,
  dot: <circle cx="12" cy="12" r="4" />,
  book: <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22.5Z" /><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2.5Z" /></>,
} as const;

export type IconName = keyof typeof paths;

type Props = Omit<SVGProps<SVGSVGElement>, "name"> & { name: IconName; size?: number; strokeWidth?: number; filled?: boolean };

export default function Icon({ name, size = 16, strokeWidth = 1.75, filled = false, className = "", ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
