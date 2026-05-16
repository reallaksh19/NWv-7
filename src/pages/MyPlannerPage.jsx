import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import plannerStorage from '../utils/plannerStorage';
import { downloadCalendarEvent, downloadCalendarEvents } from '../utils/calendar';
import { useLongPress } from '../hooks/useLongPress';
import { getPlannerEvidence } from '../services/plannerEvidence';
import { getPlannerViewModel } from '../services/plannerViewModel';
import { getPlannerBulkActionSummary, makePlannerSelectionKey } from '../services/plannerBulkActions';
import './MyPlanner.css';

function PlannerControlsPanel({ viewModel, controls, onControlsChange }) {
    const updateControl = (key, value) => {
        onControlsChange(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <section className="planner-controls" data-planner-controls="filter-search-sort">
            <div className="planner-controls__header">
                <div>
                    <div className="planner-controls__eyebrow">Planner controls</div>
                    <h2>Find and organize saved items</h2>
                    <p>
                        Showing {viewModel.filteredCount} of {viewModel.totalCount} saved item(s).
                    </p>
                </div>
            </div>

            <div className="planner-controls__grid">
                <label className="planner-controls__field planner-controls__field--search">
                    <span>Search</span>
                    <input
                        type="search"
                        value={controls.query}
                        placeholder="Search title, category, date..."
                        onChange={event => updateControl('query', event.target.value)}
                    />
                </label>

                <label className="planner-controls__field">
                    <span>Category</span>
                    <select
                        value={controls.category}
                        onChange={event => updateControl('category', event.target.value)}
                    >
                        {viewModel.categoryOptions.map(option => (
                            <option key={option} value={option}>
                                {option === 'all' ? 'All categories' : option}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="planner-controls__field">
                    <span>Date window</span>
                    <select
                        value={controls.dateWindow}
                        onChange={event => updateControl('dateWindow', event.target.value)}
                    >
                        <option value="all">All dates</option>
                        <option value="today">Today</option>
                        <option value="next7">Next 7 days</option>
                        <option value="future">Future</option>
                        <option value="overdue">Overdue</option>
                        <option value="undated">Undated</option>
                    </select>
                </label>

                <label className="planner-controls__field">
                    <span>Sort</span>
                    <select
                        value={controls.sortMode}
                        onChange={event => updateControl('sortMode', event.target.value)}
                    >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                        <option value="category">Category</option>
                    </select>
                </label>

                <button
                    type="button"
                    className="planner-controls__reset"
                    onClick={() => onControlsChange({
                        query: '',
                        category: 'all',
                        dateWindow: 'all',
                        sortMode: 'date'
                    })}
                >
                    Reset
                </button>
            </div>
        </section>
    );
}


function PlannerBulkActionBar({
    summary,
    onSelectAll,
    onClearSelection,
    onExportCalendar,
    onRemoveSelected
}) {
    return (
        <section className={`planner-bulk planner-bulk--${summary.hasSelection ? 'active' : 'idle'}`} data-planner-bulk-actions="select-export-remove">
            <div className="planner-bulk__copy">
                <div className="planner-bulk__eyebrow">Bulk actions</div>
                <strong>{summary.title}</strong>
                <span>{summary.filteredCount} filtered item(s) available.</span>
            </div>

            <div className="planner-bulk__actions">
                <button type="button" onClick={onSelectAll} disabled={summary.filteredCount === 0 || summary.allFilteredSelected}>
                    Select filtered
                </button>
                <button type="button" onClick={onClearSelection} disabled={!summary.hasSelection}>
                    Clear
                </button>
                <button type="button" onClick={onExportCalendar} disabled={!summary.canExportCalendar}>
                    Export calendar
                </button>
                <button type="button" className="planner-bulk__danger" onClick={onRemoveSelected} disabled={!summary.canRemove}>
                    Remove selected
                </button>
            </div>
        </section>
    );
}

function PlannerEvidencePanel({ evidence }) {
    if (!evidence) return null;

    return (
        <section className={`planner-evidence planner-evidence--${evidence.status}`} data-planner-evidence="planner-readiness">
            <div className="planner-evidence__header">
                <div>
                    <div className="planner-evidence__eyebrow">Planner command center</div>
                    <h2>{evidence.title}</h2>
                    <p>
                        {evidence.totalItems} saved item(s) · {evidence.dateGroupCount} date group(s) · {evidence.categoryCount} category bucket(s).
                    </p>
                </div>
                <div className="planner-evidence__score">
                    <span>Saved</span>
                    <strong>{evidence.totalItems}</strong>
                </div>
            </div>

            <div className="planner-evidence__grid">
                <div className="planner-evidence__tile">
                    <span>Today</span>
                    <strong>{evidence.todayCount}</strong>
                </div>
                <div className="planner-evidence__tile">
                    <span>Next 7d</span>
                    <strong>{evidence.next7DaysCount}</strong>
                </div>
                <div className="planner-evidence__tile">
                    <span>Overdue</span>
                    <strong>{evidence.overdueCount}</strong>
                </div>
                <div className="planner-evidence__tile">
                    <span>Undated</span>
                    <strong>{evidence.undatedCount}</strong>
                </div>
                <div className="planner-evidence__tile">
                    <span>Dates</span>
                    <strong>{evidence.dateGroupCount}</strong>
                </div>
                <div className="planner-evidence__tile">
                    <span>Categories</span>
                    <strong>{evidence.categoryCount}</strong>
                </div>
            </div>

            {evidence.categoryCounts.length > 0 && (
                <div className="planner-evidence__chips">
                    {evidence.categoryCounts.slice(0, 8).map(category => (
                        <span key={category.key}>{category.key} × {category.count}</span>
                    ))}
                </div>
            )}

            {evidence.upcomingItems.length > 0 && (
                <div className="planner-evidence__upcoming">
                    <div className="planner-evidence__section-title">Next 7 days</div>
                    {evidence.upcomingItems.map(item => (
                        <article key={item.id} className="planner-evidence__upcoming-item">
                            <span>{item.displayDate}</span>
                            <strong>{item.title}</strong>
                            <em>{item.category}</em>
                        </article>
                    ))}
                </div>
            )}

            <details className="planner-evidence__details">
                <summary>Planner notes</summary>
                <ul>
                    {evidence.notes.map((note, index) => (
                        <li key={`planner-note-${index}`}>{note}</li>
                    ))}
                </ul>
            </details>
        </section>
    );
}

function SwipeableItem({ item, dateKey, onRemove, onLongPressAction, selected = false, onSelectionToggle }) {
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
                <input
                    className="planner-item-select"
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelectionToggle?.(item)}
                    onClick={event => event.stopPropagation()}
                    aria-label={`Select ${item.title}`}
                />
                <a href={item.link} target="_blank" draggable="false" rel="noopener noreferrer" style={{flex:1, display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'inherit'}}>
                    <span className="ua-event-icon">{item.icon || '📌'}</span>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <span className="ua-event-title" style={{ fontWeight: 600 }}>{item.title}</span>
                        {item.category && <span className="ua-event-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.category}</span>}
                    </div>
                </a>
                <div style={{display:'flex', gap:'8px'}}>
                    <button className="ua-plan-action-btn" onClick={() => downloadCalendarEvent(item.raw || item)} title="Add to Calendar" style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}}>📅</button>
                </div>
            </div>
        </div>
    );
}

function MyPlannerPage() {
    const [planData, setPlanData] = useState({});
    const [undoItem, setUndoItem] = useState(null);

    const [plannerControls, setPlannerControls] = useState({
        query: '',
        category: 'all',
        dateWindow: 'all',
        sortMode: 'date'
    });

    const [selectedPlannerIds, setSelectedPlannerIds] = useState([]);

    const plannerEvidence = getPlannerEvidence(planData);

    const plannerViewModel = useMemo(() => (
        getPlannerViewModel(planData, plannerControls)
    ), [planData, plannerControls]);

    const plannerBulkSummary = useMemo(() => (
        getPlannerBulkActionSummary(plannerViewModel.filteredItems, selectedPlannerIds)
    ), [plannerViewModel.filteredItems, selectedPlannerIds]);

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
            
            setUndoItem({ bulk: false, date: dateKey, item });
            loadPlan(); // Refresh data from storage

            setTimeout(() => {
                setUndoItem(null);
            }, 5000);
        }
    };

    const undoLastRemove = () => {
        if (!undoItem) return;

        if (undoItem.bulk) {
            undoItem.items.forEach(entry => {
                plannerStorage.addItem?.(entry.date, entry.item);
            });
        } else {
            plannerStorage.addItem?.(undoItem.date, undoItem.item);
        }

        setUndoItem(null);
        loadPlan();
    };

    const handleLongPress = (item, dateKey) => {
        if (confirm(`Remove "${item.title}" from your planner?`)) {
            removeWithUndo(item, dateKey);
        }
    };


    const togglePlannerSelection = (item) => {
        const selectionKey = makePlannerSelectionKey(item);

        setSelectedPlannerIds(prev => (
            prev.includes(selectionKey)
                ? prev.filter(key => key !== selectionKey)
                : [...prev, selectionKey]
        ));
    };

    const selectAllFilteredPlannerItems = () => {
        setSelectedPlannerIds(plannerViewModel.filteredItems.map(makePlannerSelectionKey));
    };

    const clearPlannerSelection = () => {
        setSelectedPlannerIds([]);
    };

    const exportSelectedPlannerItems = () => {
        downloadCalendarEvents(
            plannerBulkSummary.selectedItems.map(item => item.raw || item),
            'nwv7_planner_selection.ics'
        );
    };

    const removeSelectedPlannerItems = () => {
        if (plannerBulkSummary.selectedItems.length === 0) return;

        const removedItems = plannerBulkSummary.selectedItems.map(item => ({
            date: item.dateKey,
            item: item.raw || item
        }));

        plannerBulkSummary.selectedItems.forEach(item => {
            plannerStorage.removeItem?.(item.dateKey, item.id);
        });

        setUndoItem({
            bulk: true,
            items: removedItems
        });

        setSelectedPlannerIds([]);
        loadPlan();

        setTimeout(() => {
            setUndoItem(null);
        }, 5000);
    };

    // Prepare sorted dates, auto-prune past dates
    const sortedDates = plannerViewModel.groupedDates.map(group => group.dateKey);

    return (
        <div className="page-container">
            <Header title="My Planner" icon="📌" />

            <main className="main-content" style={{ padding: '16px', margin: '0 auto', maxWidth: '800px' }}>
                <PlannerEvidencePanel evidence={plannerEvidence} />
                <PlannerControlsPanel
                    viewModel={plannerViewModel}
                    controls={plannerControls}
                    onControlsChange={setPlannerControls}
                />

                <PlannerBulkActionBar
                    summary={plannerBulkSummary}
                    onSelectAll={selectAllFilteredPlannerItems}
                    onClearSelection={clearPlannerSelection}
                    onExportCalendar={exportSelectedPlannerItems}
                    onRemoveSelected={removeSelectedPlannerItems}
                />

                <div className="ua-weekly-plan">
                    {plannerViewModel.totalCount > 0 && plannerViewModel.filteredCount === 0 ? (
                        <div className="modern-card empty-state" style={{borderStyle: 'dashed'}}>
                            <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}>🔎</span>
                            <h3 style={{marginBottom: '8px', color: 'var(--text-primary)'}}>No planner items match your filters</h3>
                            <p style={{color: 'var(--text-secondary)'}}>Try clearing search or changing category/date filters.</p>
                        </div>
                    ) : sortedDates.length === 0 ? (
                        <div className="modern-card empty-state" style={{borderStyle: 'dashed'}}>
                            <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}>📭</span>
                            <h3 style={{marginBottom: '8px', color: 'var(--text-primary)'}}>Your planner is empty</h3>
                            <p style={{color: 'var(--text-secondary)'}}>Find events and releases in 'Up Ahead' and add them to your planner.</p>
                        </div>
                    ) : (
                        sortedDates.map((dateKey) => {
                            const group = plannerViewModel.groupedDates.find(entry => entry.dateKey === dateKey);
                            const items = group?.items || [];
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
                                        {items.map((item) => (
                                            <SwipeableItem
                                                key={makePlannerSelectionKey(item)}
                                                item={item}
                                                dateKey={dateKey}
                                                onRemove={removeWithUndo}
                                                onLongPressAction={handleLongPress}
                                                selected={selectedPlannerIds.includes(makePlannerSelectionKey(item))}
                                                onSelectionToggle={togglePlannerSelection}
                                            />
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
                        <span style={{ fontSize: '0.9rem' }}>{undoItem.bulk ? `${undoItem.items.length} events removed` : 'Event removed'}</span>
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
