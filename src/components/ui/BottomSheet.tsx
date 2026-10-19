import type { ReactNode } from 'react';
import { Modal } from './Modal';

/** Full-height, bottom-anchored sheet with a fixed header and optional footer. */
export function BottomSheet({ open, title, onClose, header, footer, tone = 'surface', children }: {
  open: boolean;
  title: string;
  onClose: () => void;
  header: ReactNode;
  footer?: ReactNode;
  tone?: 'surface' | 'muted';
  children: ReactNode;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} variant="bottom-sheet" sheetTone={tone} headerAction={header} footer={footer}>
      {children}
    </Modal>
  );
}
