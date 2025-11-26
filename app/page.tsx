'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showGradient, setShowGradient] = useState(false)

  useEffect(() => {
    const animateWords = () => {
      const words = document.querySelectorAll('.word')
      words.forEach((word: Element) => {
        const delay = parseInt((word as HTMLElement).dataset.delay || '0')
        setTimeout(() => {
          ;(word as HTMLElement).style.animation = 'word-appear 0.8s ease-out forwards'
        }, delay)
      })
    }

    const timer = setTimeout(animateWords, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setShowGradient(true)
    }

    const handleMouseLeave = () => {
      setShowGradient(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Grid Background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Main grid lines */}
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />

        {/* Detail dots */}
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
      </svg>

      {/* Home Background Image */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img
          src="/home-background.png"
          alt="Home Background"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 object-cover opacity-30"
        />
      </div>

      {/* Floating Elements */}
      <div className="floating-element" style={{ top: '25%', left: '35%', animationDelay: '3s' }}></div>
      <div className="floating-element" style={{ top: '60%', left: '85%', animationDelay: '3.5s' }}></div>
      <div className="floating-element" style={{ top: '40%', left: '30%', animationDelay: '4s' }}></div>
      <div className="floating-element" style={{ top: '75%', left: '90%', animationDelay: '4.5s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-16 py-20">
        {/* Center Content */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-sm font-normal text-white/60 uppercase tracking-[0.3em] mb-4">
              <span className="word" data-delay="0">AegisCTF</span>
            </h2>
            <div className="w-16 h-px bg-white/30 mx-auto"></div>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold leading-tight tracking-tight mb-8">
            <div className="mb-4">
              <span className="word" data-delay="800">CTF</span>
            </div>
          </h1>
          
          <p className="text-xl leading-relaxed text-white/70 mb-12 max-w-2xl mx-auto">
            <span className="word" data-delay="1200">Test</span>
            <span className="word" data-delay="1350">your</span>
            <span className="word" data-delay="1500">hacking</span>
            <span className="word" data-delay="1650">skills</span>
            <span className="word" data-delay="1800">in</span>
            <span className="word" data-delay="1950">the</span>
            <span className="word" data-delay="2100">ultimate</span>
            <span className="word" data-delay="2250">real</span>
            <span className="word" data-delay="2320">world</span>
            <span className="word" data-delay="2400">hacking</span>
            <span className="word" data-delay="2470">challenge.</span>
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '4s' }}>
            <button className="px-8 py-4 bg-white text-black font-bold text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
              <Link href="/register" className="block w-full h-full">Register Now</Link>
            </button>
            <button className="px-8 py-4 border border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
              <Link href="/register?isLogin=true" className="block w-full h-full">Login</Link>
            </button>
          </div>
          
          <div className="mt-12 text-sm text-white/50 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '4.5s' }}>
            <p>SCROLL TO EXPLORE</p>
            <div className="w-px h-8 bg-white/30 mx-auto mt-4"></div>
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <div className="relative z-10 min-h-screen px-16 py-20">
        <div className="max-w-6xl mx-auto">

          {/* What is AegisCTF */}
          <div className="mb-20 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '5s' }}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-left">
                <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-white/90">
                  <span className="word" data-delay="0">What is AegisCTF?</span>
                </h3>
                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  <span className="word" data-delay="200">AegisCTF</span>
                  <span className="word" data-delay="350">is</span>
                  <span className="word" data-delay="500">an</span>
                  <span className="word" data-delay="650">elite</span>
                  <span className="word" data-delay="800">cybersecurity</span>
                  <span className="word" data-delay="950">competition</span>
                  <span className="word" data-delay="1100">that</span>
                  <span className="word" data-delay="1250">tests</span>
                  <span className="word" data-delay="1400">participants'</span>
                  <span className="word" data-delay="1550">abilities</span>
                  <span className="word" data-delay="1700">across</span>
                  <span className="word" data-delay="1850">multiple</span>
                  <span className="word" data-delay="2000">domains</span>
                  <span className="word" data-delay="2150">of</span>
                  <span className="word" data-delay="2300">information</span>
                  <span className="word" data-delay="2450">security.</span>
                </p>
              </div>
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <p className="text-white/60 text-lg font-semibold">Security Challenges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Format */}
          <div className="mb-20 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '5.5s' }}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="w-full h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-white/60 text-lg font-semibold">Competition Format</p>
                  </div>
                </div>
              </div>
              <div className="text-left order-1 lg:order-2">
                <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-white/90">
                  <span className="word" data-delay="0">Competition Format</span>
                </h3>
                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  <span className="word" data-delay="200">Individual</span>
                  <span className="word" data-delay="350">players</span>
                  <span className="word" data-delay="500">compete</span>
                  <span className="word" data-delay="650">solo</span>
                  <span className="word" data-delay="800">in</span>
                  <span className="word" data-delay="950">various</span>
                  <span className="word" data-delay="1100">categories</span>
                  <span className="word" data-delay="1250">including</span>
                  <span className="word" data-delay="1400">web</span>
                  <span className="word" data-delay="1550">security,</span>
                  <span className="word" data-delay="1700">cryptography,</span>
                  <span className="word" data-delay="1850">forensics,</span>
                  <span className="word" data-delay="2000">and</span>
                  <span className="word" data-delay="2150">reverse</span>
                  <span className="word" data-delay="2300">engineering.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Who Can Participate */}
          <div className="mb-20 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '6s' }}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-left">
                <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-white/90">
                  <span className="word" data-delay="0">Who Can Participate?</span>
                </h3>
                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  <span className="word" data-delay="200">Whether</span>
                  <span className="word" data-delay="350">you're</span>
                  <span className="word" data-delay="500">a</span>
                  <span className="word" data-delay="650">seasoned</span>
                  <span className="word" data-delay="800">cybersecurity</span>
                  <span className="word" data-delay="950">professional</span>
                  <span className="word" data-delay="1100">or</span>
                  <span className="word" data-delay="1250">an</span>
                  <span className="word" data-delay="1400">ambitious</span>
                  <span className="word" data-delay="1550">student,</span>
                  <span className="word" data-delay="1700">AegisCTF</span>
                  <span className="word" data-delay="1850">welcomes</span>
                  <span className="word" data-delay="2000">individual</span>
                  <span className="word" data-delay="2150">participants</span>
                  <span className="word" data-delay="2300">of</span>
                  <span className="word" data-delay="2450">all</span>
                  <span className="word" data-delay="2600">skill</span>
                  <span className="word" data-delay="2750">levels.</span>
                </p>
              </div>
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-white/60 text-lg font-semibold">Individual Competition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '6.5s' }}>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white/90 mb-4">Ready to Test Your Skills?</h2>
              <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                Test your individual cybersecurity skills in this solo CTF challenge
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <button className="px-10 py-5 bg-white text-black font-bold text-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
                <a href="/register" className="block w-full h-full">Register Now</a>
              </button>
              <button className="px-10 py-5 border-2 border-white text-white font-bold text-xl hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
                Learn More About CTF
              </button>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-white/50 opacity-0 animate-[word-appear_0.6s_ease-out_forwards]" style={{ animationDelay: '7s' }}>
            <p>AEGISCTF 2025 - WHERE LEGENDS ARE FORGED</p>
            <div className="w-px h-8 bg-white/30 mx-auto mt-4"></div>
          </div>
        </div>
      </div>

      {/* Interactive Gradient */}
      {showGradient && (
        <div
          className="fixed pointer-events-none w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl transition-all duration-500 ease-out opacity-100"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192
          }}
        />
      )}
    </div>
  )
}
