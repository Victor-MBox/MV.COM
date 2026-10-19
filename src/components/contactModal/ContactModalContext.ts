import { createContext, useContext } from 'react'

export type ContactModalState = {
	isOpen: boolean
	topic: string
	open: (topic?: string) => void
	close: () => void
}

export const ContactModalContext = createContext<ContactModalState | null>(null)

export function useContactModal() {
	const ctx = useContext(ContactModalContext)
	if (!ctx) {
		throw new Error('useContactModal должен использоваться внутри ContactModalProvider')
	}
	return ctx
}
