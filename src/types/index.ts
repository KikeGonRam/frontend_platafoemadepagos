export type UserRole = 'admin_general' | 'solicitante' | 'aprobador' | 'pagador_banca';

export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  creado_en: string;
  bloqueado?: boolean;  // Primary field
  blocked?: boolean;    // Alternative field name
  is_blocked?: boolean; // Another alternative
  intentos_fallidos: number;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export type SolicitudEstado = 'pendiente' | 'autorizada' | 'rechazada';

export interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  departamento: string;
  monto: number;
  cuenta_destino: string;
  factura_url: string;
  concepto: string;
  fecha_limite_pago: string;
  soporte_url?: string;
  estado: SolicitudEstado;
  id_aprobador?: number;
  comentario_aprobador?: string;
  fecha_revision?: string;
  fecha_creacion: string;
  updated_at: string;
  usuario_nombre?: string;
  aprobador_nombre?: string;
}

export interface CreateSolicitudData {
  departamento: string;
  monto: number;
  cuenta_destino: string;
  factura_url: string;
  concepto: string;
  fecha_limite_pago: string;
  soporte_url?: string;
}

export interface UpdateEstadoData {
  estado: 'autorizada' | 'rechazada';
  comentario_aprobador?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
}
