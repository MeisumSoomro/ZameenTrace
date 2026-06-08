// frontend/components/accessible-form.js
// WCAG 2.1 AA Compliant Form Component

'use client';

export function AccessibleInput({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  required,
  ...props
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1a1f2e',
        }}
      >
        {label}
        {required && (
          <span
            aria-label="required"
            style={{ color: '#ef4444', marginLeft: '4px' }}
          >
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px', // Prevents zoom on iOS
          border: error ? '2px solid #ef4444' : '1px solid #e8eaef',
          borderRadius: '8px',
          fontFamily: 'inherit',
          minHeight: '44px', // Touch target size
        }}
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          style={{
            color: '#ef4444',
            fontSize: '12px',
            marginTop: '4px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function AccessibleButton({
  children,
  disabled,
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary: {
      background: '#3d9d8f',
      color: '#fff',
    },
    secondary: {
      background: '#f5f7fa',
      color: '#1a1f2e',
    },
  };

  return (
    <button
      aria-disabled={disabled}
      style={{
        padding: '12px 24px',
        minHeight: '44px',
        minWidth: '44px',
        fontSize: '14px',
        fontWeight: 600,
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 300ms ease',
        ...variants[variant],
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  ...props
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" style={{ marginBottom: '16px' }}>
          {title}
        </h2>
        {children}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#f5f7fa',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function SkipToMain() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#3d9d8f',
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        zIndex: 100,
      }}
      onFocus={(e) => {
        e.target.style.top = '0';
      }}
      onBlur={(e) => {
        e.target.style.top = '-40px';
      }}
    >
      Skip to main content
    </a>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation(items, onSelect) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(items[selectedIndex]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onSelect]);

  return selectedIndex;
}
