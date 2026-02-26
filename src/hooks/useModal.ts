import { useState, useCallback } from 'react';

/**
 * Manages the open/closed visibility state for a modal dialog.
 *
 * Encapsulates the repetitive `useState` + setter boilerplate that would
 * otherwise appear in every component that renders a modal. The stable
 * callback references from `useCallback` prevent unnecessary re-renders in
 * child components that receive `open` or `close` as props.
 *
 * @returns An object containing the current open state and stable callbacks
 *   for opening, closing, and toggling the modal.
 *
 * @example
 * const modal = useModal();
 * return <>
 *   <button onClick={modal.open}>Open</button>
 *   <MyModal isOpen={modal.isOpen} onClose={modal.close} />
 * </>;
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
