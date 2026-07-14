export interface ExpedienteEstado {
  numero_expediente: string;
  tramite: string;
  administrado: string;
  estado_actual: string;
  detalle_estado: string;
  origen_canal: string;
  ultima_actualizacion: string;
  tiempo_estimado_resolucion_dias: number;
}

export interface ApiErrorBody {
  codigo_estado?: number;
  mensaje?: string;
  error?: string;
  request_id?: string;
}

export interface NotificationResponse {
  success: boolean;
  canal: 'sms' | 'voz';
  sid?: string;
  mock?: boolean;
  mensaje: string;
}
