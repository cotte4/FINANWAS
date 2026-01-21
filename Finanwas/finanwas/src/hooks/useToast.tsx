'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Toast options interface
 */
interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Custom hook wrapping Sonner toast for consistent toast notifications
 * Provides type-safe toast methods with Spanish messages
 * @example
 * const toast = useToast();
 * toast.success('Operación exitosa');
 * toast.error('Error al procesar');
 */
export function useToast() {
  return {
    /**
     * Display a success toast
     * @param message - Success message to display
     * @param options - Additional toast options
     * @example
     * toast.success('Usuario creado exitosamente');
     */
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
      });
    },

    /**
     * Display an error toast
     * @param message - Error message to display
     * @param options - Additional toast options
     * @example
     * toast.error('Error al guardar los cambios');
     */
    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(message, {
        description: options?.description,
        duration: options?.duration || 5000,
        action: options?.action,
      });
    },

    /**
     * Display an info toast
     * @param message - Info message to display
     * @param options - Additional toast options
     * @example
     * toast.info('Recuerda completar tu perfil');
     */
    info: (message: string, options?: ToastOptions) => {
      sonnerToast.info(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
      });
    },

    /**
     * Display a warning toast
     * @param message - Warning message to display
     * @param options - Additional toast options
     * @example
     * toast.warning('Esta acción no se puede deshacer');
     */
    warning: (message: string, options?: ToastOptions) => {
      sonnerToast.warning(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
      });
    },

    /**
     * Display a loading toast
     * Returns a toast ID that can be used to dismiss or update the toast
     * @param message - Loading message to display
     * @returns Toast ID
     * @example
     * const toastId = toast.loading('Guardando...');
     * // Later: toast.dismiss(toastId);
     */
    loading: (message: string) => {
      return sonnerToast.loading(message);
    },

    /**
     * Dismiss a specific toast by ID
     * @param toastId - ID of the toast to dismiss
     * @example
     * const id = toast.loading('Cargando...');
     * toast.dismiss(id);
     */
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },

    /**
     * Display a promise-based toast that updates based on promise state
     * @param promise - Promise to track
     * @param messages - Messages for loading, success, and error states
     * @example
     * toast.promise(
     *   saveData(),
     *   {
     *     loading: 'Guardando...',
     *     success: 'Guardado exitosamente',
     *     error: 'Error al guardar'
     *   }
     * );
     */
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return sonnerToast.promise(promise, messages);
    },

    /**
     * Display a custom toast
     * @param message - Message to display
     * @param options - Additional toast options
     * @example
     * toast.custom('Mensaje personalizado', { duration: 3000 });
     */
    custom: (message: string, options?: ToastOptions) => {
      sonnerToast(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action,
      });
    },
  };
}
