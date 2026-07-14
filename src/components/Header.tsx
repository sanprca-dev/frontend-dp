import { RadioTower } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ir al inicio de DP Te Responde 24/7">
          <span className="brand-mark"><RadioTower size={22} /></span>
          <span>
            <strong>DP Te Responde 24/7</strong>
            <small>Consulta multicanal de expedientes</small>
          </span>
        </Link>
        <span className="prototype-badge">Prototipo académico</span>
      </div>
    </header>
  );
}
