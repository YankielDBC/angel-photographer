import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-serif text-2xl font-bold text-gradient">
            Angel Photographer
          </h1>
          <div className="flex gap-6">
            <Link href="#servicios" className="hover:text-accent transition">Servicios</Link>
            <Link href="#contacto" className="hover:text-accent transition">Contacto</Link>
            <Link 
              href="/book" 
              className="bg-accent hover:bg-accent/80 px-5 py-2 rounded-full font-medium transition"
            >
              Reservar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e94560%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-accent font-medium tracking-widest uppercase mb-4">Professional Photography</p>
          <h2 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Capturando Momentos
            <span className="block text-gradient">Que Duran Para Siempre</span>
          </h2>
          <p className="text-muted text-xl mb-10 max-w-2xl mx-auto">
            Sesiones fotográficas profesionales que revelan tu esencia. 
            Desde retratos hasta eventos, cada imagen cuenta una historia única.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/book" 
              className="bg-accent hover:bg-accent/80 px-8 py-4 rounded-full font-medium text-lg transition transform hover:scale-105"
            >
              Reservar Ahora 📅
            </Link>
            <a 
              href="#servicios" 
              className="border border-white/20 hover:border-accent px-8 py-4 rounded-full font-medium text-lg transition"
            >
              Ver Servicios
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-serif text-4xl font-bold text-gradient">500+</p>
            <p className="text-muted">Sesiones</p>
          </div>
          <div>
            <p className="font-serif text-4xl font-bold text-gradient">5+</p>
            <p className="text-muted">Años Exp.</p>
          </div>
          <div>
            <p className="font-serif text-4xl font-bold text-gradient">100%</p>
            <p className="text-muted">Satisfechos</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-serif text-4xl font-bold text-center mb-16">
            Mis <span className="text-gradient">Servicios</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition group">
              <span className="text-4xl mb-4 block">👤</span>
              <h4 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent transition">
                Retratos
              </h4>
              <p className="text-muted">Sesiones individuales, familiares y de pareja.</p>
            </div>
            <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition group">
              <span className="text-4xl mb-4 block">🎉</span>
              <h4 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent transition">
                Eventos
              </h4>
              <p className="text-muted">Bodas, quinceañeras, cumpleaños y más.</p>
            </div>
            <div className="bg-secondary/50 p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition group">
              <span className="text-4xl mb-4 block">✨</span>
              <h4 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent transition">
                Sesiones Creativas
              </h4>
              <p className="text-muted">Conceptos artísticos y fotografía de moda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-accent/20 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-serif text-4xl font-bold mb-6">
            ¿Listo para tu Sesión?
          </h3>
          <p className="text-muted text-lg mb-8">
            Reserva tu fecha ahora y asegura tu lugar. Solo atiendo un cliente por día para garantizar la mejor experiencia.
          </p>
          <Link 
            href="/book" 
            className="bg-accent hover:bg-accent/80 px-10 py-4 rounded-full font-medium text-lg transition inline-block"
          >
            Reservar Fecha 📅
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-serif text-4xl font-bold text-center mb-12">
            <span className="text-gradient">Contacto</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-lg text-muted">
                ¿Tienes preguntas? Estoy aquí para ayudarte.
              </p>
              
              <div className="space-y-4">
                <a 
                  href="https://wa.me/17863184596" 
                  target="_blank"
                  className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-muted text-sm">+1 786 318 4596</p>
                  </div>
                </a>
                
                <a 
                  href="sms:+17863184596"
                  className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition"
                >
                  <span className="text-2xl">💌</span>
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-muted text-sm">+1 786 318 4596</p>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-8 rounded-2xl">
              <h4 className="font-serif text-xl font-bold mb-4">Horario</h4>
              <div className="space-y-2 text-muted">
                <p>Lunes - Viernes: 9:00 AM - 7:00 PM</p>
                <p>Sábado: 10:00 AM - 5:00 PM</p>
                <p>Domingo: Cerrado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted">© 2026 Angel Photographer. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="text-muted hover:text-accent transition text-sm">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
