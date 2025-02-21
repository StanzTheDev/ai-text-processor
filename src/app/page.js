 "use client";
import { useState, useEffect } from "react"
import Gif from './icons8-ai-unscreen.gif'
import Image from 'next/image';
const TextProcessingAi = () => {
  const [inputText, setInputText] = useState('')
  const [outputTexts, setOutputTexts] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isAIAvailable, setIsAIAvailable] = useState(false)

  useEffect(() => {
    const checkAIAvail = () => {
      if (typeof window !== "undefined" && window.ai) {
        setIsAIAvailable(true)
      } else {
        console.warn("Chrome AI APIs not available. Make sure experimental features are enabled.")
        setIsAIAvailable(false)
      }
    }

    checkAIAvail()
    if (!isAIAvailable && typeof window !== "undefined") {
      const interval = setInterval(checkAIAvail, 1000)
      return () => clearInterval(interval)
    }
  }, [isAIAvailable])

  const handleSend = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text.")
      return
    }

    if (!isAIAvailable) {
      alert("Chrome AI APIs are not available. Please enable experimental features in Chrome settings.")
      return
    }

    try {
      const detectionResult = await detectLanguage(inputText)
     console.log(detectionResult);
      const newEntry = {
        id: Date.now(),
        text: inputText,
        detectedLanguage: detectionResult,
      }

      setOutputTexts((prevTexts) => [newEntry, ...prevTexts])
      setInputText('')
    } catch (error) {
      console.error("Error processing input:", error)
      alert("An error occurred while processing your text. Please try again.")
    }
  }

  const detectLanguage = async (text) => {
    try {
      const detector = await window.ai.languageDetector.create()
      return await detector.detect(text)
      console.error("Error detecting language:", error)
    } catch (error) {
         return { detectedLanguage: "unknown", confidence: 0 }
    }
  }

  const summarizeText = async (text, index) => {
    if (!isAIAvailable) {
      alert("Chrome AI APIs are not available.")
      return
    }

    try {
      console.log("Attempting to summarize text:", text)
      if (!window.ai || !window.ai.summarizer) {
        console.error("Summarizer API not found.")
        alert("Summarizer API is not available. Please enable experimental features in Chrome.")
        return
      }

      const summarizer = await window.ai.summarizer.create()
      console.log("Summarizer instance created:", summarizer)
      const summary = await summarizer.summarize(text)
      console.log("Summary result:", summary)

      updateOutput(index, { summary })
    } catch (error) {
      console.error("Error summarizing text:", error)
      alert("Could not summarize text. Please try again.")
    }
  }
  const translateText = async (text, index) => {
    if (!isAIAvailable) {
      alert("Chrome AI APIs are not available.")
      return
    }

    try {
      const entry = outputTexts[index]
      const sourceLang =
        entry.detectedLanguage && typeof entry.detectedLanguage === "object" && entry.detectedLanguage.detectedLanguage
          ? entry.detectedLanguage.detectedLanguage
          : typeof entry.detectedLanguage === "string"
            ? entry.detectedLanguage
            : "en"

      const translator = await window.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: selectedLanguage,
      })

      const translation = await translator.translate(text)
      updateOutput(index, { translation })
    } catch (error) {
      console.error("Error translating text:", error)
      alert("Could not translate text. Please try again.")
    }
  }

  const updateOutput = (index, updates) => {
    setOutputTexts((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)))
  }

  const getLanguageDisplayString = (langData) => {
    if (!langData) return "Unknown"

    if (typeof langData === "string") {
      return langData
    }

    if (typeof langData === "object") {
      const lang = langData.detectedLanguage || "Unknown"
      const confidence = langData.confidence ? ` (Confidence: ${Math.round(langData.confidence * 100)}%)` : ""
      return `${lang}${confidence}`
    }

    return "Unknown"
  }

  const canSummarize = (entry) => {
   
    return entry.text && entry.text.length > 150
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      {!isAIAvailable && (
        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-4 animate-pulse" role="alert">
          <p className="font-bold text-lg">Chrome AI APIs Not Available</p>
          <p>Enable experimental AI features in Chrome settings to unleash the power of this app.</p>
        </div>
      )}
<div></div>
        <header className="py-6 px-4 bg-black bg-opacity-50 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          AIText Processor
        </h1>
      </header>

      <div className="flex-grow overflow-auto mb-4 px-4 py-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {outputTexts.map((entry, index) => (
                <div
              key={entry.id || index}
              className="p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 transform hover:scale-102 transition-all duration-300"
              >
              <div className="space-y-4">
                <p className="text-gray-300 text-lg">{entry.text}</p>
                <p className="text-sm text-gray-400">
                  Detected Language:{" "}
                  <span className="font-mono text-purple-400">{getLanguageDisplayString(entry.detectedLanguage)}</span>
                </p>

                {canSummarize(entry) && !entry.summary && (
               <button
                    onClick={() => summarizeText(entry.text, index)}
                    className="bg-purple-600 hover:bg-purple-700 text-white mt-2 px-4 py-2 rounded-full transition-colors duration-300 transform hover:scale-105"
                    disabled={!isAIAvailable}
                  >
                    Summarize
                  </button>
                )}

                {entry.summary && (
                  <div className="mt-4 p-4 bg-purple-900 bg-opacity-50 rounded-lg border border-purple-500">
                    <p className="text-sm font-medium text-purple-300">Summary:</p>
                    <p className="text-sm text-gray-300">{entry.summary}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center space-x-4">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-gray-700 text-white border-2 border-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={!isAIAvailable}
                  >
                    <option value="en">English</option>
                    <option value="pt">Portuguese</option>
                    <option value="es">Spanish</option>
                    <option value="ru">Russian</option>
                    <option value="tr">Turkish</option>
                    <option value="fr">French</option>
                  </select>

                  <button

                    onClick={() => translateText(entry.text, index)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition-colors duration-300 transform hover:scale-105"
                    disabled={
                      !isAIAvailable ||
                      selectedLanguage === (entry.detectedLanguage?.detectedLanguage || entry.detectedLanguage)
                    }
                  >
                    Translate
                  </button>
                </div>

                {entry.translation && (
                  <div className="mt-4 p-4 bg-pink-900 bg-opacity-50 rounded-lg border border-pink-500">
                   
                   <p className="text-sm font-medium text-pink-300">Translation:</p>
                    <p className="text-sm text-gray-300">{entry.translation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-black bg-opacity-70 backdrop-blur-lg py-6 px-4">
        <div className="w-full max-w-3xl mx-auto flex space-x-4">
          <textarea
            className="flex-grow p-4 bg-gray-800 text-white border border-2 border-gray-700 rounded-lg shadow-inner focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="Text here"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isAIAvailable}
          ></textarea>
        <button
    onClick={handleSend}
    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg self-end font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={!inputText.trim() || !isAIAvailable}
  >
    <Image src={Gif} alt="Processing GIF" width={20} height={20} />
    <span>Process</span>
  </button>
        </div>
      </div>
    </div>
  )
}

export default TextProcessingAi;

