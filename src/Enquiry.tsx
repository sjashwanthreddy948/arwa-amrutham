import { useEffect, useRef, useState } from 'react'
import type { FormEvent, InputHTMLAttributes } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { business } from './config/business'
import { ActionButton, FormField, Icon, SelectField } from './Interaction'

const requirements = [
  'Bulk supply',
  'Regular bottle',
  'Compact bottle',
  'General enquiry',
]

export default function Enquiry({
  close,
  initial,
}: {
  close: () => void
  initial: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'ready' | 'sent' | 'error'
  >('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const result = status === 'ready' || status === 'sent'
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [])
  useEffect(() => {
    if (result) heading.current?.focus()
  }, [result])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const current = event.currentTarget
    const invalid: Record<string, string> = {}
    const controls = Array.from(current.elements).filter(
      (element): element is HTMLInputElement =>
        element instanceof HTMLInputElement,
    )
    controls.forEach((input) => {
      if (!input.checkValidity() || (input.required && !input.value.trim())) {
        invalid[input.id] = input.validity.patternMismatch
          ? 'Enter a phone number with 7–20 characters.'
          : input.validity.rangeUnderflow
            ? 'Choose today or a later date.'
            : `Please enter ${input.name.toLowerCase() === 'name' ? 'your name' : input.name.toLowerCase()}.`
      }
    })
    setErrors(invalid)
    if (Object.keys(invalid).length) {
      document.getElementById(Object.keys(invalid)[0])?.focus()
      return
    }
    const data = Object.fromEntries(new FormData(current))
    setDraft(
      `ARWA AMRUTHAM — SUPPLY ENQUIRY\n\n${Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}`,
    )
    if (!business.enquiryEndpoint) {
      setStatus('ready')
      return
    }
    setStatus('sending')
    try {
      const response = await fetch(business.enquiryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Unable to send')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([draft], { type: 'text/plain;charset=utf-8' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'ARWA-supply-enquiry.txt'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function input(
    id: string,
    label: string,
    props: InputHTMLAttributes<HTMLInputElement>,
    hint?: string,
    location = false,
  ) {
    return (
      <FormField
        id={id}
        label={label}
        required={props.required}
        error={errors[id]}
        hint={hint}
        icon={location ? <Icon name="pin" /> : undefined}
      >
        <input
          {...props}
          id={id}
          aria-invalid={!!errors[id]}
          aria-describedby={errors[id] || hint ? `${id}-hint` : undefined}
          onInput={() => {
            if (errors[id])
              setErrors((previous) => {
                const next = { ...previous }
                delete next[id]
                return next
              })
          }}
        />
      </FormField>
    )
  }
  return (
    <motion.dialog
      ref={dialog}
      className="enquiry-dialog"
      aria-labelledby="enquiry-title"
      onCancel={close}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
    >
      <div className="dialog-top">
        <a href="#home" className="wordmark" onClick={close}>
          ARWA<span>AMRUTHAM</span>
        </a>
        <button
          className="close-button"
          onClick={close}
          aria-label="Close enquiry"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="enquiry-content">
        <div className="enquiry-intro">
          <div className="eyebrow">
            <span className="tiny-dot" />
            LET’S MAKE IT HAPPEN
          </div>
          <h2 id="enquiry-title">
            <span className="enquiry-more">MORE</span>ARWA.
            <br />
            <span className="outline-white">PLEASE.</span>
          </h2>
          <p>
            Big plans deserve pure refreshment.
            <br />
            Tell us what you have in mind.
          </p>
          <span className="form-footnote">
            KURNOOL, ANDHRA PRADESH · OPEN 24 HOURS
          </span>
        </div>
        <div className="enquiry-body">
          {result && (
            <div className="request-result">
              <span className="result-symbol" aria-hidden="true">
                <Icon name="arrow" />
              </span>
              <div className="eyebrow">
                {status === 'sent' ? 'REQUEST SENT' : 'REQUEST READY'}
              </div>
              <h3 ref={heading} tabIndex={-1}>
                {status === 'sent' ? 'Request sent.' : 'Your request is ready.'}
              </h3>
              <p>
                {status === 'sent'
                  ? 'Thank you for getting in touch with ARWA.'
                  : 'Your details have not been sent. Download your request and share it with ARWA in person.'}
              </p>
              {status === 'ready' && (
                <ActionButton onClick={download}>DOWNLOAD ENQUIRY</ActionButton>
              )}
              <button
                className="text-button"
                onClick={() => {
                  setStatus('idle')
                  requestAnimationFrame(() =>
                    form.current?.querySelector('input')?.focus(),
                  )
                }}
              >
                Edit details <Icon name="arrow" />
              </button>
            </div>
          )}
          <form
            ref={form}
            onSubmit={submit}
            className="enquiry-form"
            noValidate
            hidden={result}
          >
            <div className="form-section-label">
              <span>01 / YOUR DETAILS</span>
              <span>* REQUIRED</span>
            </div>
            <div className="form-grid">
              {input('enquiry-name', 'Name', {
                name: 'Name',
                autoComplete: 'name',
                required: true,
                placeholder: 'Your name',
                maxLength: 100,
              })}
              {input('enquiry-phone', 'Phone', {
                name: 'Phone',
                type: 'tel',
                inputMode: 'tel',
                autoComplete: 'tel',
                required: true,
                pattern: '[+0-9 \\(\\)\\-]{7,20}',
                placeholder: 'Your contact number',
                maxLength: 20,
              })}
              {input('enquiry-organization', 'Business / organization', {
                name: 'Organization',
                autoComplete: 'organization',
                placeholder: 'Company / organization',
                maxLength: 150,
              })}
              {input(
                'enquiry-area',
                'Delivery area',
                {
                  name: 'Delivery area',
                  autoComplete: 'street-address',
                  required: true,
                  placeholder: 'Area in or around Kurnool',
                  maxLength: 150,
                },
                undefined,
                true,
              )}
            </div>
            <div className="form-section-label">
              <span>02 / THE PLAN</span>
            </div>
            <div className="form-grid">
              <SelectField
                id="enquiry-requirement"
                label="Requirement"
                initial={initial || 'Bulk supply'}
                options={requirements}
              />
              {input(
                'enquiry-quantity',
                'Quantity',
                {
                  name: 'Quantity',
                  placeholder: 'Approx. quantity',
                  maxLength: 80,
                },
                'Example: 100 bottles',
              )}
              {input('enquiry-date', 'Preferred date', {
                name: 'Preferred date',
                type: 'date',
                min: new Date().toLocaleDateString('en-CA', {
                  timeZone: 'Asia/Kolkata',
                }),
              })}
            </div>
            <FormField id="enquiry-message" label="Anything else?">
              <textarea
                id="enquiry-message"
                name="Message"
                rows={5}
                maxLength={2000}
                placeholder="Tell us a little about your plans…"
                onInput={(event) => {
                  const field = event.currentTarget
                  field.style.height = 'auto'
                  field.style.height = `${Math.min(320, field.scrollHeight)}px`
                }}
              />
            </FormField>
            <p className="form-notice">
              {business.enquiryEndpoint
                ? 'Your details are used to respond to this enquiry.'
                : 'Prepare a downloadable request to share with ARWA. This does not place an order.'}
            </p>
            <ActionButton type="submit" disabled={status === 'sending'}>
              {status === 'sending'
                ? 'SENDING…'
                : business.enquiryEndpoint
                  ? 'SEND REQUEST'
                  : 'PREPARE REQUEST'}
            </ActionButton>
            <p className="submit-feedback" role="status">
              {status === 'sending' ? 'Sending your ARWA request…' : ''}
            </p>
            {status === 'error' && (
              <p className="field-error" role="alert">
                We couldn’t send your request. Your details are saved here.
                Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </motion.dialog>
  )
}
