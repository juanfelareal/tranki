import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * BottomSheet component that renders as:
 * - Bottom sheet on mobile (slides up from bottom, swipe to dismiss)
 * - Centered modal on desktop
 */
const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxHeight = '90vh',
  desktopMaxWidth = 'max-w-md'
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, 250);
  }, [onClose]);

  // Touch handlers for swipe-to-dismiss on mobile
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging) return;
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = touch.clientY - startYRef.current;

    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);

    // If dragged more than 100px down, close
    if (dragY > 100) {
      handleClose();
    } else {
      // Snap back
      setDragY(0);
    }
  };

  if (!isOpen && !isClosing) return null;

  const backdropClasses = `fixed inset-0 bg-black/40 backdrop-blur-sm z-50 ${
    isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
  }`;

  // Mobile: Bottom sheet
  if (isMobile) {
    const translateY = isClosing ? '100%' : `${dragY}px`;
    const transition = isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';

    return (
      <>
        {/* Backdrop */}
        <div
          className={backdropClasses}
          onClick={handleClose}
        />

        {/* Bottom Sheet */}
        <div
          ref={sheetRef}
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl ${
            isClosing ? '' : 'animate-slideUp'
          }`}
          style={{
            maxHeight,
            transform: `translateY(${translateY})`,
            transition,
            paddingBottom: 'var(--safe-area-bottom, 0px)'
          }}
        >
          {/* Drag handle - ONLY this area triggers swipe to close */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-feedback"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="overflow-y-auto smooth-scroll"
            style={{ maxHeight: `calc(${maxHeight} - 80px)` }}
          >
            {children}
          </div>
        </div>
      </>
    );
  }

  // Desktop: Centered modal
  return (
    <>
      {/* Backdrop */}
      <div
        className={backdropClasses}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full ${desktopMaxWidth} ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{ maxHeight }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `calc(${maxHeight} - 80px)` }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
