import { useId } from 'react'

/** Local vector decoration: no image requests, interaction or animation loops. */
export function SignalMesh({ className }: { className: string | undefined }) {
  const id = useId().replaceAll(':', '')
  return <svg className={className} viewBox="0 0 220 170" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${id}-wire`} width="23" height="29" patternUnits="userSpaceOnUse" patternTransform="rotate(-19)">
        <path d="M11.5 0 23 7.5V21.5L11.5 29 0 21.5V7.5Z" stroke="#070e2c" strokeWidth="2.2" />
        <path d="M12.5 1 22 7.5M1 8V21" stroke="#b994ff" strokeOpacity=".44" strokeWidth=".6" />
      </pattern>
      <clipPath id={`${id}-cut`}>
        <path d="M0 0H202V9H214V27H204V43H190V57H181V63H165V77H146V90H135V100H120V117H100V129H75V143H49V152H26V164H0Z" />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id}-cut)`}>
      <path fill="#6335dc" d="M0 0H220V170H0Z" />
      <path fill="#a03be0" d="M-10 57 168-9 209 17 0 134Z" />
      <path fill="#354beb" d="M0 0H115L0 83ZM2 155 172 38 220 84 62 178Z" />
      <path fill="#329b9a" fillOpacity=".55" d="m-15 35 77-45 31 21-100 65Zm39 77 100-66 29 13-101 82Z" />
      <path fill={`url(#${id}-wire)`} d="M0 0H220V170H0Z" />
      <path d="m-10 120 225-82M35-8l67 184" stroke="#080d2b" strokeWidth="5" />
      <path d="m-10 124 225-82" stroke="#b485ff" strokeOpacity=".55" />
    </g>
    <g fill="#8650ff">
      <path d="M168 83h13v8h-13zM146 108h9v7h-9zM97 142h12v7H97zM58 162h13v6H58zM198 60h7v6h-7z" />
      <path d="M181 75h8v6h-8zM120 126h7v8h-7zM79 150h8v6h-8z" fill="#ba38de" />
      <path d="M188 88h4v4h-4zM140 120h4v4h-4zM108 154h4v4h-4zM42 165h4v4h-4z" fill="#b6ee56" />
    </g>
  </svg>
}

export function SignalFrame({ className }: { className: string | undefined }) {
  return <svg className={className} viewBox="0 0 480 880" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
    <path d="M20 3H465L477 15V861L461 877H15L3 865V20Z" stroke="#7860ef" strokeWidth="2" />
    <path d="M4 104V19L20 4H58" stroke="#d7ff3f" strokeWidth="6" />
    <path d="M425 4H466L476 14V49" stroke="#b72ef0" strokeWidth="6" />
    <path d="M476 813V861L461 876H416" stroke="#d7ff3f" strokeWidth="6" />
    <path d="M54 876H15L4 865V833" stroke="#a43aed" strokeWidth="6" />
    <path d="M4 148V375M476 109V325M476 520V730M4 604V768" stroke="#356af5" strokeWidth="2" />
    <path d="M466 4h7v5h-7zM7 872h10v5H7zM458 867h9v7h-9z" fill="#c346f4" />
  </svg>
}
