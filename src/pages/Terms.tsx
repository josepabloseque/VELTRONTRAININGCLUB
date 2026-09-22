import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VeltronLogo } from '../components/VeltronLogo';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-white flex flex-col font-sans selection:bg-[#8E8C3A]/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0C0B] border-b border-zinc-900 px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <VeltronLogo size="sm" />
            <p className="font-bebas text-lg tracking-wider text-[#B5B04E] uppercase leading-none">
              Training Club
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full px-5 py-8 flex-1">
        <div className="bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-zinc-800 pb-5">
            <h1 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-white leading-none">
              Términos y Condiciones de Servicio
            </h1>
            <p className="text-xs text-[#B5B04E] font-barlow uppercase tracking-wider mt-1.5">
              Veltron Training Club — Plataforma de Gestión y Reservas
            </p>
          </div>

          <div className="space-y-6 text-sm text-zinc-300 font-barlow leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                1. Uso de la Cuenta y Plataforma
              </h2>
              <p>
                La cuenta registrada en esta plataforma es de carácter personal e intransferible. El usuario es el único responsable de la exactitud y veracidad de los datos proporcionados, así como del resguardo, confidencialidad y uso de sus credenciales de acceso.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                2. Reservas, Cupos y Cancelaciones
              </h2>
              <p>
                La confirmación de una reserva a través de la aplicación garantiza el cupo del usuario en la sesión de entrenamiento seleccionada. En caso de no poder asistir, el usuario se compromete a cancelar su reserva con la debida antelación desde la plataforma para liberar el lugar y permitir que otro usuario disponga del cupo en sala.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                3. Aptitud Física y Declaración de Salud
              </h2>
              <p>
                El usuario declara encontrarse en condiciones físicas y de salud aptas para la práctica de actividad física y entrenamientos guiados de alto rendimiento. Es deber y responsabilidad del usuario informar a los entrenadores y personal a cargo sobre cualquier lesión, molestia física o prescripción médica relevante antes de comenzar cada clase.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                4. Estado de Membresías y Acceso
              </h2>
              <p>
                La facultad de agendar clases y acceder a las sesiones presenciales está sujeta a la vigencia y estado activo de la membresía del usuario, la cual es administrada y validada por el personal de Veltron Training Club.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                5. Convivencia y Cuidado de las Instalaciones
              </h2>
              <p>
                El usuario se compromete a mantener una conducta de respeto hacia los entrenadores, compañeros y personal del club, así como al uso correcto, ordenado y responsable del equipamiento, accesorios y espacios del establecimiento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                6. Privacidad y Protección de Datos Personales
              </h2>
              <p>
                La información personal suministrada (nombre, teléfono y correo electrónico) será tratada de forma estrictamente confidencial. Los datos se utilizan únicamente para la gestión de reservas, autenticación de seguridad, control de membresías y comunicaciones operativas directas de Veltron Training Club. No se comparten ni comercializan con terceros.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase font-barlow tracking-wide">
                7. Contacto y Atención
              </h2>
              <p>
                Para cualquier consulta, aclaración o solicitud relacionada con estos términos, la gestión de su cuenta o el tratamiento de sus datos, el usuario puede comunicarse directamente con la administración del club a través de los canales oficiales de atención o en la recepción de Veltron Training Club.
              </p>
            </section>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="py-2.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-sm tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 leading-none"
            >
              Volver a la App
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
