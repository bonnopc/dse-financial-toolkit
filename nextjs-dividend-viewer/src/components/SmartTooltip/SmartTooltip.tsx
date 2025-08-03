import React, { useEffect, useRef, useState } from 'react';
import './SmartTooltip.css';

interface SmartTooltipProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  className?: string;
  maxWidth?: number;
}

type TooltipPosition =
  | 'right-top'
  | 'right-bottom'
  | 'left-top'
  | 'left-bottom';

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  children,
  tooltip,
  className = '',
  maxWidth = 350,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: 'right-top' as TooltipPosition,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculateBestPosition = (): {
    top: number;
    left: number;
    placement: TooltipPosition;
  } => {
    if (!containerRef.current)
      return { top: 0, left: 0, placement: 'right-top' };

    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual tooltip height, or use estimated height if not available yet
    const tooltipHeight =
      tooltipRef.current?.getBoundingClientRect().height || 200;
    const gap = 10;

    // Check available space in all directions
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Determine horizontal placement (left vs right)
    const preferRight = spaceRight >= maxWidth + gap;
    const canFitLeft = spaceLeft >= maxWidth + gap;

    let horizontal: 'left' | 'right';
    if (preferRight) {
      horizontal = 'right';
    } else if (canFitLeft) {
      horizontal = 'left';
    } else {
      // Choose the side with more space
      horizontal = spaceRight > spaceLeft ? 'right' : 'left';
    }

    // Determine vertical placement (top vs bottom)
    const preferBottom = spaceBelow >= tooltipHeight;
    const canFitTop = spaceAbove >= tooltipHeight;

    let vertical: 'top' | 'bottom';
    if (preferBottom) {
      vertical = 'top'; // tooltip positioned from top of trigger (growing downward)
    } else if (canFitTop) {
      vertical = 'bottom'; // tooltip positioned from bottom of trigger (growing upward)
    } else {
      // Choose the side with more space
      vertical = spaceBelow > spaceAbove ? 'top' : 'bottom';
    }

    // Calculate final position
    let left: number;
    let top: number;

    if (horizontal === 'right') {
      left = rect.right + gap;
    } else {
      left = rect.left - maxWidth - gap;
    }

    if (vertical === 'top') {
      top = rect.top;
    } else {
      top = rect.bottom - tooltipHeight;
    }

    // Ensure tooltip stays within viewport bounds
    left = Math.max(gap, Math.min(left, viewportWidth - maxWidth - gap));
    top = Math.max(gap, Math.min(top, viewportHeight - tooltipHeight - gap));

    const placement: TooltipPosition =
      `${horizontal}-${vertical}` as TooltipPosition;

    return { top, left, placement };
  };

  const handleMouseEnter = () => {
    setIsPositioned(false);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setIsPositioned(false);
  };

  // Callback ref to calculate position as soon as tooltip element is available
  const tooltipCallbackRef = (element: HTMLDivElement | null) => {
    if (element && !isPositioned) {
      // Update the ref manually
      (tooltipRef as React.MutableRefObject<HTMLDivElement | null>).current =
        element;
      // Calculate position immediately now that we have the element
      const newPosition = calculateBestPosition();
      setPosition(newPosition);
      setIsPositioned(true);
    }
  };

  // Update position on scroll and resize
  useEffect(() => {
    if (showTooltip && isPositioned) {
      const handleScroll = () => {
        const newPosition = calculateBestPosition();
        setPosition(newPosition);
      };
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [showTooltip, isPositioned, maxWidth]);

  return (
    <div
      ref={containerRef}
      className={`smart-tooltip-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip && (
        <div
          ref={tooltipCallbackRef}
          className={`smart-tooltip smart-tooltip-${position.placement}`}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            maxWidth: maxWidth,
            zIndex: 10000,
            opacity: isPositioned ? 1 : 0,
            visibility: isPositioned ? 'visible' : 'hidden',
          }}
        >
          <div className="smart-tooltip-content">{tooltip}</div>
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;
