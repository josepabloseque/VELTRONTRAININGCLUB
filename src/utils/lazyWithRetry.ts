import { ComponentType, lazy } from 'react';

/**
 * Envoltorio seguro para React.lazy() que previene pantallas blancas cuando
 * un nuevo despliegue en producción invalida los hashes de los chunks anteriores.
 * 
 * Candado de seguridad anti-bucle infinito:
 * - Utiliza sessionStorage para permitir solo 1 recarga automática por sesión/ruta.
 * - Si tras la recarga el archivo sigue fallando (por ejemplo, desconexión de red real),
 *   detiene los reintentos y lanza el error sin congelar el navegador del usuario.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const storageKey = 'veltron-pwa-refresh-lock';
    const hasAlreadyRefreshed = window.sessionStorage.getItem(storageKey) === 'true';

    try {
      const component = await componentImport();
      // Si la carga fue exitosa, liberamos el candado para futuras actualizaciones
      window.sessionStorage.removeItem(storageKey);
      return component;
    } catch (error) {
      if (!hasAlreadyRefreshed) {
        // Marcamos que ya se intentó una recarga forzada
        window.sessionStorage.setItem(storageKey, 'true');
        // Recargamos para obtener el nuevo index.html con los hashes actualizados
        window.location.reload();
        // Devolvemos una promesa pendiente indefinida para evitar que React monte un estado roto mientras la página recarga
        return new Promise<{ default: T }>(() => {});
      }

      // Si ya se recargó y persiste el error (ej. sin conexión a internet real), liberamos y lanzamos error
      window.sessionStorage.removeItem(storageKey);
      throw error;
    }
  });
}
