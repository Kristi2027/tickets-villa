import React from 'react';
import { Event } from '../types';

interface EventApprovalProps {
    pendingEvents: Event[];
    onEventApproval: (eventId: string, newStatus: 'active' | 'rejected') => void;
    onViewEvent: (event: Event) => void;
    onEditEvent: (event: Event) => void;
}

const EventApproval: React.FC<EventApprovalProps> = ({ pendingEvents, onEventApproval, onViewEvent, onEditEvent }) => {
    
    const handleApprove = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to approve this event? It will become publicly visible.")) {
            onEventApproval(eventId, 'active');
        }
    };

    const handleReject = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to reject this event? This action cannot be undone.")) {
            onEventApproval(eventId, 'rejected');
        }
    };
    
    if (pendingEvents.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900 border border-slate-800 rounded-2xl">
                <h2 className="text-2xl font-semibold text-white">No Pending Approvals</h2>
                <p className="text-gray-400 mt-2">There are no new events waiting for your review.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-zinc-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Event Approval Queue</h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-black/20">
                        <tr>
                            <th className="px-4 py-3">Event Title</th>
                            <th className="px-4 py-3">Organizer</th>
                            <th className="px-4 py-3">City</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingEvents.map(event => (
                            <tr key={event.id} onClick={() => onViewEvent(event)} className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer">
                                <td className="px-4 py-3 font-medium text-white">{event.title}</td>
                                <td className="px-4 py-3">{event.createdBy}</td>
                                <td className="px-4 py-3">{event.city}</td>
                                <td className="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={(e) => { e.stopPropagation(); onViewEvent(event); }} className="font-semibold text-cyan-400 px-3 py-1.5 rounded-lg text-xs hover:bg-cyan-500/10 transition-colors">View</button>
                                    <button onClick={(e) => { e.stopPropagation(); onEditEvent(event); }} className="font-semibold text-yellow-400 px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-500/10 transition-colors">Edit</button>
                                    <button onClick={(e) => handleApprove(e, event.id)} className="font-semibold text-white bg-green-600 px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-colors">Approve</button>
                                    <button onClick={(e) => handleReject(e, event.id)} className="font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-colors">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventApproval;