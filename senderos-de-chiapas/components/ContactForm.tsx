'use client'

import { useState, FormEvent } from 'react'

const LIMITS = { name: 100, subject: 200, message: 2000 }
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Record<'name' | 'email' | 'subject' | 'message', string | undefined>

function validateClient(body: { name: string; email: string; subject: string; message: string }): FieldErrors {
  const errors: FieldErrors = { name: undefined, email: undefined, subject: undefined, message: undefined }
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const subject = (body.subject ?? '').trim()
  const message = (body.message ?? '').trim()

  if (!name) errors.name = 'El nombre es obligatorio.'
  else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
  else if (name.length > LIMITS.name) errors.name = `El nombre no puede superar ${LIMITS.name} caracteres.`

  if (!email) errors.email = 'El email es obligatorio.'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Introduce un email válido.'

  if (!subject) errors.subject = 'El asunto es obligatorio.'
  else if (subject.length < 2) errors.subject = 'El asunto debe tener al menos 2 caracteres.'
  else if (subject.length > LIMITS.subject) errors.subject = `El asunto no puede superar ${LIMITS.subject} caracteres.`

  if (!message) errors.message = 'El mensaje es obligatorio.'
  else if (message.length < 10) errors.message = 'El mensaje debe tener al menos 10 caracteres.'
  else if (message.length > LIMITS.message) errors.message = `El mensaje no puede superar ${LIMITS.message} caracteres.`

  return errors
}

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ name: undefined, email: undefined, subject: undefined, message: undefined })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    setFieldErrors({ name: undefined, email: undefined, subject: undefined, message: undefined })

    const form = e.currentTarget
    const formData = new FormData(form)
    const website = formData.get('website')
    if (website) {
      setStatus('success')
      return
    }

    const body = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      subject: String(formData.get('subject') ?? ''),
      message: String(formData.get('message') ?? ''),
    }

    const errors = validateClient(body)
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors)
      return
    }

    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data?.errors && typeof data.errors === 'object') {
          setFieldErrors({
            name: data.errors.name,
            email: data.errors.email,
            subject: data.errors.subject,
            message: data.errors.message,
          })
        } else {
          setStatus('error')
          setErrorMessage(data?.error || 'No se pudo enviar el mensaje.')
        }
        return
      }
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setErrorMessage('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <>
      <form className="contact-form" onSubmit={handleSubmit} autoComplete="off">
        {/* Honeypot: los bots suelen rellenar campos ocultos; si viene con valor, no enviamos */}
        <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="website">No rellenar</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form_group">
              <input
                type="text"
                className={`form_control ${fieldErrors.name ? 'is-invalid' : ''}`}
                placeholder="Nombre"
                name="name"
                maxLength={LIMITS.name}
                required
                disabled={status === 'sending'}
                autoComplete="off"
              />
              {fieldErrors.name && <span className="invalid-feedback d-block">{fieldErrors.name}</span>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form_group">
              <input
                type="email"
                className={`form_control ${fieldErrors.email ? 'is-invalid' : ''}`}
                placeholder="Tu Email"
                name="email"
                required
                disabled={status === 'sending'}
                autoComplete="off"
              />
              {fieldErrors.email && <span className="invalid-feedback d-block">{fieldErrors.email}</span>}
            </div>
          </div>
          <div className="col-md-12">
            <div className="form_group">
              <input
                type="text"
                className={`form_control ${fieldErrors.subject ? 'is-invalid' : ''}`}
                placeholder="Asunto"
                name="subject"
                maxLength={LIMITS.subject}
                required
                disabled={status === 'sending'}
                autoComplete="off"
              />
              {fieldErrors.subject && <span className="invalid-feedback d-block">{fieldErrors.subject}</span>}
            </div>
          </div>
          <div className="col-md-12">
            <div className="form_group">
              <textarea
                name="message"
                className={`form_control ${fieldErrors.message ? 'is-invalid' : ''}`}
                placeholder="Mensaje"
                rows={5}
                maxLength={LIMITS.message}
                required
                disabled={status === 'sending'}
                autoComplete="off"
              />
              {fieldErrors.message && <span className="invalid-feedback d-block">{fieldErrors.message}</span>}
            </div>
          </div>
          <div className="col-md-12">
            <div className="form_group">
              <button
                type="submit"
                className={`main-btn primary-btn ${status === 'sending' ? 'is-sending' : ''}`}
                disabled={status === 'sending'}
              >
                Enviar
                {status === 'sending' ? (
                  <i className="fas fa-spinner fa-spin" aria-hidden />
                ) : (
                  <i className="fas fa-paper-plane" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {status === 'success' && (
        <div className="alert alert-success mt-3" role="alert">
          Mensaje enviado correctamente. Te responderemos pronto.
        </div>
      )}
      {status === 'error' && (
        <div className="alert alert-danger mt-3" role="alert">
          {errorMessage}
        </div>
      )}
    </>
  )
}
