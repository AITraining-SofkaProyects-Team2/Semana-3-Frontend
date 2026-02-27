/**
 * Test Suite: UH-013 - Cambio de Estado de Tickets (Front-end)
 * Tests incluidos: TC-013-014 .. TC-013-020
 * NOTE: Estos tests están escritos en fase RED (deben fallar inicialmente hasta
 * que los componentes `TicketsList` / `ChangeStateModal` y la integración existan).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// IMPORTS: usar componentes existentes en el proyecto
import TicketsList from '../pages/Dashboard/TicketList';
import ChangeStateModal from '../components/ChangeStateModal';

describe('UH-013 - Cambio de Estado (Front)', () => {
  /**
   * TC-013-014: Modal se abre al hacer clic en botón de cambio de estado
   * Given La lista está renderizada y existe al menos un ticket
   * When El administrador hace clic en "Cambiar Estado"
   * Then El modal debe abrirse, overlay visible y foco en modal
   */
  it('TC-013-014 - Modal se abre al hacer clic en botón de cambio de estado', async () => {
    const Wrapper: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>Cambiar Estado</button>
          <ChangeStateModal ticketId="t1" isOpen={open} onClose={() => setOpen(false)} />
        </div>
      );
    };

    render(<Wrapper />);

    const btn = await screen.findByRole('button', { name: /Cambiar Estado/i });
    await userEvent.click(btn);

    expect(await screen.findByRole('dialog')).toBeDefined();
      expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  /**
   * TC-013-015: Modal muestra información correcta del ticket
   * Given Modal abierto para un ticket concreto
   * When Se muestra el modal
   * Then Debe mostrarse el Ticket ID y el estado actual
   */
  it('TC-013-015 - Modal muestra información correcta del ticket', async () => {
    // Abrimos modal para un ticket de prueba
    render(<ChangeStateModal ticketId="550e8400-e29b-41d4-a716-446655440000" isOpen={true} />);

    expect(await screen.findByText(/550e8400-e29b-41d4-a716-446655440000/)).toBeDefined();
    expect(screen.getByText(/Estado actual:/i)).toBeDefined();
  });

  /**
   * TC-013-016: Selector muestra todos los estados disponibles
   */
  it('TC-013-016 - Selector muestra todos los estados disponibles', async () => {
    render(<ChangeStateModal ticketId="t1" isOpen={true} />);

    const select = await screen.findByRole('combobox');
    // Debe contener exactamente 2 opciones: RECEIVED e IN_PROGRESS
    const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain('Recibido');
    expect(options).toContain('En Progreso');
    expect(options.length).toBe(2);
  });

  /**
   * TC-013-017: Modal se cierra al hacer clic en Cancelar
   */
  it('TC-013-017 - Modal se cierra al hacer clic en Cancelar', async () => {
    const Wrapper: React.FC = () => {
      const [open, setOpen] = React.useState(true);
      return <ChangeStateModal ticketId="t1" isOpen={open} onClose={() => setOpen(false)} />;
    };

    render(<Wrapper />);

    const cancel = await screen.findByRole('button', { name: /Cancelar/i });
    await userEvent.click(cancel);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  /**
   * TC-013-018: Modal envía request correcta al confirmar cambio
   */
  it('TC-013-018 - Modal envía request correcta al confirmar cambio', async () => {
    // Espía global fetch para validar URL, método y body
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    render(<ChangeStateModal ticketId="550e8400-e29b-41d4-a716-446655440000" isOpen={true} />);

    const confirm = await screen.findByRole('button', { name: /Confirmar/i });
    await userEvent.click(confirm);

    expect(fetchSpy).toHaveBeenCalled();
    // Se espera que se haya llamado a la ruta PATCH del ticket
    const calledUrl = (fetchSpy.mock.calls[0] && fetchSpy.mock.calls[0][0]) || '';
    expect(calledUrl).toContain('/api/tickets/550e8400-e29b-41d4-a716-446655440000/status');

    fetchSpy.mockRestore();
  });

  /**
   * TC-013-019: Lista se actualiza después de cambio exitoso
   */
  it('TC-013-019 - Lista se actualiza después de cambio exitoso', async () => {
    // Wrapper que mantiene los tickets en estado local y actualiza al confirmar
    const TestListWrapper: React.FC = () => {
      const [tickets, setTickets] = React.useState([{
        ticketId: '550e8400-e29b-41d4-a716-446655440000',
        lineNumber: '012345',
        email: 'a@b.com',
        type: 'OTHER',
        priority: 'LOW',
        status: 'RECEIVED',
        createdAt: new Date().toISOString(),
      }]);
      const [open, setOpen] = React.useState(false);

      const handleSuccess = () => {
        setTickets((prev) => prev.map(t => t.ticketId === '550e8400-e29b-41d4-a716-446655440000' ? { ...t, status: 'IN_PROGRESS' } : t));
      };

      return (
        <div>
          <button onClick={() => setOpen(true)}>Cambiar Estado</button>
          <TicketsList tickets={tickets as any} pagination={{ page: 1, totalPages: 1, totalItems: tickets.length }} isLoading={false} onPageChange={() => {}} />
          <ChangeStateModal ticketId="550e8400-e29b-41d4-a716-446655440000" isOpen={open} onClose={() => setOpen(false)} onSuccess={handleSuccess} />
        </div>
      );
    };

    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    render(<TestListWrapper />);

    const btn = await screen.findByRole('button', { name: /Cambiar Estado/i });
    await userEvent.click(btn);

    const confirm = await screen.findByRole('button', { name: /Confirmar/i });
    await userEvent.click(confirm);

    expect(await screen.findByText(/En Progreso/i)).toBeDefined();

    fetchSpy.mockRestore();
  });

  /**
   * TC-013-020: Mensaje de error se muestra en caso de fallo
   */
  it('TC-013-020 - Mensaje de error se muestra en caso de fallo', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: 'Ticket no encontrado' }) });

    render(<ChangeStateModal ticketId="t1" isOpen={true} />);

    const confirm = await screen.findByRole('button', { name: /Confirmar/i });
    await userEvent.click(confirm);

    expect(await screen.findByText(/Ticket no encontrado/i)).toBeDefined();

    fetchSpy.mockRestore();
  });
});
