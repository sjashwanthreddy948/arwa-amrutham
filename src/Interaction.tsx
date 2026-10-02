import { useEffect, useState } from 'react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { business, directionsUrl } from './config/business'

export function Icon({
  name,
}: {
  name: 'pin' | 'phone' | 'chat' | 'arrow' | 'chevron' | 'close'
}) {
  const paths = {
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <path d="m7 3 3 5-2 2c1.3 3 3 4.7 6 6l2-2 5 3c0 3-2 4-4 4C10 20 4 14 3 7c0-2 1-4 4-4Z" />
    ),
    chat: (
      <path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.8A9 9 0 1 1 21 11.5Z" />
    ),
    arrow: (
      <>
        <path d="M5 19 19 5M5 5h14v14" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return (
    <svg
      className="ui-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function ActionButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`action-primary ${className}`} {...props}>
      <span>{children}</span>
      <span className="action-arrow">
        <Icon name="arrow" />
      </span>
    </button>
  )
}

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  icon,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={`field-control ${icon ? 'with-icon' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        {children}
      </div>
      {(error || hint) && (
        <p id={`${id}-hint`} className={error ? 'field-error' : 'field-hint'}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export function SelectField({
  id,
  label,
  initial,
  options,
}: {
  id: string
  label: string
  initial: string
  options: string[]
}) {
  return (
    <FormField id={id} label={label}>
      <div className="select-control">
        <select id={id} name="Requirement" defaultValue={initial}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Icon name="chevron" />
      </div>
    </FormField>
  )
}

export function MobileActionDock({
  openEnquiry,
  hidden,
}: {
  openEnquiry: () => void
  hidden: boolean
}) {
  const [obscured, setObscured] = useState(false)
  useEffect(() => {
    const footer = document.querySelector('footer')
    const observer = new IntersectionObserver(
      ([entry]) => setObscured(entry.isIntersecting),
      { rootMargin: '0px 0px 80px 0px' },
    )
    if (footer) observer.observe(footer)
    return () => observer.disconnect()
  }, [])
  if (hidden || obscured) return null
  return (
    <nav className="mobile-dock" aria-label="Quick contact">
      {business.phone ? (
        <a href={`tel:${business.phone}`}>
          <Icon name="phone" />
          <span>Call</span>
        </a>
      ) : (
        <a href="#contact">
          <Icon name="chat" />
          <span>Contact</span>
        </a>
      )}
      {business.whatsapp && (
        <a
          href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="chat" />
          <span>WhatsApp</span>
        </a>
      )}
      <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="pin" />
        <span>Directions</span>
      </a>
      <button onClick={openEnquiry}>
        <Icon name="arrow" />
        <span>Enquire</span>
      </button>
    </nav>
  )
}
