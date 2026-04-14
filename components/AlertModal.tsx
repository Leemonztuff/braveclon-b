import { AlertCircle } from 'lucide-react';
import { Modal, ModalActionButton } from './ui/Modal';

export function AlertModal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Notice">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-zinc-300 font-medium mb-6">{message}</p>
        <ModalActionButton onClick={onClose} label="OK" variant="secondary" />
      </div>
    </Modal>
  );
}
