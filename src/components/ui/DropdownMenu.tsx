
'use client';

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

const DropdownMenuContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ isOpen: false, setIsOpen: () => {} });

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild = false }: { children: React.ReactNode, asChild?: boolean }) => {
  const { setIsOpen } = useContext(DropdownMenuContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: () => {
        setIsOpen(prev => !prev);
        if (children.props.onClick) {
          children.props.onClick();
        }
      },
    });
  }

  return <div onClick={() => setIsOpen(prev => !prev)}>{children}</div>;
};

export const DropdownMenuContent = ({ children, align = 'right' }: { children: React.ReactNode, align?: 'left' | 'right' }) => {
  const { isOpen, setIsOpen } = useContext(DropdownMenuContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  if (!isOpen) return null;

  const alignmentClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      ref={contentRef}
      className={`absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ${alignmentClasses}`}
    >
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const { setIsOpen } = useContext(DropdownMenuContext);
  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
};
