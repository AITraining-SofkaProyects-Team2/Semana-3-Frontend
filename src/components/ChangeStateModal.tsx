import React from 'react';
import Modal from './ui/Modal';
import Select from './ui/Select';
import Button from './ui/Button';
import { httpClient } from '../services/http-client';

type Props = {
  ticketId: string;
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  currentStatus?: string;
};

const ChangeStateModal: React.FC<Props> = ({ ticketId, isOpen, onClose, onSuccess, currentStatus }) => {
  const [selected, setSelected] = React.useState('RECEIVED');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelected(currentStatus ?? 'RECEIVED');
      setError(null);
      setSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen, currentStatus]);

  React.useEffect(() => {
    let t: number | undefined;
    if (success) {
      // auto-close after 3 seconds
      t = window.setTimeout(() => {
        onClose?.();
      }, 3000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [success, onClose]);

  const handleConfirm = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await httpClient.patch(`/api/tickets/${ticketId}/status`, { status: selected });
      onSuccess?.();
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose ?? (() => {})}
      title="Cambiar estado del ticket"
      footer={(
        <>
          {!success && (
            <>
              <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
              <Button variant="primary" onClick={handleConfirm} isLoading={isLoading}>{isLoading ? 'Enviando...' : 'Confirmar'}</Button>
            </>
          )}
          {success && (
            <Button variant="primary" onClick={onClose}>Cerrar</Button>
          )}
        </>
      )}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">Ticket: <span className="font-mono text-sm text-indigo-700">{ticketId}</span></div>
        <div className="text-sm text-gray-600">Estado actual: <span className="font-semibold text-gray-800">{currentStatus ?? '—'}</span></div>

        <Select
          id="change-state-select"
          label="Seleccionar nuevo estado"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          options={[
            { value: 'RECEIVED', label: 'Recibido' },
            { value: 'IN_PROGRESS', label: 'En Progreso' },
          ]}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
            Estado actualizado exitosamente. El modal se cerrará automáticamente.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChangeStateModal;
