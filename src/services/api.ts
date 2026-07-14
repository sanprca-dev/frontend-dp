import axios, { AxiosError } from 'axios';
import type { ApiErrorBody, ExpedienteEstado, NotificationResponse } from '../types';

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    if (!axiosError.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.';
    }
    return axiosError.response.data?.mensaje || axiosError.response.data?.error || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export async function consultarExpediente(usuario: string, clave: string): Promise<ExpedienteEstado> {
  const { data } = await api.post('/expedientes', { usuario, clave });
  if (!data?.data) throw new Error(data?.mensaje || 'La respuesta del servidor no contiene datos del expediente.');
  return data.data as ExpedienteEstado;
}

export async function enviarPreguntaIA(usuario: string, clave: string, pregunta: string): Promise<string> {
  const { data } = await api.post('/chat', { usuario, clave, pregunta });
  return String(data?.respuesta || 'No se recibió una respuesta.');
}

export async function enviarNotificacionTwilio(
  usuario: string,
  clave: string,
  telefono: string,
  tipo: 'sms' | 'voz',
): Promise<NotificationResponse> {
  const { data } = await api.post('/sms/consulta', { usuario, clave, telefono, tipo });
  return data as NotificationResponse;
}
