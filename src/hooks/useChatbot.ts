"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    ChatbotClient?: new (config: { key: string; email: string }) => unknown
  }
}

const Chatbot = () => {
  useEffect(() => {
    if (document.getElementById('chatbot-script')) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://snoorky.github.io/chatbot/assets/index-DDbRTrOa.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.id = 'chatbot-script'
    script.src = 'https://snoorky.github.io/chatbot/chatbot-widget.js'
    script.onload = () => {
      if (window.ChatbotClient) {
        new window.ChatbotClient({
          key: '9653a1c4e4807885d956100febaaae7c73c7de0346603b765a2a79c1574ced93',
          email: 'suporte@beforce.com.br',
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [])

  return null
}

export default Chatbot