"use client";
import { useState } from "react";
import { holidays, Holiday } from "@/data/holidays";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfWeek = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const today = new Date();

export default function CalendarPage() {
  const [selected, setSelected] = useState<Holiday | null>(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Filter holidays for this month
  const monthHolidays = holidays.filter(h => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Build calendar grid
  const weeks: (Holiday | null)[][] = [];
  let week: (Holiday | null)[] = Array(firstDayOfWeek).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const holiday = monthHolidays.find(h => h.date === dateStr) || null;
    week.push(holiday);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">Biblical & Saint Days Calendar</h1>
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => {
              if (month === 0) { setMonth(11); setYear(y => y - 1); }
              else setMonth(m => m - 1);
            }}
          >
            &lt; Prev
          </button>
          <span className="font-semibold text-blue-900">{monthNames[month]} {year}</span>
          <button
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => {
              if (month === 11) { setMonth(0); setYear(y => y + 1); }
              else setMonth(m => m + 1);
            }}
          >
            Next &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-blue-700 font-semibold">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeks.flatMap((week, i) =>
            week.map((holiday, j) => {
              const dayNum = i * 7 + j - firstDayOfWeek + 1;
              const isToday = year === today.getFullYear() && month === today.getMonth() && dayNum === today.getDate();
              return (
                <div
                  key={i + '-' + j}
                  className={`h-16 flex flex-col items-center justify-center rounded-lg border ${holiday ? (holiday.type === 'holiday' ? 'bg-yellow-100 border-yellow-400' : 'bg-green-100 border-green-400') : 'bg-white border-blue-100'} ${isToday ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
                  onClick={() => holiday && setSelected(holiday)}
                >
                  <span className="font-bold">{dayNum > 0 && dayNum <= daysInMonth ? dayNum : ''}</span>
                  {holiday && <span className="text-xs mt-1 font-medium text-blue-900">{holiday.name}</span>}
                </div>
              );
            })
          )}
        </div>
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-2 text-blue-900">{selected.name}</h2>
              <p className="mb-2 text-blue-800">{selected.description}</p>
              <p className="text-sm text-blue-700">{selected.date}</p>
              <button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 