'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            <span className="text-xl font-bold text-gray-900">CoachPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Головна', 'Курси', 'Контакти'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item === 'Головна' ? 'hero' : item === 'Курси' ? 'courses' : 'contact')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {item}
              </button>
            ))}
            <Button onClick={() => scrollToSection('contact')}>
              Записатися
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-gray-900"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {['Головна', 'Курси', 'Контакти'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item === 'Головна' ? 'hero' : item === 'Курси' ? 'courses' : 'contact')}
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium"
                >
                  {item}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection('contact')}
                className="w-full"
              >
                Записатися
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}