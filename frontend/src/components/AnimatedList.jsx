import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'motion/react';
import './AnimatedList.css';

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: '1rem', cursor: 'pointer' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  onItemSelect,
  onEdit,
  onDelete,
  onComplete,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  selectedTaskId = null
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const isTaskObject = items.length > 0 && typeof items[0] === 'object' && items[0] !== null && 'task' in items[0];
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const rafRef = useRef(0);

  const handleItemMouseEnter = useCallback(index => {
    setSelectedIndex(index);
  }, []);

  const handleItemPointerMove = useCallback(e => {
    const el = e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    });
  }, []);

  const handleItemPointerLeave = useCallback(e => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  }, []);

  const handleItemClick = useCallback(
    (item, index) => {
      setSelectedIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [onItemSelect]
  );

  const getItemId = useCallback(
    (item, index) => (isTaskObject && item && item.id != null ? item.id : index),
    [isTaskObject]
  );
  const getItemTitle = useCallback(
    (item) => (isTaskObject && item && typeof item.task === 'string' ? item.task : String(item)),
    [isTaskObject]
  );
  const isExpanded = useCallback(
    (item, index) => selectedTaskId != null && getItemId(item, index) === selectedTaskId,
    [selectedTaskId, getItemId]
  );

  const handleScroll = useCallback(e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = e => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(items[selectedIndex], selectedIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth'
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => {
          const expanded = isExpanded(item, index);
          const title = getItemTitle(item);
          return (
            <AnimatedItem
              key={isTaskObject && item && item.id != null ? item.id : index}
              delay={0.1}
              index={index}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              <div
                className={`item ${selectedIndex === index ? 'selected' : ''} ${expanded ? 'item-expanded' : ''} ${itemClassName}`}
                onPointerMove={handleItemPointerMove}
                onPointerLeave={handleItemPointerLeave}
              >
                <div className="item-row">
                  <span className={`item-arrow ${expanded ? 'expanded' : ''}`} aria-hidden>
                    {expanded ? '▼' : '▶'}
                  </span>
                  <p className="item-text">{title}</p>
                  <div className="item-actions" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      className="icon-button edit"
                      aria-label="Edit task"
                      onClick={() => onEdit && onEdit(item, index)}
                    >
                      ✏
                    </button>
                    <button
                      type="button"
                      className="icon-button complete"
                      aria-label="Mark complete"
                      onClick={() => onComplete && onComplete(item, index)}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      className="icon-button delete"
                      aria-label="Delete task"
                      onClick={() => onDelete && onDelete(item, index)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {isTaskObject && item && expanded && (
                  <div className="item-detail">
                    {item.description && <p className="item-detail-description">{item.description}</p>}
                    <div className="item-detail-meta">
                      {item.created_at && (
                        <span>
                          <span className="item-detail-label">Created:</span>{' '}
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      )}
                      {(item.start_date || item.start) && (
                        <span>
                          <span className="item-detail-label">Start:</span> {item.start_date || item.start}
                        </span>
                      )}
                      {(item.end_date || item.end) && (
                        <span>
                          <span className="item-detail-label">End:</span> {item.end_date || item.end}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedItem>
          );
        })}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }}></div>
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }}></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;

