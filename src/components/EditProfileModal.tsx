import React, { useState, useEffect } from 'react';
import { X, User, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialPhone,
}) => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone === 'No registrado' ? '' : initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone(initialPhone === 'No registrado' ? '' : initialPhone);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialName, initialPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Por favor ingresa un nombre válido (al menos 2 letras).');
      return;
    }

    // Sanitizar número (conservar solo dígitos)
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (!sanitizedPhone || sanitizedPhone.length < 8) {
      setError('Ingresa un número de teléfono válido (mínimo 8 dígitos).');
      return;
    }

    setLoading(true);

    try {
      const res = await updateProfile({
        full_name: trimmedName,
        phone: sanitizedPhone,
      });

      if (!res.success) {
        setError(res.error || 'Error al actualizar perfil');
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-bebas text-xl uppercase tracking-wider text-white">
              Editar Datos
            </h3>
            <p className="text-[11px] text-zinc-400 font-barlow">
              Actualiza tu nombre y teléfono de contacto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-start gap-2 text-red-300 text-xs font-barlow">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-barlow">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Datos actualizados correctamente!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-barlow">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
              Teléfono (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 87623104"
                className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Se utilizará para contactarte o enviarte avisos de tu membresía.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bebas text-sm uppercase tracking-wider rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-2.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
