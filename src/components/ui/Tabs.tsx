import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabProps {
  id: string;
  label: string;
  icon?: React.ElementType;
  children: ReactNode;
}

interface TabsProps {
  tabs: TabProps[];
  defaultTabId?: string;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultTabId, 
  className = '',
  variant = 'default',
  orientation = 'horizontal'
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || tabs[0]?.id || '');
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  // Set up refs array
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs.length]);
  
  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      const tabElement = tabRefs.current[activeIndex];
      if (tabElement) {
        setIndicatorWidth(tabElement.offsetWidth);
        setIndicatorOffset(tabElement.offsetLeft);
      }
    }
  }, [activeTabId, tabs]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (activeIndex !== -1 && tabRefs.current[activeIndex] && tabsContainerRef.current) {
      const tabElement = tabRefs.current[activeIndex];
      const container = tabsContainerRef.current;
      
      if (tabElement && container) {
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        if (tabRect.left < containerRect.left) {
          container.scrollLeft += tabRect.left - containerRect.left - 16;
        } else if (tabRect.right > containerRect.right) {
          container.scrollLeft += tabRect.right - containerRect.right + 16;
        }
      }
    }
  }, [activeTabId, tabs]);

  // Get tab button styles based on variant
  const getTabButtonStyles = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return `
          py-2.5 px-5 font-medium text-base focus:outline-none whitespace-nowrap relative
          transition-colors duration-200 ease-in-out rounded-full
          ${isActive 
            ? 'bg-yellow-400 text-black font-semibold shadow-sm' 
            : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
          }
        `;
      case 'underline':
        return `
          py-3 px-5 font-medium text-base focus:outline-none whitespace-nowrap relative
          transition-colors duration-200 ease-in-out border-b-2
          ${isActive 
            ? 'text-yellow-500 border-yellow-500 font-semibold' 
            : 'text-neutral-600 border-transparent hover:text-neutral-800 hover:border-neutral-300'
          }
        `;
      default: // default variant
        return `
          py-3.5 px-8 font-medium text-base focus:outline-none whitespace-nowrap relative
          transition-colors duration-200 ease-in-out
          ${isActive 
            ? 'text-black font-semibold' 
            : 'text-neutral-500 hover:text-neutral-800'
          }
        `;
    }
  };

  // Vertical orientation styles
  const verticalTabStyles = (isActive: boolean) => `
    py-3 px-4 font-medium text-base focus:outline-none whitespace-nowrap relative
    transition-colors duration-200 ease-in-out text-left
    ${isActive 
      ? 'bg-yellow-50 text-yellow-500 font-semibold border-l-4 border-yellow-500' 
      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 border-l-4 border-transparent'
    }
  `;

  return (
    <div className={`w-full ${className}`}>
      {orientation === 'horizontal' ? (
        <>
          <div className={`relative border-b border-neutral-200 bg-white rounded-t-xl ${variant === 'pills' ? 'px-2 py-2' : ''}`}>
            <div 
              ref={tabsContainerRef}
              className="flex overflow-x-auto scrollbar-hide py-1"
            >
              {tabs.map((tab, index) => {
                const isActive = activeTabId === tab.id;
                const Icon = tab.icon;
                
                return (
                  <motion.button
                    ref={el => {
                      tabRefs.current[index] = el;
                      return undefined;
                    }}
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={getTabButtonStyles(isActive)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center">
                      {Icon && (
                        <Icon 
                          className={`w-5 h-5 mr-2.5 ${isActive ? 'text-yellow-500' : 'text-neutral-400'}`}
                        />
                      )}
                      <span className="tracking-tight">{tab.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Animated indicator (only for default variant) */}
            {variant === 'default' && (
              <motion.div 
                className="absolute bottom-0 h-0.5 bg-yellow-500 rounded-full"
                initial={false}
                animate={{
                  width: `${indicatorWidth}px`,
                  x: indicatorOffset,
                  opacity: indicatorWidth ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </div>
          
          {/* Tab content with animation */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabs.find(tab => tab.id === activeTabId)?.children}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : (
        // Vertical orientation
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="flex flex-col">
              {tabs.map((tab, index) => {
                const isActive = activeTabId === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={verticalTabStyles(isActive)}
                  >
                    <div className="flex items-center">
                      {Icon && (
                        <Icon 
                          className={`w-5 h-5 mr-2.5 ${isActive ? 'text-yellow-500' : 'text-neutral-400'}`}
                        />
                      )}
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabs.find(tab => tab.id === activeTabId)?.children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabs;