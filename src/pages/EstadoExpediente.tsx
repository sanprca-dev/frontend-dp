import { useMemo, useState } from 'react';
import { ArrowLeft, Bot, CalendarClock, FileText, MessageSquareText, PhoneCall, Printer, Send, UserRound } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EstadoBadge from '../components/EstadoBadge';
import { enviarNotificacionTwilio, enviarPreguntaIA, getApiErrorMessage } from '../services/api';
import type { ExpedienteEstado } from '../types';

interface LocationState {
  expediente?: ExpedienteEstado;
  clave?: string;
}

const readStoredExpediente = (): ExpedienteEstado | undefined => {
  try {
    const raw = sessionStorage.getItem('dp_ultimo_expediente');
    return raw ? JSON.parse(raw) as ExpedienteEstado : undefined;
  } catch {
    return undefined;
  }
};

export default function EstadoExpediente() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const expediente = state.expediente || readStoredExpediente();
  const [clave, setClave] = useState(state.clave || '');
  const [telefono, setTelefono] = useState('');
  const [notificationLoading, setNotificationLoading] = useState<'sms' | 'voz' | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const progressIndex = useMemo(() => {
    if (!expediente) return 0;
    const value = expediente.estado_actual.toUpperCase();
    if (value.includes('RESPUESTA') || value.includes('ATENDIDO')) return 2;
    if (value.includes('PROCESO')) return 1;
    return 0;
  }, [expediente]);

  if (!expediente) {
    return (
      <div className="app-shell empty-state-page">
        <Header />
        <main className="empty-state">
          <FileText size={38} />
          <h1>No hay una consulta activa</h1>
          <p>Vuelve al inicio e ingresa tu expediente y clave.</p>
          <button className="primary-button" onClick={() => navigate('/')}>Ir a la consulta</button>
        </main>
        <Footer />
      </div>
    );
  }

  const normalizedPhone = () => {
    const compact = telefono.replace(/[\s()-]/g, '');
    if (compact.startsWith('+')) return compact;
    return `+51${compact}`;
  };

  const requireKey = () => {
    if (!/^\d{4}$/.test(clave)) {
      setActionError('Para usar SMS, llamada o asistente, vuelve a ingresar la clave de 4 dígitos.');
      return false;
    }
    return true;
  };

  const handleNotification = async (tipo: 'sms' | 'voz') => {
    if (!requireKey()) return;
    if (!telefono.trim()) {
      setActionError('Ingresa un número de teléfono.');
      return;
    }
    setActionError('');
    setNotificationMessage('');
    setNotificationLoading(tipo);
    try {
      const result = await enviarNotificacionTwilio(expediente.numero_expediente, clave, normalizedPhone(), tipo);
      setNotificationMessage(result.mock ? `${result.mensaje} Modo de simulación activo.` : result.mensaje);
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'No fue posible contactar el servicio de mensajería.'));
    } finally {
      setNotificationLoading(null);
    }
  };

  const handleChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireKey()) return;
    if (!pregunta.trim()) return;
    setActionError('');
    setChatLoading(true);
    setRespuesta('');
    try {
      setRespuesta(await enviarPreguntaIA(expediente.numero_expediente, clave, pregunta.trim()));
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'No fue posible procesar la pregunta.'));
    } finally {
      setChatLoading(false);
    }
  };

  const steps = ['Registrado', 'En proceso', 'Respondido'];

  return (
    <div className="app-shell">
      <Header />
      <main className="result-page">
        <div className="result-toolbar">
          <button className="text-button" onClick={() => navigate('/')}><ArrowLeft size={17} /> Nueva consulta</button>
          <button className="text-button" onClick={() => window.print()}><Printer size={17} /> Imprimir</button>
        </div>

        <section className="result-hero">
          <div>
            <p className="kicker">Resultado de la consulta</p>
            <h1>{expediente.numero_expediente}</h1>
            <p>{expediente.tramite}</p>
          </div>
          <EstadoBadge estado={expediente.estado_actual} />
        </section>

        <section className="result-grid">
          <article className="detail-card detail-wide">
            <p className="kicker">Estado actual</p>
            <h2>{expediente.estado_actual}</h2>
            <p className="detail-copy">{expediente.detalle_estado}</p>
          </article>
          <article className="detail-card"><span className="detail-icon"><UserRound size={20} /></span><p className="kicker">Administrado</p><strong>{expediente.administrado}</strong></article>
          <article className="detail-card"><span className="detail-icon"><CalendarClock size={20} /></span><p className="kicker">Plazo estimado</p><strong>{expediente.tiempo_estimado_resolucion_dias} días</strong></article>
        </section>

        <section className="progress-card">
          <p className="kicker">Progreso del trámite</p>
          <div className="progress-track">
            {steps.map((step, index) => (
              <div className={`progress-step ${index <= progressIndex ? 'active' : ''}`} key={step}>
                <span>{index + 1}</span><strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="actions-grid">
          <article className="action-card">
            <div className="card-heading"><span className="icon-box"><MessageSquareText size={20} /></span><div><p className="kicker">Continuidad multicanal</p><h2>Recibe el resultado en tu celular</h2></div></div>
            <p>Ingresa el número y vuelve a escribir tu clave. La clave no se guarda en la sesión.</p>
            <label><span>Teléfono</span><input value={telefono} onChange={(event) => setTelefono(event.target.value)} placeholder="987654321" inputMode="tel" /></label>
            <label><span>Clave de seguimiento</span><input type="password" value={clave} onChange={(event) => setClave(event.target.value)} placeholder="4 dígitos" maxLength={4} inputMode="numeric" /></label>
            <div className="action-buttons">
              <button className="secondary-button" onClick={() => handleNotification('sms')} disabled={Boolean(notificationLoading)}><MessageSquareText size={17} />{notificationLoading === 'sms' ? 'Enviando…' : 'Enviar SMS'}</button>
              <button className="secondary-button" onClick={() => handleNotification('voz')} disabled={Boolean(notificationLoading)}><PhoneCall size={17} />{notificationLoading === 'voz' ? 'Llamando…' : 'Recibir llamada'}</button>
            </div>
            {notificationMessage && <div className="alert alert-success">{notificationMessage}</div>}
          </article>

          <article className="action-card">
            <div className="card-heading"><span className="icon-box"><Bot size={20} /></span><div><p className="kicker">Orientación contextual</p><h2>Pregunta sobre este resultado</h2></div></div>
            <p>El asistente responde usando únicamente la información disponible del expediente.</p>
            <form onSubmit={handleChat}>
              <label><span>Tu pregunta</span><textarea value={pregunta} onChange={(event) => setPregunta(event.target.value)} placeholder="¿Qué significa el estado actual?" rows={4} /></label>
              <button className="primary-button" type="submit" disabled={chatLoading}>{chatLoading ? 'Procesando…' : 'Preguntar'}<Send size={17} /></button>
            </form>
            {respuesta && <div className="chat-answer"><ReactMarkdown>{respuesta}</ReactMarkdown></div>}
          </article>
        </section>

        {actionError && <div className="alert alert-error global-alert" role="alert">{actionError}</div>}
      </main>
      <Footer />
    </div>
  );
}
