import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
    selectedDate: string | null;
    onDateChange: (date: string) => void;
    minDate?: string;
    disabledDates?: string[]; // e.g., ['2024-12-25', '2024-12-31']
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange, minDate, disabledDates = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const getInitialDate = () => {
        if (selectedDate) {
            // Replace hyphens to parse in local timezone correctly
            const date = new Date(selectedDate.replace(/-/g, '/'));
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return new Date();
    };

    const initialDate = getInitialDate();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
    const datePickerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        // Format to YYYY-MM-DD in local timezone to avoid timezone shift from toISOString
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(newDate.getDate()).padStart(2, '0');
        onDateChange(`${year}-${month}-${dayOfMonth}`);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const numDays = daysInMonth(currentYear, currentMonth);
        const startDay = firstDayOfMonth(currentYear, currentMonth);
        const calendarDays = [];

        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`pad-${i}`} className="w-8 h-8"></div>);
        }

        for (let day = 1; day <= numDays; day++) {
            const date = new Date(currentYear, currentMonth, day);
            // Format date string in local time to match selectedDate format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayOfMonth = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayOfMonth}`;
            
            date.setHours(0,0,0,0);
            
            const normalizedMinDate = minDate ? new Date(minDate.replace(/-/g, '/')) : null;
            if(normalizedMinDate) normalizedMinDate.setHours(0,0,0,0);

            const isSelected = selectedDate === dateString;
            const isBeforeMinDate = normalizedMinDate ? date < normalizedMinDate : false;
            const isDateDisabled = disabledDates.includes(dateString);
            const isDisabled = isBeforeMinDate || isDateDisabled;
            
            let className = "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ";
             if (isDisabled) {
                 className += "text-slate-600 cursor-not-allowed line-through";
             } else {
                  className += "cursor-pointer ";
                  if (isSelected) {
                      className += "bg-red-600 text-white font-bold";
                  } else {
                      className += "text-slate-300 hover:bg-red-600/50";
                  }
             }
            
            calendarDays.push(
                <div key={day} onClick={() => !isDisabled && handleDateSelect(day)} className={className}>
                    {day}
                </div>
            );
        }

        return calendarDays;
    };
    
    const formattedDate = selectedDate
        ? new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Select a date';


    return (
        <div className="relative w-full" ref={datePickerRef}>
            <div className="relative" onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    readOnly
                    value={formattedDate}
                    className="w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all cursor-pointer"
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-zinc-900 border border-slate-800 rounded-lg p-4 shadow-2xl z-50">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <div className="font-semibold text-white">
                            {new Date(currentYear, currentMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                        </div>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 justify-items-center">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;