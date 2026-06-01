import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_ORIGIN } from '../api/config'

const socketUrl = API_ORIGIN.replace(/\/api$/, '')

// handlers: { onConnect?, onDisconnect?, events: { eventName: callback } }
export default function useSocket(handlers = {}) {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (!token) {
      console.warn('useSocket: no token found in localStorage — skipping socket connection')
      return
    }

    console.debug('useSocket: connecting to', socketUrl)
    const s = io(socketUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    })
    socketRef.current = s

    s.on('connect_error', (err) => {
      try {
        console.error('Socket connect_error:', err && err.message ? err.message : err)
      } catch (e) {
        console.error('Socket connect_error (stringify failed)')
      }
    })

    s.on('connect', () => console.debug('Socket connected', s.id))
    s.on('disconnect', (reason) => console.debug('Socket disconnected', reason))

    if (handlers.onConnect) s.on('connect', handlers.onConnect)
    if (handlers.onDisconnect) s.on('disconnect', handlers.onDisconnect)

    if (handlers.events) {
      Object.entries(handlers.events).forEach(([ev, cb]) => s.on(ev, cb))
    }

    return () => {
      if (!socketRef.current) return
      if (handlers.events) {
        Object.entries(handlers.events).forEach(([ev, cb]) => socketRef.current.off(ev, cb))
      }
      if (handlers.onConnect) socketRef.current.off('connect', handlers.onConnect)
      if (handlers.onDisconnect) socketRef.current.off('disconnect', handlers.onDisconnect)
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  return socketRef.current
}
