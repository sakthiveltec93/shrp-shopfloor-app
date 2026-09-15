import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Universal SearchableSelect Component
 * Replaces cumbersome mobile <select> dropdowns with a fast, typing-enabled,
 * searchable picker with instant filtering across codes, names, badges & descriptions.
 */
export default function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = '🔍 Search & select...',
  searchPlaceholder = '🔍 Type code, name, customer no...',
  disabled = false,
  required = false,
  allowClear = false,
  className = '',
  style = {},
  getOptionValue,
  getOptionLabel,
  getOptionBadge,
  getOptionSublabel,
  renderCustomOption
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to a standard shape
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt, idx) => {
      if (opt === null || opt === undefined) return null;
      if (typeof opt === 'string' || typeof opt === 'number') {
        return {
          id: String(opt),
          value: String(opt),
          label: String(opt),
          badge: '',
          sublabel: '',
          searchTerms: String(opt).toLowerCase(),
          disabled: false,
          raw: opt
        };
      }

      const val = getOptionValue
        ? getOptionValue(opt)
        : opt.value !== undefined
        ? opt.value
        : opt.id !== undefined
        ? opt.id
        : String(idx);

      const label = getOptionLabel
        ? getOptionLabel(opt)
        : opt.label !== undefined
        ? opt.label
        : opt.part_name || opt.machine_code || opt.name || opt.title || opt.material_name || String(val);

      const badge = getOptionBadge
        ? getOptionBadge(opt)
        : opt.badge !== undefined
        ? opt.badge
        : opt.shrp_part_code || opt.part_code || opt.code || '';

      const sublabel = getOptionSublabel
        ? getOptionSublabel(opt)
        : opt.sublabel !== undefined
        ? opt.sublabel
        : opt.customer_part_no
        ? ('Cust: ' + opt.customer_part_no)
        : opt.grade
        ? ('Grade: ' + opt.grade)
        : opt.description || '';

      const searchTerms = [
        String(val),
        String(label || ''),
        String(badge || ''),
        String(sublabel || ''),
        String(opt.searchTerms || '')
      ].join(' ').toLowerCase();

      return {
        id: String(val),
        value: val,
        label: String(label || ''),
        badge: String(badge || ''),
        sublabel: String(sublabel || ''),
        searchTerms,
        disabled: Boolean(opt.disabled),
        raw: opt
      };
    }).filter(Boolean);
  }, [options, getOptionValue, getOptionLabel, getOptionBadge, getOptionSublabel]);

  // Current selected option object
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    return normalizedOptions.find((o) => String(o.value) === String(value)) || null;
  }, [normalizedOptions, value]);

  // Filtered options based on search term
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedOptions;
    
    const keywords = term.split(/\s+/).filter(Boolean);
    return normalizedOptions.filter((opt) =>
      keywords.every((kw) => opt.searchTerms.includes(kw))
    );
  }, [normalizedOptions, searchTerm]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightIndex(0);
      const t = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return;
    
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[highlightIndex]) {
          handleSelect(filteredOptions[highlightIndex]);
        }
      } else if (e.key === 'Tab') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredOptions, highlightIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightIndex]) {
      listRef.current.children[highlightIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightIndex, isOpen]);

  const handleSelect = (option) => {
    if (!option || option.disabled) return;
    const val = option.value;
    
    if (typeof onChange === 'function') {
      const syntheticEvent = {
        target: { id, name, value: val },
        currentTarget: { id, name, value: val },
        value: val,
        option: option.raw,
        toString: () => String(val),
        valueOf: () => val
      };
      onChange(syntheticEvent, val, option.raw);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (typeof onChange === 'function') {
      const syntheticEvent = {
        target: { id, name, value: '' },
        currentTarget: { id, name, value: '' },
        value: '',
        option: null,
        toString: () => '',
        valueOf: () => ''
      };
      onChange(syntheticEvent, '', null);
    }
  };

  return (
    <div
      className={'searchable-select-container ' + className}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {required && (
        <input
          type='text'
          value={value || ''}
          required={required}
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
            pointerEvents: 'none',
            top: '50%',
            left: '50%'
          }}
          tabIndex={-1}
        />
      )}

      {/* Trigger Button / Display Box */}
      <button
        ref={triggerRef}
        type='button'
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        className='searchable-select-trigger'
        style={{
          width: '100%',
          minHeight: 44,
          padding: '8px 12px',
          background: 'var(--card, #1a2234)',
          border: '1px solid var(--line, #334155)',
          borderRadius: 8,
          color: selectedOption ? 'var(--text, #f8fafc)' : 'var(--text-muted, #94a3b8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          fontSize: 14,
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' }}>
          {selectedOption ? (
            <>
              {selectedOption.badge && (
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {selectedOption.badge}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedOption.label}
                </span>
                {selectedOption.sublabel && (
                  <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOption.sublabel}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {allowClear && selectedOption && !disabled && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              style={{
                color: '#94a3b8',
                padding: '2px 6px',
                borderRadius: '50%',
                fontSize: 14,
                lineHeight: 1,
                cursor: 'pointer'
              }}
              title='Clear selection'
            >
              ✕
            </span>
          )}
          <span style={{ color: '#64748b', fontSize: 12 }}>▼</span>
        </div>
      </button>

      {/* Full Modal Overlay on Mobile / Popover on Desktop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 15, 29, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: '#131b2e',
              border: '1px solid #334155',
              borderRadius: 14,
              width: '100%',
              maxWidth: 540,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              marginTop: 'min(40px, 5vh)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Search Bar */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: '#0f172a'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔍 {typeof placeholder === 'string' ? placeholder.replace(/^[🔍\s]+/, '') : 'Select Option'}
                </span>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 6
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Instant Search Input */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '8px 36px 8px 14px',
                    background: '#1e293b',
                    border: '1px solid #3b82f6',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
                  }}
                />
                {searchTerm && (
                  <button
                    type='button'
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: 16,
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                <span>Showing {filteredOptions.length} of {normalizedOptions.length} items</span>
                <span>Type keywords to filter</span>
              </div>
            </div>

            {/* List of Options */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>No matches found</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: '#64748b' }}>
                    No items matching "{searchTerm}"
                  </div>
                  <button
                    type='button'
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: 12,
                      padding: '6px 14px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      color: '#38bdf8',
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
                  const isHighlighted = idx === highlightIndex;

                  if (renderCustomOption) {
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelect(opt)}
                        style={{ cursor: opt.disabled ? 'not-allowed' : 'pointer' }}
                      >
                        {renderCustomOption(opt, { isSelected, isHighlighted })}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: isSelected
                          ? 'rgba(59, 130, 246, 0.2)'
                          : isHighlighted
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'transparent',
                        border: isSelected
                          ? '1px solid #3b82f6'
                          : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        opacity: opt.disabled ? 0.5 : 1,
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
                        {opt.badge && (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              borderRadius: 4,
                              padding: '2px 6px',
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                            {opt.label}
                          </span>
                          {opt.sublabel && (
                            <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 16 }}>
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}