import React from 'react';
import { 
  User, 
  Globe, 
  Trophy, 
  MapPin, 
  GraduationCap, 
  Film, 
  TrendingUp,
  X,
  Newspaper
} from 'lucide-react';
import { NewsSection } from '../types';
import {Logo} from "./Logo.tsx";

interface SidebarProps {
  activeSection: NewsSection;
  onSectionChange: (section: NewsSection) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const sections = [
  { id: 'for-you' as NewsSection, label: 'For You', icon: User },
  { id: 'world' as NewsSection, label: 'World News', icon: Globe },
  { id: 'sports' as NewsSection, label: 'Sports News', icon: Trophy },
  { id: 'india' as NewsSection, label: 'India News', icon: MapPin },
  { id: 'education' as NewsSection, label: 'Education News', icon: GraduationCap },
  { id: 'entertainment' as NewsSection, label: 'Entertainment News', icon: Film },
  { id: 'trending' as NewsSection, label: 'Trending News', icon: TrendingUp },
];

export function Sidebar({ activeSection, onSectionChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:fixed inset-y-0 left-0 z-50
        w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-lg lg:shadow-none
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
           <Logo size='xl'/>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Newsly
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stay informed</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                  transition-colors duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">{section.label}</span>
                  {isActive && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Currently viewing
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Stay Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Discover the world's most important stories, curated just for you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}