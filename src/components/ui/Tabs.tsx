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
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, className = '' }) => {
  const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || tabs[0]?.id || '');
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
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

  return (
    <div className={`w-full ${className}`}>
      <div className="relative border-b border-neutral-200 bg-white rounded-t-xl">
        <div className="flex overflow-x-auto scrollbar-hide py-1">
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
                className={`
                  py-3.5 px-8 font-medium text-base focus:outline-none whitespace-nowrap relative
                  transition-colors duration-200 ease-in-out
                  ${isActive 
                    ? 'text-black font-semibold' 
                    : 'text-neutral-500 hover:text-neutral-800'
                  }
                `}
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
        
        {/* Animated indicator */}
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
    </div>
  );
};

export default Tabs;
