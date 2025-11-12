import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SeatLayout, SeatType, SeatCategory } from '../types.ts';

interface SeatLayoutEditorProps {
    layout: SeatLayout;
    onLayoutChange: (newLayout: SeatLayout) => void;
}

const STATIC_SEAT_ICONS: Record<SeatType, React.ReactNode | null> = {
    standard: null,
    premium: null,
    recliner: null,
    wheelchair: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0115 16h1a1 1 0 011 1v.116A4.2 4.2 0 0114.833 20H5.167a4.2 4.2 0 01-2.998-1.116V18a1 1 0 011-1h1a5 5 0 013.43-4.33A6.97 6.97 0 008 16c0 .34.024.673.07 1h4.86z" /></svg>,
    aisle: null,
    empty: null,
    'stage-left': null,
    'stage-right': null,
    ramp: null,
};

const COLOR_PALETTE: string[] = [
    'bg-red-600 border-red-500', 'bg-orange-600 border-orange-500', 'bg-yellow-500 border-yellow-400',
    'bg-lime-500 border-lime-400', 'bg-green-600 border-green-500', 'bg-teal-600 border-teal-500',
    'bg-cyan-600 border-cyan-500', 'bg-blue-600 border-blue-500', 'bg-indigo-600 border-indigo-500',
    'bg-purple-600 border-purple-500', 'bg-pink-600 border-pink-500', 'bg-gray-500 border-gray-400',
];

const SeatIcon: React.FC<{ seatType: SeatType; category?: SeatCategory; seatNumber?: string }> = ({ seatType, category, seatNumber }) => {
    if (!category) {
        return <div className="w-full h-full rounded-md bg-red-500" />;
    }
    const { color } = category;
    const bgColor = color.split(' ')[0];

    // Common style for bookable seats that display a number
    const seatBaseStyle = `relative w-full h-full ${bgColor} rounded-md shadow-inner shadow-black/20 flex items-center justify-center`;
    const seatNumberElement = seatNumber 
        ? <span className="text-white/90 font-bold text-[10px]" style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>{seatNumber}</span> 
        : null;

    switch (seatType) {
        case 'wheelchair':
            return (
                <div className={`relative w-full h-full rounded-md flex items-center justify-center border ${color}`}>
                    <div className="opacity-40">{STATIC_SEAT_ICONS.wheelchair}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {seatNumberElement}
                    </div>
                </div>
            );
        case 'aisle':
            return <div className="w-full h-full" />;
        case 'empty':
            return <div className="w-full h-full rounded-md border-2 border-dashed border-slate-600" />;
        case 'recliner':
            return (
                <div className={seatBaseStyle}>
                    {/* Headrest */}
                    <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[50%] h-[25%] bg-white/20 rounded-sm" />
                    {/* Arm Rests */}
                    <div className="absolute bottom-[2px] left-[3px] w-[15%] h-[50%] bg-black/20 rounded-sm" />
                    <div className="absolute bottom-[2px] right-[3px] w-[15%] h-[50%] bg-black/20 rounded-sm" />
                    {/* Number is centered by flex on seatBaseStyle */}
                    {seatNumberElement}
                </div>
            );
        default: // Standard, Premium, stage, ramp etc.
            return (
                 <div className={seatBaseStyle}>
                     {/* Arm Rests for standard seats */}
                    {(seatType === 'standard' || seatType === 'premium') && <>
                        <div className="absolute bottom-[2px] left-[3px] w-[20%] h-[50%] bg-black/20 rounded-sm" />
                        <div className="absolute bottom-[2px] right-[3px] w-[20%] h-[50%] bg-black/20 rounded-sm" />
                    </>}
                    {seatNumberElement}
                 </div>
            );
    }
};


const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({ layout, onLayoutChange }) => {
    const [activeBrush, setActiveBrush] = useState<SeatType>('standard');
    const [isPainting, setIsPainting] = useState(false);
    const [history, setHistory] = useState<SeatLayout[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategories, setEditingCategories] = useState<SeatCategory[]>([]);
    const [openColorPickerFor, setOpenColorPickerFor] = useState<SeatType | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Default values for numbering
    const rowStartIndex = layout.rowStartIndex ?? 0;
    const colStartIndex = layout.colStartIndex ?? 1;

    const categoryMap = useMemo(() => {
        return new Map(layout.categories.map(cat => [cat.id, cat]));
    }, [layout.categories]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setOpenColorPickerFor(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pushToHistory = (l: SeatLayout) => {
        setHistory(prev => [...prev.slice(-20), l]); // Keep last 20 states
    };
    
    const updateLayout = (newLayout: SeatLayout, trackHistory = true) => {
        if (trackHistory) {
            pushToHistory(layout);
        }
        onLayoutChange(newLayout);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const lastLayout = history[history.length - 1];
            setHistory(history.slice(0, -1));
            onLayoutChange(lastLayout);
        }
    };

    useEffect(() => {
        const handleMouseUp = () => setIsPainting(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const handleDimensionChange = (dim: 'rows' | 'cols', value: number) => {
        pushToHistory(layout);
        const newRows = Math.max(1, Math.min(26, dim === 'rows' ? value : layout.rows));
        const newCols = Math.max(1, Math.min(40, dim === 'cols' ? value : layout.cols));
        const newGrid: SeatType[][] = Array(newRows).fill(null).map((_, r) =>
            Array(newCols).fill(null).map((_, c) => layout.grid[r]?.[c] || 'standard')
        );
        updateLayout({ ...layout, rows: newRows, cols: newCols, grid: newGrid }, false);
    };
    
    const handleNumberingChange = (dim: 'row' | 'col', value: number) => {
        pushToHistory(layout);
        if (dim === 'row') {
            const newLayout = { ...layout, rowStartIndex: value };
            updateLayout(newLayout, false);
        } else {
            const newLayout = { ...layout, colStartIndex: value };
            updateLayout(newLayout, false);
        }
    };

    const handleSeatInteraction = (r: number, c: number, isClick: boolean) => {
        if (!isPainting && !isClick) return;
        if (layout.grid[r][c] === activeBrush) return;

        const newGrid = layout.grid.map(row => [...row]);
        newGrid[r][c] = activeBrush;
        updateLayout({ ...layout, grid: newGrid }, false); // History is managed on mouse down/up
    };
    
    const handleMouseDown = (r: number, c: number) => {
        pushToHistory(layout);
        setIsPainting(true);
        handleSeatInteraction(r, c, true);
    }
    
    const handleBulkFill = (type: 'row' | 'col', index: number) => {
        pushToHistory(layout);
        const newGrid = layout.grid.map(row => [...row]);
        if (type === 'row') {
            for (let c = 0; c < layout.cols; c++) newGrid[index][c] = activeBrush;
        } else {
            for (let r = 0; r < layout.rows; r++) newGrid[r][index] = activeBrush;
        }
        updateLayout({ ...layout, grid: newGrid }, false);
    };

    const handleOpenCategoryModal = () => {
        setEditingCategories(JSON.parse(JSON.stringify(layout.categories))); // Deep copy
        setIsCategoryModalOpen(true);
    };
    
    const handleCategoryChange = (index: number, field: 'name' | 'color' | 'price', value: string) => {
        setEditingCategories(prev => {
            const updated = [...prev];
            const categoryToUpdate = { ...updated[index] };
            if (field === 'price') {
                categoryToUpdate.price = parseInt(value, 10) || 0;
            } else { // 'name' or 'color'
                categoryToUpdate[field] = value;
            }
            updated[index] = categoryToUpdate;
            return updated;
        });
    };

    const handleSaveCategories = () => {
        pushToHistory(layout);
        onLayoutChange({ ...layout, categories: editingCategories });
        setIsCategoryModalOpen(false);
    };

    const formInputStyles = "w-20 bg-zinc-800/50 border border-slate-700 rounded-lg py-1.5 px-3 text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

    return (
        <>
            <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 select-none">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-6 bg-black/20 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <label htmlFor="rows" className="block text-xs font-medium text-slate-400 mb-1">Rows</label>
                            <input type="number" id="rows" min="1" max="26" value={layout.rows} onChange={e => handleDimensionChange('rows', parseInt(e.target.value, 10) || 1)} className={formInputStyles}/>
                        </div>
                        <div>
                            <label htmlFor="cols" className="block text-xs font-medium text-slate-400 mb-1">Columns</label>
                            <input type="number" id="cols" min="1" max="40" value={layout.cols} onChange={e => handleDimensionChange('cols', parseInt(e.target.value, 10) || 1)} className={formInputStyles}/>
                        </div>
                        <div>
                            <label htmlFor="rowStart" className="block text-xs font-medium text-slate-400 mb-1">Row Start</label>
                            <select 
                                id="rowStart" 
                                value={rowStartIndex} 
                                onChange={e => handleNumberingChange('row', parseInt(e.target.value, 10))} 
                                className={`${formInputStyles} appearance-none text-center font-medium`}
                            >
                            {Array.from({ length: 26 }).map((_, i) => (
                                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                            ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="colStart" className="block text-xs font-medium text-slate-400 mb-1">Col Start</label>
                            <input 
                                type="number" 
                                id="colStart" 
                                min="1" 
                                value={colStartIndex} 
                                onChange={e => handleNumberingChange('col', parseInt(e.target.value, 10) || 1)} 
                                className={formInputStyles}
                            />
                        </div>
                        <button 
                            onClick={handleUndo} 
                            disabled={history.length === 0} 
                            className={`self-end font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${history.length > 0 ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                            Undo
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {layout.categories.map((cat) => (
                            <button key={cat.id} onClick={() => setActiveBrush(cat.id)} title={`Set brush to ${cat.name}`}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold border-2 transition-all ${activeBrush === cat.id ? `border-red-500 ${cat.color} text-white` : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        <button onClick={handleOpenCategoryModal} title="Edit category names and colors" className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Grid & Screen Container */}
                <div ref={gridRef} className="flex justify-center overflow-auto pb-4" onMouseLeave={() => setIsPainting(false)}>
                    <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `auto repeat(${layout.cols}, minmax(32px, 1fr))` }}>
                        {/* Top-left corner */}
                        <div />
                        {/* Column Headers */}
                        {Array.from({ length: layout.cols }).map((_, c) => (
                        <div key={c} className="group relative text-center text-xs font-mono text-slate-500 h-6 flex items-center justify-center">
                                {c + colStartIndex}
                                <button onClick={() => handleBulkFill('col', c)} className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Fill</button>
                            </div>
                        ))}
                        {/* Row Headers and Seats */}
                        {layout.grid.map((row, r) => {
                             let seatCounter = 0; // Reset counter for each row
                             return (
                                <React.Fragment key={r}>
                                    <div className="group relative text-right text-xs font-mono text-slate-500 w-8 pr-2 flex items-center justify-end">
                                        {String.fromCharCode(65 + r + rowStartIndex)}
                                        <button onClick={() => handleBulkFill('row', r)} className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Fill</button>
                                    </div>
                                    {row.map((seatType, c) => {
                                        const category = categoryMap.get(seatType);
                                        const isBookable = !['aisle', 'empty', 'stage-left', 'stage-right', 'ramp'].includes(seatType);
                                        
                                        let seatNumber: string | undefined = undefined;
                                        let seatLabel: string | undefined = undefined;

                                        if (isBookable) {
                                            seatCounter++;
                                            seatNumber = `${seatCounter + colStartIndex - 1}`;
                                            seatLabel = `${String.fromCharCode(65 + r + rowStartIndex)}${seatNumber}`;
                                        }
                                        
                                        const title = isBookable && category
                                            ? `Seat ${seatLabel}: ${category?.name} (₹${category?.price.toLocaleString('en-IN')})`
                                            : category?.name;

                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                onMouseDown={() => handleMouseDown(r, c)}
                                                onMouseEnter={() => handleSeatInteraction(r, c, false)}
                                                title={title}
                                                className={`w-full aspect-square rounded-md flex-shrink-0 flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-110 p-0.5`}
                                            >
                                            <SeatIcon seatType={seatType} category={category} seatNumber={isBookable ? seatNumber : undefined}/>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            </div>

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-6 text-white">Edit Categories</h2>
                        <div className="space-y-4">
                            {editingCategories.map((cat, index) => {
                                const isPickerOpen = openColorPickerFor === cat.id;
                                const isEditable = !['aisle', 'empty', 'stage-left', 'stage-right', 'ramp'].includes(cat.id);
                                const isPriceEditable = isEditable || ['wheelchair', 'standard', 'premium', 'recliner'].includes(cat.id);
                                
                                const categoryInputStyles = "w-full bg-zinc-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all";

                                return (
                                    <div key={cat.id} className="grid grid-cols-12 items-center gap-3">
                                        <div className="relative col-span-1">
                                            <button 
                                                type="button"
                                                onClick={() => isEditable && setOpenColorPickerFor(isPickerOpen ? null : cat.id)}
                                                className={`w-6 h-6 rounded-md flex-shrink-0 ${cat.color} ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                                disabled={!isEditable}
                                            />
                                            {isPickerOpen && (
                                                <div ref={colorPickerRef} className="absolute z-10 top-full mt-2 bg-slate-800 border border-slate-700 p-2 rounded-lg grid grid-cols-6 gap-2">
                                                    {COLOR_PALETTE.map(colorClass => (
                                                        <button
                                                            key={colorClass}
                                                            type="button"
                                                            onClick={() => {
                                                                handleCategoryChange(index, 'color', colorClass);
                                                                setOpenColorPickerFor(null);
                                                            }}
                                                            className={`w-6 h-6 rounded ${colorClass} transition-transform hover:scale-110`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={e => handleCategoryChange(index, 'name', e.target.value)}
                                            className={`col-span-6 ${categoryInputStyles}`}
                                            disabled={!isEditable}
                                        />
                                        <div className="relative col-span-5">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">₹</span>
                                             <input
                                                type="number"
                                                value={cat.price}
                                                onChange={e => handleCategoryChange(index, 'price', e.target.value)}
                                                className={`${categoryInputStyles} pl-7`}
                                                disabled={!isPriceEditable}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-800">
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-slate-600">Cancel</button>
                            <button type="button" onClick={handleSaveCategories} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeatLayoutEditor;