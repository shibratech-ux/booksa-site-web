import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DismissRegular } from '@fluentui/react-icons';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-full max-w-2xl rounded-[1.75rem] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-400">Échange sécurisé, fluide et clair</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} leftIcon={<DismissRegular className="h-4 w-4" />}>
                Fermer
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
