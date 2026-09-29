import React, { createContext, useContext } from 'react';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open = false,
  onOpenChange,
  children,
}) => {
  const setOpen = (val: boolean) => {
    onOpenChange?.(val);
  };

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { open, setOpen } = useContext(AlertDialogContext);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div
        className={`w-full max-w-[360px] sm:max-w-md bg-[#121514] border border-[#8E8C3A]/50 rounded-3xl p-6 sm:p-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] space-y-4 select-none animate-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`space-y-2 text-left ${className}`}>{children}</div>
);

export const AlertDialogTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={`font-bebas text-xl sm:text-2xl uppercase tracking-wide text-white leading-none ${className}`}>
    {children}
  </h3>
);

export const AlertDialogDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`font-barlow text-xs sm:text-sm text-zinc-300 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const AlertDialogFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 pt-3 ${className}`}>
    {children}
  </div>
);

export const AlertDialogCancel: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={`px-5 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-barlow font-medium transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

export const AlertDialogAction: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'destructive';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const { setOpen } = useContext(AlertDialogContext);
  const variantStyles =
    variant === 'destructive'
      ? 'bg-red-950/90 hover:bg-red-900 border border-red-800/80 text-red-200 font-bold'
      : 'bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bold';

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-barlow transition-all active:scale-95 ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};
