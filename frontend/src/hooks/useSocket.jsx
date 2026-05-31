import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_ORIGIN } from '../api/config'

const socketUrl = API_ORIGIN.replace(/\/api$/, '')

// handlers: { onConnect?, onDisconnect?, events: { eventName: callback } }
export default function useSocket(handlers = {}) {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const s = io(socketUrl, { auth: { token }, reconnectionAttempts: 5, reconnectionDelay: 1000 })
    socketRef.current = s

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
    }
  }, [])

  return socketRef.current
}
