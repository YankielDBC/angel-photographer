'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [sessionId])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <span className="text-6xl mb-4 block">✅</span>
        <h1 className="font-serif text-4xl font-bold mb-4">
          ¡Pago Confirmado!
        </h1>
        <p className="text-muted text-lg mb-8 max-w-md">
          Tu reservación ha sido confirmada. Te he enviado un correo con los detalles. 
          ¡Nos vemos en tu sesión!
        </p>
        
        {sessionId && (
          <p className="text-xs text-muted mb-8">
            Transaction ID: {sessionId.slice(0, 20)}...
          </p>
        )}
        
        <Link 
          href="/" 
          className="bg-accent hover:bg-accent/80 px-8 py-3 rounded-full font-medium transition inline-block"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}
