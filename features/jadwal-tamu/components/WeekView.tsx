'use client';

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { JadwalTamu } from '@/types';
import { HOUR_ROWS, buildWeekDays, eventCoversDate, isSameDay, pastelFor, timeToMinutes, type TipeColorMap } from '../utils';

interface WeekViewProps {
  anchorDate: Date;
  events: JadwalTamu[];
  selectedEventId?: string;
  onSelectEvent: (event: JadwalTamu) => void;
  onSelectEmptyDay?: (date: Date) => void;
  tipeColorMap?: TipeColorMap;
}

const ROW_HEIGHT = 48; // px per jam

export default function WeekView({
  anchorDate,
  events,
  selectedEventId,
  onSelectEvent,
  onSelectEmptyDay,
  tipeColorMap,
}: WeekViewProps) {
  const days = buildWeekDays(anchorDate);
  const today = new Date();

  const eventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => eventCoversDate(e, dateStr));
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #EEEEEE' }}>
      <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #EEEEEE' }}>
        <div className="bg-neutral-light-gray" />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="py-2.5 text-center bg-neutral-light-gray" style={{ borderLeft: '1px solid #EEEEEE' }}>
              <div className="text-xs font-semibold text-neutral-gray">{format(day, 'EEE', { locale: localeId })}</div>
              <div
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full font-medium mt-0.5 ${
                  isToday ? 'bg-green-primary text-white' : 'text-neutral-black'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-y-auto max-h-[560px]">
        <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div>
            {HOUR_ROWS.map((h) => (
              <div
                key={h}
                className="text-[10px] text-neutral-gray text-right pr-2 "
                style={{ height: ROW_HEIGHT, borderTop: '1px solid #F3F3F3' }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = eventsForDay(day);
            const dateStr = format(day, 'yyyy-MM-dd');
            return (
              <div
                key={day.toISOString()}
                className="relative "
                onClick={() => {
                  if (dayEvents.length === 0) onSelectEmptyDay?.(day);
                }}
                style={{ borderLeft: '1px solid #EEEEEE', cursor: dayEvents.length === 0 ? 'pointer' : undefined }}
              >
                {HOUR_ROWS.map((h) => (
                  <div key={h} style={{ height: ROW_HEIGHT, borderTop: '1px solid #F3F3F3' }} />
                ))}

                {dayEvents.map((ev) => {
                  const pastel = pastelFor(ev.tipeKegiatan, tipeColorMap);
                  const active = ev.id === selectedEventId;

                  const isStartDay = dateStr === ev.tanggalMulai;
                  const isEndDay = ev.punyaWaktuSelesai && ev.tanggalSelesai ? dateStr === ev.tanggalSelesai : isStartDay;

                  const startMin = isStartDay ? timeToMinutes(ev.jamMulai) : 0;
                  const endMin = isEndDay
                    ? ev.punyaWaktuSelesai && ev.jamSelesai
                      ? timeToMinutes(ev.jamSelesai)
                      : timeToMinutes(ev.jamMulai) + 60
                    : 24 * 60;

                  const top = (startMin / 60) * ROW_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * ROW_HEIGHT, 22);

                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight overflow-hidden transition-transform hover:scale-[1.02] z-10"
                      style={{
                        top,
                        height,
                        backgroundColor: pastel.bg,
                        color: pastel.text,
                        outline: active ? `2px solid ${pastel.dot}` : undefined,
                        borderTopLeftRadius: isStartDay ? 6 : 0,
                        borderTopRightRadius: isStartDay ? 6 : 0,
                        borderBottomLeftRadius: isEndDay ? 6 : 0,
                        borderBottomRightRadius: isEndDay ? 6 : 0,
                      }}
                      title={ev.namaKegiatan}
                    >
                      {ev.namaKegiatan}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
