import { useId } from 'react'

export default function BottleFallback({
  className = '',
}: {
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      className={`bottle-fallback ${className}`}
      viewBox="0 0 240 600"
      role="img"
      aria-label="Illustrated ARWA bottle with an orange cap and label"
    >
      <defs>
        <linearGradient id={`${id}glass`}>
          <stop stopColor="#add6dc" stopOpacity=".7" />
          <stop offset=".13" stopColor="#fff" stopOpacity=".9" />
          <stop offset=".3" stopColor="#dff5f7" stopOpacity=".45" />
          <stop offset=".65" stopColor="#c1e2e6" stopOpacity=".28" />
          <stop offset=".84" stopColor="white" stopOpacity=".95" />
          <stop offset="1" stopColor="#8ab5bb" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id={`${id}cap`}>
          <stop stopColor="#c63b07" />
          <stop offset=".4" stopColor="#ff7b2c" />
          <stop offset=".8" stopColor="#f45b18" />
          <stop offset="1" stopColor="#d9410b" />
        </linearGradient>
        <linearGradient id={`${id}label`}>
          <stop stopColor="#cc430b" />
          <stop offset=".4" stopColor="#ff7630" />
          <stop offset=".8" stopColor="#f45b18" />
          <stop offset="1" stopColor="#d7440b" />
        </linearGradient>
      </defs>
      <path
        d="M87 60h66v52c0 20 48 42 48 89v337c0 22-17 31-36 28l-22-6-23 9-24-9-23 6c-19 3-34-8-34-28V201c0-47 48-69 48-89z"
        fill={`url(#${id}glass)`}
        stroke="#9bc4ca"
        strokeWidth="1.4"
      />
      <path
        d="M45 216q75 10 150 0M44 241q76 10 152 0M44 265q76 10 152 0M44 447q76 10 152 0M44 472q76 10 152 0M44 497q76 10 152 0M44 522q76 10 152 0"
        fill="none"
        stroke="white"
        strokeOpacity=".8"
        strokeWidth="6"
      />
      <path
        d="M53 216v304M181 216v304"
        stroke="white"
        strokeOpacity=".7"
        strokeWidth="5"
      />
      <path
        d="M40 292q80-8 160 0v133q-80 13-160 0z"
        fill={`url(#${id}label)`}
      />
      <text
        x="120"
        y="319"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="Arial"
        letterSpacing="3"
      >
        PURE REFRESHMENT
      </text>
      <text
        x="120"
        y="375"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial"
        fontWeight="900"
        fontSize="48"
        letterSpacing="-3"
      >
        ARWA
      </text>
      <text
        x="120"
        y="397"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial"
        fontSize="13"
        letterSpacing="3"
      >
        AMRUTHAM
      </text>
      <text
        x="120"
        y="414"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial"
        fontSize="7"
        letterSpacing="1"
      >
        PACKAGED DRINKING WATER
      </text>
      <rect
        x="79"
        y="28"
        width="82"
        height="43"
        rx="10"
        fill={`url(#${id}cap)`}
      />
      {Array.from({ length: 17 }, (_, n) => (
        <path
          key={n}
          d={`M${84 + n * 4.5} 34v31`}
          stroke="#a5370a"
          strokeOpacity=".3"
          strokeWidth="1.5"
        />
      ))}
      <rect x="82" y="72" width="76" height="7" rx="2" fill="#ee5519" />
      <path
        d="M64 197q4-36 33-61M67 540q23 12 40 6"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity=".8"
      />
    </svg>
  )
}
