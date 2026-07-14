import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ConsultaExpediente from './pages/ConsultaExpediente';
import EstadoExpediente from './pages/EstadoExpediente';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaExpediente />} />
        <Route path="/estado-expediente" element={<EstadoExpediente />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
