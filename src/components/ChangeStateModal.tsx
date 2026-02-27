import React from 'react';

type Props = {
  ticketId: string;
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
};

const ChangeStateModal: React.FC<Props> = ({ ticketId, isOpen, onClose, onSuccess }) => {
  const [selected, setSelected] = React.useState('RECEIVED');
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((body && body.message) || 'Error');
        return;
      }

      onSuccess?.();
      onClose?.();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  return (
    <div>
      <div aria-hidden="true" data-testid="overlay" />
      <div role="dialog" aria-modal="true" aria-labelledby="change-state-title">
        <h2 id="change-state-title">Cambiar estado</h2>
        <div>Ticket: {ticketId}</div>
        <div>Estado actual:</div>

        <label htmlFor="state-select">Seleccionar nuevo estado</label>
        <select
          id="state-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="RECEIVED">Recibido</option>
          <option value="IN_PROGRESS">En Progreso</option>
        </select>

        {error && <div role="alert">{error}</div>}

        <div>
          <button onClick={() => onClose && onClose()}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStateModal;
