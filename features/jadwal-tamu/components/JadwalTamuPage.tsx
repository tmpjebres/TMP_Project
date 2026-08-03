'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import type { JadwalTamu, JadwalTamuFormInput } from '@/types';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/features/user/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import ConfirmDialog from '@/features/tamu/components/ConfirmDialog';
import CalendarToolbar from './CalendarToolbar';
import MonthView from './MonthView';
import WeekView from './WeekView';
import YearView from './YearView';
import MiniCalendar from './MiniCalendar';
import DetailPanel from './DetailPanel';
import EventFormModal from './EventFormModal';
import ConflictConfirmDialog from './ConflictConfirmDialog';
import AttachmentModal from './AttachmentModal';
import { useJadwalTamuData } from '../hooks/useJadwalTamuData';
import { useTipeKegiatan } from '../hooks/useTipeKegiatan';
import { buildTipeColorMap, shiftDate } from '../utils';
import type { CalendarViewMode } from '../utils';

export default function JadwalTamuPage() {
  const { user, isMaster } = useAuth();
  const { events, loading, add, edit, remove, checkConflicts } = useJadwalTamuData();
  const { toasts, push, dismiss } = useToast();

  const { tipeList } = useTipeKegiatan();
  const tipeColorMap = useMemo(() => buildTipeColorMap(tipeList), [tipeList]);

  const [anchorDate, setAnchorDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<JadwalTamu | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<JadwalTamu | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [pendingInput, setPendingInput] = useState<{ input: JadwalTamuFormInput; editId?: string } | null>(null);
  const [conflicts, setConflicts] = useState<JadwalTamu[] | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<JadwalTamu | null>(null);
  const [attachmentTarget, setAttachmentTarget] = useState<JadwalTamu | null>(null);

  // Deep-link dari halaman notifikasi: ?event=ID&date=YYYY-MM-DD
  const searchParams = useSearchParams();
  useEffect(() => {
    const eventId = searchParams.get('event');
    const dateParam = searchParams.get('date');
    if (loading) return;

    if (eventId) {
      const found = events.find((e) => e.id === eventId);
      if (found) {
        setSelectedEvent(found);
        setAnchorDate(parseISO(found.tanggalMulai));
        setViewMode('month');
        return;
      }
    }
    if (dateParam) {
      setAnchorDate(parseISO(dateParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchParams]);

  const actor = user ? { id: user.id, username: user.username } : null;

  const handlePrev = () => setAnchorDate((d) => shiftDate(d, viewMode, -1));
  const handleNext = () => setAnchorDate((d) => shiftDate(d, viewMode, 1));
  const handleToday = () => setAnchorDate(new Date());

  const handleSelectEvent = (event: JadwalTamu) => setSelectedEvent(event);

  const handleSelectEmptyDay = () => setSelectedEvent(null);

  const handleViewModeChange = (mode: CalendarViewMode) => {
    if (mode === 'week' && selectedEvent) {
      setAnchorDate(parseISO(selectedEvent.tanggalMulai));
    }
    setViewMode(mode);
  };

  const openAddForm = (dateStr?: string) => {
    setFormInitial(null);
    setFormDefaultDate(dateStr ?? format(anchorDate, 'yyyy-MM-dd'));
    setFormOpen(true);
  };

  const openEditForm = (event: JadwalTamu) => {
    setFormInitial(event);
    setFormDefaultDate(undefined);
    setFormOpen(true);
  };

  async function doSubmit(input: JadwalTamuFormInput, editId?: string) {
    if (!actor) return;
    setSubmitting(true);
    const result = editId ? await edit(editId, input, actor) : await add(input, actor);
    setSubmitting(false);

    if (result.error || !result.data) {
      push(result.error ?? 'Gagal menyimpan jadwal.', 'error');
      return;
    }

    push(editId ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.', 'success');
    setSelectedEvent(result.data);
    setFormOpen(false);
    setConflicts(null);
    setPendingInput(null);
  }

  async function handleFormSubmit(input: JadwalTamuFormInput) {
    const editId = formInitial?.id;
    const clashes = await checkConflicts(input.tanggalMulai, editId);
    if (clashes.length > 0) {
      setPendingInput({ input, editId });
      setConflicts(clashes);
      return;
    }
    await doSubmit(input, editId);
  }

  async function handleConfirmConflict() {
    if (!pendingInput) return;
    await doSubmit(pendingInput.input, pendingInput.editId);
  }

  async function handleDelete() {
    if (!deleteTarget || !actor) return;
    const { success, error } = await remove(deleteTarget.id, actor);
    if (success) {
      push('Jadwal berhasil dihapus.', 'success');
      if (selectedEvent?.id === deleteTarget.id) setSelectedEvent(null);
    } else {
      push(error ?? 'Gagal menghapus jadwal.', 'error');
    }
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 p-5 lg:p-6 min-h-screen bg-neutral-white">
      {/* Kalender utama */}
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <h1 className="text-xl font-bold text-neutral-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Jadwal Tamu
          </h1>
          <p className="text-sm text-neutral-gray">Kalender rencana kedatangan tamu ke TMP</p>
        </div>

        <div className="mt-4">
          <CalendarToolbar
            anchorDate={anchorDate}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            canAdd={isMaster}
            onAdd={() => openAddForm()}
          />

          {loading ? (
            <div className="flex items-center justify-center h-64 text-neutral-gray text-sm">Memuat jadwal...</div>
          ) : (
            <>
              {viewMode === 'month' && (
                <MonthView
                  anchorDate={anchorDate}
                  events={events}
                  selectedEventId={selectedEvent?.id}
                  onSelectEvent={handleSelectEvent}
                  onSelectEmptyDay={handleSelectEmptyDay}
                  tipeColorMap={tipeColorMap}
                />
              )}
              {viewMode === 'week' && (
                <WeekView
                  anchorDate={anchorDate}
                  events={events}
                  selectedEventId={selectedEvent?.id}
                  onSelectEvent={handleSelectEvent}
                  onSelectEmptyDay={handleSelectEmptyDay}
                  tipeColorMap={tipeColorMap}
                />
              )}
              {viewMode === 'year' && (
                <YearView
                  anchorDate={anchorDate}
                  events={events}
                  onSelectMonth={(month) => {
                    setAnchorDate(month);
                    setViewMode('month');
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar kanan: mini kalender + detail */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
        <MiniCalendar
          anchorDate={anchorDate}
          events={events}
          onSelectDate={(date) => {
            setAnchorDate(date);
            setViewMode('month');
          }}
          onMonthShift={(dir) => setAnchorDate((d) => shiftDate(d, 'month', dir))}
        />

        <DetailPanel
          event={selectedEvent}
          canEdit={isMaster}
          onEdit={openEditForm}
          onDelete={setDeleteTarget}
          onViewAttachment={setAttachmentTarget}
          tipeColorMap={tipeColorMap}
        />
      </div>

      {formOpen && (
        <EventFormModal
          initial={formInitial}
          defaultDate={formDefaultDate}
          submitting={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {conflicts && (
        <ConflictConfirmDialog
          conflicts={conflicts}
          onConfirm={handleConfirmConflict}
          onCancel={() => {
            setConflicts(null);
            setPendingInput(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Yakin ingin menghapus jadwal "${deleteTarget.namaKegiatan}"? Data akan diarsipkan dan tetap tercatat di histori.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {attachmentTarget && <AttachmentModal event={attachmentTarget} onClose={() => setAttachmentTarget(null)} />}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
