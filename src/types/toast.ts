/**
 * Represents a single transient notification shown to the user after an
 * action completes successfully. Toasts auto-dismiss after a short delay
 * and are rendered via a portal so they float above all other content.
 */
export interface Toast {
  /** Unique identifier used for keying and removal. */
  id: string
  /** The localised message displayed inside the toast. */
  message: string
  /** Epoch timestamp of creation, used for ordering. */
  createdAt: number
}
