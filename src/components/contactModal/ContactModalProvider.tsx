import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ContactModalContext } from './ContactModalContext'
import ContactModal from './ContactModal'

export default function ContactModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)
	const [topic, setTopic] = useState('')

	const open = useCallback((nextTopic = '') => {
		setTopic(nextTopic)
		setIsOpen(true)
	}, [])
	const close = useCallback(() => setIsOpen(false), [])

	const value = useMemo(() => ({ isOpen, topic, open, close }), [isOpen, topic, open, close])

	return (
		<ContactModalContext.Provider value={value}>
			{children}
			<ContactModal />
		</ContactModalContext.Provider>
	)
}
