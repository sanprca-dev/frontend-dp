import { useState } from 'react';
import { ArrowRight, Globe2, MessageSquareText, PhoneCall, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { consultarExpediente, getApiErrorMessage } from '../services/api';

const channels = [
  { icon: Globe2, title: 'Web', text: 'Consulta desde cualquier navegador.' },
  { icon: MessageSquareText, title: 'SMS', text: 'Pensado para conexiones limitadas.' },
  { icon: PhoneCall, title: 'Llamada', text: 'Atención automatizada por voz.' },
];

export default function ConsultaExpediente() {
  const navigate = useNavigate();
  const [numeroExpediente, setNumeroExpediente] = useState('');
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const usuario = numeroExpediente.trim();
    const accessKey = clave.trim();

    if (!usuario || !accessKey) {
      setError('Ingresa el número de expediente y la clave de seguimiento.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const expediente = await consultarExpediente(usuario, accessKey);
      sessionStorage.setItem('dp_ultimo_expediente', JSON.stringify(expediente));
      navigate('/estado-expediente', { state: { expediente, clave: accessKey } });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible consultar el expediente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">Acceso simple · Tres canales · Una sola consulta</span>
            <h1>Consulta tu expediente sin depender de una sola forma de conexión.</h1>
            <p>DP Te Responde 24/7 es un prototipo multicanal que conecta web, SMS y llamada automatizada con una misma lógica de consulta.</p>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-core">24/7</div>
            <span className="orbit-dot orbit-one"><Globe2 size={22} /></span>
            <span className="orbit-dot orbit-two"><MessageSquareText size={22} /></span>
            <span className="orbit-dot orbit-three"><PhoneCall size={22} /></span>
          </div>
        </section>

        <section className="content-grid">
          <form className="query-card" onSubmit={handleSubmit}>
            <div className="card-heading">
              <span className="icon-box"><Search size={20} /></span>
              <div>
                <p className="kicker">Consulta web</p>
                <h2>Revisa el estado de tu expediente</h2>
              </div>
            </div>

            <label>
              <span>Número de expediente</span>
              <input
                value={numeroExpediente}
                onChange={(event) => setNumeroExpediente(event.target.value)}
                placeholder="2026-0004721"
                autoComplete="off"
                inputMode="text"
              />
            </label>

            <label>
              <span>Clave de seguimiento</span>
              <input
                type="password"
                value={clave}
                onChange={(event) => setClave(event.target.value)}
                placeholder="4 dígitos"
                autoComplete="off"
                inputMode="numeric"
                maxLength={4}
              />
            </label>

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Consultando…' : 'Consultar expediente'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="privacy-note">
              <ShieldCheck size={17} />
              <span>La clave se usa para la consulta y no se almacena en el navegador.</span>
            </div>
          </form>

          <aside className="channel-panel">
            <p className="kicker">Diseñado para distintos contextos</p>
            <h2>El canal cambia. La información consultada es la misma.</h2>
            <div className="channel-list">
              {channels.map(({ icon: Icon, title, text }) => (
                <article className="channel-item" key={title}>
                  <span className="channel-icon"><Icon size={21} /></span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                </article>
              ))}
            </div>
            <div className="demo-callout">
              <strong>Datos de demostración</strong>
              <span>Expediente 2026-0004721 · Clave 1548</span>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
