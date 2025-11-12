import React, { useMemo, memo } from 'react';
import { Event, EventBooking, User, PayoutRequest } from '../types';

// --- ICONS ---
const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const AttendanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 11c7.23 0 12-3.045 12-3.045S19.23 11 12 11z" /></svg>;


// --- RE-STYLED & NEW COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string }> = memo(({ title, value, icon, description }) => (
    <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 transition-all duration-300 hover:border-red-600/30 hover:shadow-[0_0_15px_rgba(220,38,38,0.1)]">
        <div className="bg-red-600/10 text-red-500 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
    </div>
));

const HypeGauge: React.FC<{ score: number }> = memo(({ score }) => {
    const maxScore = 500;
    const clampedScore = Math.max(0, Math.min(score, maxScore));
    const percentage = clampedScore / maxScore;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percentage);

    const getHypeColor = () => {
        if (percentage <= 0.5) {
            return '#f97316'; // Orange-500
        } else if (percentage <= 0.7) {
            return '#facc15'; // Yellow-400
        } else {
            return '#22c55e'; // Green-500
        }
    };

    const hypeColor = getHypeColor();

    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-white mb-4">Hype Score</h3>
            <div className="relative">
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="#3f3f46" strokeWidth="10" />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={hypeColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: hypeColor }}>{score}</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">AI-generated score indicating<br/>event popularity.</p>
        </div>
    );
});


const DonutChart: React.FC<{ data: { label: string; value: number }[] }> = memo(({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const getTicketDistributionColor = (percentage: number) => {
        if (percentage <= 0.5) {
            return '#f97316'; // Orange-500
        } else if (percentage <= 0.7) {
            return '#facc15'; // Yellow-400
        } else {
            return '#22c55e'; // Green-500
        }
    };

    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Type Distribution</h3>
            {data.length > 0 && total > 0 ? (
                 <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <svg width="160" height="160" viewBox="0 0 140 140">
                            {data.map((item) => {
                                const percentage = item.value / total;
                                const strokeDasharray = `${percentage * circumference} ${circumference}`;
                                const rotation = (accumulatedOffset / total) * 360;
                                accumulatedOffset += item.value;
                                const color = getTicketDistributionColor(percentage);
                                return (
                                    <circle
                                        key={item.label}
                                        cx="70" cy="70" r={radius}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="20"
                                        strokeDasharray={strokeDasharray}
                                        transform={`rotate(${rotation - 90} 70 70)`}
                                    />
                                );
                            })}
                        </svg>
                    </div>
                    <div className="space-y-2 flex-1">
                        {data.map((item) => {
                            const percentage = item.value / total;
                            const color = getTicketDistributionColor(percentage);
                            return (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-slate-300">{item.label}</span>
                                    </div>
                                    <span className="font-semibold text-white">{(percentage * 100).toFixed(1)}%</span>
                                </div>
                            );
                        })}
                    </div>
                 </div>
            ) : (
                <p className="text-slate-500 text-center py-8">No ticket sales data available.</p>
            )}
        </div>
    );
});

const LineChart: React.FC<{ data: { date: string; sales: number }[] }> = memo(({ data }) => {
    const width = 500, height = 200, padding = 30;
    const maxValue = Math.max(...data.map(d => d.sales), 1);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - (d.sales / maxValue) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Sales Over Time (Last 30 Days)</h3>
            {data.length > 1 ? (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <text x="5" y={padding + 5} fill="#64748b" fontSize="10">{maxValue}</text>
                    <text x="5" y={height - padding} fill="#64748b" fontSize="10">0</text>
                    
                    <text x={padding} y={height-5} fill="#64748b" fontSize="10">{data[0]?.date}</text>
                    <text x={width - padding} y={height-5} fill="#64748b" fontSize="10" textAnchor="end">{data[data.length - 1]?.date}</text>

                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polyline fill="url(#areaGradient)" points={`${padding},${height - padding} ${points} ${width - padding},${height-padding}`} />
                    <polyline fill="none" stroke="#dc2626" strokeWidth="2" points={points} />
                </svg>
            ) : (
                <p className="text-slate-500 text-center py-8">Not enough data to display a trend.</p>
            )}
        </div>
    );
});

const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string; valuePrefix?: string; }> = memo(({ data, title, valuePrefix = '' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
            <div className="space-y-4">
                {data.length > 0 ? data.map(({ label, value }) => (
                    <div key={label} className="group grid grid-cols-12 gap-4 items-center">
                        <p className="text-sm text-slate-300 truncate col-span-3">{label}</p>
                        <div className="col-span-9 flex items-center gap-4">
                             <div className="w-full bg-black/30 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-700 h-4 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${(value / maxValue) * 100}%` }}
                                />
                            </div>
                            <p className="font-semibold text-white w-24 text-right">{valuePrefix}{value.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                )) : (
                     <p className="text-slate-500 text-center py-8">No data available to display.</p>
                )}
            </div>
        </div>
    );
});

const DetailItem: React.FC<{ label: string; value?: string; }> = memo(({ label, value }) => (
    <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-base text-white font-medium">{value || '-'}</p>
    </div>
));


interface AdminEventDetailProps {
    event: Event;
    users: User[];
    bookings: EventBooking[];
    payoutRequests: PayoutRequest[];
    onProcessPayout: (requestId: string) => void;
    onBack: () => void;
}

const AdminEventDetail: React.FC<AdminEventDetailProps> = ({ event, users, bookings, payoutRequests, onProcessPayout, onBack }) => {

    const organizer = useMemo(() => users.find(u => u.email === event.createdBy), [users, event.createdBy]);
    const payoutRequest = useMemo(() => payoutRequests.find(p => p.requesterType === 'event' && p.requesterId === event.id), [payoutRequests, event.id]);

    const getStatusChip = (status?: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-300';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'Rejected': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const analyticsData = React.useMemo(() => {
        const eventBookings = bookings.filter(b => b.eventId === event.id);
        
        let totalRevenue = 0;
        let totalTicketsSold = 0;
        const ticketSales: Record<string, { sold: number; revenue: number }> = {};
        const salesByCity: Record<string, number> = {};
        
        event.tickets.forEach(ticket => {
            ticketSales[ticket.name] = { sold: 0, revenue: 0 };
        });

        const salesByDay: Record<string, number> = {};
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            salesByDay[d.toISOString().split('T')[0]] = 0;
        }

        for (const booking of eventBookings) {
            totalRevenue += booking.totalPrice;
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
            const buyerCity = booking.buyerCity || event.city; // Fallback to event city

            if (!salesByCity[buyerCity]) {
                salesByCity[buyerCity] = 0;
            }
            
            for (const ticket of booking.bookedTickets) {
                totalTicketsSold += ticket.quantity;
                salesByCity[buyerCity] += ticket.quantity;

                if (!ticketSales[ticket.name]) {
                     ticketSales[ticket.name] = { sold: 0, revenue: 0 };
                }
                ticketSales[ticket.name].sold += ticket.quantity;

                if (salesByDay[bookingDate] !== undefined) {
                    salesByDay[bookingDate] += ticket.quantity;
                }
                
                const originalTicket = event.tickets.find(t => t.name === ticket.name);
                if(originalTicket) {
                    ticketSales[ticket.name].revenue += ticket.quantity * originalTicket.price;
                }
            }
        }
        
        const estimatedAttendance = Math.floor(totalTicketsSold * 0.9);
        
        const ticketSalesData = Object.entries(ticketSales).map(([label, data]) => ({ label, value: data.sold }));
        const revenueByTypeData = Object.entries(ticketSales).map(([label, data]) => ({ label, value: data.revenue }));
        const salesOverTimeData = Object.entries(salesByDay).map(([date, sales]) => ({ date: new Date(date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}), sales }));
        const salesByCityData = Object.entries(salesByCity).map(([city, sales]) => ({ label: city, value: sales })).sort((a,b) => b.value - a.value);

        return {
            totalRevenue,
            totalTicketsSold,
            estimatedAttendance,
            ticketSalesData,
            revenueByTypeData,
            salesOverTimeData,
            salesByCityData,
        };
    }, [event, bookings]);

    return (
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Event Details</h2>
                    <p className="text-slate-400 mt-1">Metrics & Management for: <span className="font-semibold text-red-500">{event.title}</span></p>
                </div>
                 <button onClick={onBack} className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Event List
                 </button>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-zinc-900 p-4 rounded-lg border border-slate-800">
                    <h4 className="font-semibold text-white mb-4">Organizer Details</h4>
                    {organizer ? (
                        <div className="space-y-3">
                            <DetailItem label="Name" value={organizer.organizerName} />
                            <DetailItem label="Email" value={organizer.email} />
                            <DetailItem label="Phone" value={organizer.phone} />
                        </div>
                    ) : <p className="text-sm text-slate-400">Organizer info not found.</p>}
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg border border-slate-800">
                    <h4 className="font-semibold text-white mb-4">Banking Details</h4>
                    {organizer ? (
                        <div className="space-y-3">
                            <DetailItem label="Bank Name" value={organizer.bankName} />
                            <DetailItem label="Account Number" value={organizer.accountNumber} />
                            <DetailItem label="IFSC Code" value={organizer.ifscCode} />
                        </div>
                    ) : <p className="text-sm text-slate-400">No banking details.</p>}
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg border border-slate-800">
                    <h4 className="font-semibold text-white mb-4 flex justify-between items-center">
                        <span>Payout Information</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusChip(payoutRequest?.status)}`}>
                            {payoutRequest?.status || 'No Request'}
                        </span>
                    </h4>
                    {payoutRequest ? (
                         <div className="space-y-3">
                            <DetailItem label="Requested Amount" value={`₹${payoutRequest.amount.toLocaleString('en-IN')}`} />
                            {payoutRequest.status === 'Pending' && (
                                 <button onClick={() => onProcessPayout(payoutRequest.id)} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Process Payout</button>
                            )}
                         </div>
                    ) : <p className="text-sm text-slate-400">No payout requested for this event.</p>}
                </div>
             </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Revenue" value={`₹${analyticsData.totalRevenue.toLocaleString('en-IN')}`} icon={<RevenueIcon />} description="Gross revenue from all ticket sales." />
                        <StatCard title="Tickets Sold" value={analyticsData.totalTicketsSold} icon={<TicketIcon />} description="Total number of individual tickets sold." />
                        <StatCard title="Est. Attendance" value={analyticsData.estimatedAttendance} icon={<AttendanceIcon />} description="Based on a 90% turn-up rate." />
                    </div>
                    <LineChart data={analyticsData.salesOverTimeData} />
                </div>
                {/* Hype & Distribution */}
                <div className="space-y-6">
                    <HypeGauge score={event.hype} />
                    <DonutChart data={analyticsData.ticketSalesData} />
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart data={analyticsData.ticketSalesData} title="Ticket Sales Breakdown" />
                <BarChart data={analyticsData.revenueByTypeData} title="Revenue by Ticket Type" valuePrefix="₹" />
            </div>
            <div className="mt-6">
                <BarChart data={analyticsData.salesByCityData} title="Ticket Sales by Buyer Location" />
            </div>
        </div>
    );
};

export default AdminEventDetail;