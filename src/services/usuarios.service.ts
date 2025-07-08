import api from '@/lib/api';
import { User } from '@/types';

export interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateUserData {
  nombre?: string;
  email?: string;
  rol?: string;
  password?: string;
  bloqueado?: boolean; // Para bloquear/desbloquear usuarios
  bloqueo_temporal_fin?: string; // Fecha de fin del bloqueo temporal
}

export interface UpdateProfileData {
  nombre: string;
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UsuariosService {
  static async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/usuarios');
    return response.data;
  }

  static async getById(id: number): Promise<User> {
    const response = await api.get<User>(`/usuarios/${id}`);
    return response.data;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const response = await api.post<User>('/usuarios', userData);
    return response.data;
  }

  static async update(id: number, userData: UpdateUserData): Promise<User> {
    const response = await api.put<User>(`/usuarios/${id}`, userData);
    return response.data;
  }

  // Método específico para actualizar solo datos básicos del usuario (con contraseña obligatoria)
  static async updateUserData(id: number, userData: { nombre: string; email: string; rol: string; password: string }): Promise<User> {
    const response = await api.put<User>(`/usuarios/${id}`, userData);
    return response.data;
  }

  // Método específico para cambiar solo el estado de bloqueo preservando todos los datos
  static async updateBlockStatus(id: number, bloqueado: boolean): Promise<User> {
    console.log('🔧 updateBlockStatus iniciado');
    console.log('  - ID:', id);
    console.log('  - Nuevo estado bloqueado:', bloqueado);
    
    try {
      // Primero obtener los datos actuales del usuario
      console.log('📥 Obteniendo datos actuales del usuario...');
      const currentUser = await this.getById(id);
      console.log('  - Usuario actual:', {
        id: currentUser.id_usuario,
        nombre: currentUser.nombre,
        email: currentUser.email,
        rol: currentUser.rol,
        bloqueado: currentUser.bloqueado
      });
      
      // Crear objeto con todos los datos existentes + nuevo estado de bloqueo
      const preservedData = {
        nombre: currentUser.nombre,
        email: currentUser.email,
        rol: currentUser.rol,
        bloqueado: bloqueado
        // NO incluir password para preservarla en el backend
      };
      
      console.log('📤 Enviando datos al servidor:', preservedData);
      
      const response = await api.put<User>(`/usuarios/${id}`, preservedData);
      
      console.log('📨 Respuesta completa del servidor:', response.data);
      console.log('  - Estado bloqueado en respuesta:', response.data.bloqueado);
      
      // Validar que el servidor procesó el cambio correctamente
      if (response.data.bloqueado !== bloqueado) {
        console.error('❌ ALERTA: El servidor no guardó el estado de bloqueo correctamente');
        console.error('  - Enviado:', bloqueado);
        console.error('  - Recibido:', response.data.bloqueado);
      } else {
        console.log('✅ Servidor confirmó el cambio de estado correctamente');
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en updateBlockStatus:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  // Métodos para perfil propio
  static async updateProfile(profileData: UpdateProfileData): Promise<{ message: string; user: User }> {
    const response = await api.put<{ message: string; user: User }>('/usuarios/profile/update', profileData);
    return response.data;
  }

  static async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/usuarios/profile/change-password', passwordData);
    return response.data;
  }
}
