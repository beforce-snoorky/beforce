"use client"

import { useEffect } from "react"

type ChatbotConfig = {
  key: string
  email: string
}

interface ChatbotClientConstructor {
  new(config: ChatbotConfig): {
    destroy?: () => void
    [key: string]: unknown
  }
}

declare global {
  interface Window {
    ChatbotClientInstance?: {
      destroy?: () => void
      [key: string]: unknown
    }
    ChatbotClient?: ChatbotClientConstructor
  }
}

const Chatbot = () => {
  useEffect(() => {
    if (document.getElementById("chatbot-script")) return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://snoorky.github.io/chatbot/assets/index-DDbRTrOa.css"
    link.id = "chatbot-style"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.id = "chatbot-script"
    script.src = "https://snoorky.github.io/chatbot/chatbot-widget.js"
    script.onload = () => {
      if (window.ChatbotClient) {
        const instance = new window.ChatbotClient({
          key: "9653a1c4e4807885d956100febaaae7c73c7de0346603b765a2a79c1574ced93",
          email: "suporte@beforce.com.br",
        })
        window.ChatbotClientInstance = instance
      }
    }
    document.body.appendChild(script)

    return () => {
      const styleEl = document.getElementById("chatbot-style")
      if (styleEl) styleEl.remove()

      const scriptEl = document.getElementById("chatbot-script")
      if (scriptEl) scriptEl.remove()

      const chatbotRoot = document.getElementById("chatbot-root")
      if (chatbotRoot) chatbotRoot.remove()

      if (window.ChatbotClientInstance) {
        try {
          window.ChatbotClientInstance.destroy?.()
          window.ChatbotClientInstance = undefined
        } catch (error) {
          console.warn(error)
        }
      }
    }
  }, [])

  return null
}

export default Chatbot