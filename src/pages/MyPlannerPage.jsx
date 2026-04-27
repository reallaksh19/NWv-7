import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import plannerStorage from '../utils/plannerStorage';
import { downloadCalendarEvent } from '../utils/calendar';
import { useLongPress } from '../hooks/useLongPress';

function SwipeableItem({ item, dateKey, onRemove, onLongPressAction }) {
    const [offset, setOffset] = useState(0);
    const [startX, setStartX] = useState(0);

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (startX === 0) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        // Only allow swiping left
        if (diff < 0) {
            setOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        if (offset < -80) {
            onRemove(item, dateKey);
        } else {
            setOffset(0);
        }
        setStartX(0);
    };

    const longPressHandlers = useLongPress(() => onLongPressAction(item, dateKey));

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0,
                width: '80px',
                background: 'var(--accent-danger, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 0
            }}>
                Delete
            </div>
            <div
                className="ua-plan-event-item"
                {...longPressHandlers}
                onTouchStart={(e) => {
                    handleTouchStart(e);
                    longPressHandlers.onTouchStart(e);
                }}
                onTouchMove={(e) => {
                    handleTouchMove(e);
                    // allow minor jitter before canceling long press
                    if (Math.abs(e.touches[0].clientX - startX) > 10) {
                        longPressHandlers.onTouchEnd(e);
                    }
                }}
                onTouchEnd={(e) => {
                    handleTouchEnd(e);
                    longPressHandlers.onTouchEnd(e);
                }}
                style={{ 
                    transform: `translateX(${offset}px)`,
                    transition: startX === 0 ? 'transform 0.2s ease-out' : 'none',
                    position: 'relative',
                    zIndex: 1,
                    background: 'var(--bg-secondary, #1a1a1a)',
                    display: 'flex', alignItems: 'center', padding: '12px 0' 
                }}
            >
                <button className="ua-plan-delete-btn" onClick={() => onRemove(item, dateKey)} aria-label="Remove event" style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem', padding: '0 8px 0 0'}}>✕</button>
                <a href={item.link} target="_blank" draggable="false" rel="noopener noreferrer" style={{flex:1, display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'inherit'}}>
                    <span className="ua-event-icon">{item.icon || '📌'}</span>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <span className="ua-event-title" style={{ fontWeight: 600 }}>{item.title}</span>
                        {item.category && <span className="ua-event-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.category}</span>}
                    </div>
                </a>
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="ua-plan-action-btn" onClick={() => downloadCalendarEvent(item.title, item.description || item.title)} title="Add to Calendar" style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}}>📅</button>
                </div>
            </div>
        </div>
    );
}

function MyPlannerPage() {
    const [planData, setPlanData] = useState({});
    const [undoItem, setUndoItem] = useState(null);

    const loadPlan = () => {
        if (plannerStorage.getPlan) {
            setPlanData(plannerStorage.getPlan());
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPlan();
    }, []);

    const removeWithUndo = (item, dateKey) => {
        const id = item.hiddenKey || item.canonicalId || item.id;
        if (!id) return;
        if (plannerStorage.removeItem) {
            plannerStorage.removeItem(dateKey, id);
            
            setUndoItem({ date: dateKey, item: item });
            loadPlan(); // Refresh data from storage

            setTimeout(() => {
                setUndoItem(null);
            }, 5000);
        }
    };

    const undoLastRemove = () => {
        if (!undoItem) return;
        
        plannerStorage.addItem?.(undoItem.date, undoItem.item);
        setUndoItem(null);
        loadPlan();
    };

    const handleLongPress = (item, dateKey) => {
        if (confirm(`Remove "${item.title}" from your planner?`)) {
            removeWithUndo(item, dateKey);
        }
    };

    // Prepare sorted dates, auto-prune past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    const sortedDates = Object.keys(planData).filter(dateStr => {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) || d >= today;
    }).sort();

    return (
        <div className="page-container">
            <Header title="My Planner" icon="📌" />

            <main className="main-content" style={{ padding: '16px', margin: '0 auto', maxWidth: '800px' }}>
                <div className="ua-weekly-plan">
                    {sortedDates.length === 0 ? (
                        <div className="modern-card empty-state" style={{borderStyle: 'dashed'}}>
                            <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}>📭</span>
                            <h3 style={{marginBottom: '8px', color: 'var(--text-primary)'}}>Your planner is empty</h3>
                            <p style={{color: 'var(--text-secondary)'}}>Find events and releases in 'Up Ahead' and add them to your planner.</p>
                        </div>
                    ) : (
                        sortedDates.map((dateKey) => {
                            const items = planData[dateKey];
                            if (!items || items.length === 0) return null;

                            // Format date for display
                            const dateObj = new Date(dateKey);
                            const displayDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : dateKey;

                            return (
                                <div key={dateKey} className="modern-card" style={{ marginBottom: '16px' }}>
                                    <div className="modern-card__header" style={{ paddingBottom: '0', borderBottom: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="ua-plan-ribbon" style={{ borderRadius: '8px', background: 'var(--accent-primary)', padding: '4px 12px', color: '#fff' }}>
                                                <div style={{fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap'}}>
                                                    {displayDate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ua-plan-day-content" style={{ border: 'none', padding: '8px 0 0 0', background: 'transparent' }}>
                                        {items.map((item, idx) => (
                                            <SwipeableItem key={idx} item={item} dateKey={dateKey} onRemove={removeWithUndo} onLongPressAction={handleLongPress} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {undoItem && (
                    <div style={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        padding: '12px 24px',
                        borderRadius: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        zIndex: 1000
                    }}>
                        <span style={{ fontSize: '0.9rem' }}>Event removed</span>
                        <button onClick={undoLastRemove} style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                            UNDO
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyPlannerPage;
