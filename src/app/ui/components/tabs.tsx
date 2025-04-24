'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TabItemProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const TabItem: React.FC<TabItemProps> = ({ title, icon, children }) => (
  <div data-title={title} data-icon={icon}>
    {children}
  </div>
);

interface GeneralTabsProps {
  children: React.ReactNode;
}

export const GeneralTabs: React.FC<GeneralTabsProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab'); // Get the 'tab' query parameter

  // Extract titles from children
  const tabs = React.Children.toArray(children) as React.ReactElement<TabItemProps>[];
  const titles = tabs.map((tab) => tab.props.title);
  const defaultTab = titles[0]; // Default to the first tab if no query parameter is present

  // Use queryTab or fallback to defaultTab as the active tab
  const [activeTab, setActiveTab] = useState(queryTab || defaultTab);

  useEffect(() => {
    // Whenever the search params change, update the active tab
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl); // Update activeTab based on URL
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabIndex: number, e: React.MouseEvent) => {
    
    e.preventDefault();
    
    const selectedTab = titles[tabIndex];
    if (!selectedTab) return;   

    // Update the URL with the new tab, keeping other query parameters intact
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('query'); // Remove unwanted parameters
    currentParams.delete('page');
    currentParams.set('tab', selectedTab);
    router.push(`${window.location.pathname}?${currentParams.toString()}`, {scroll: false});
  };

  return (
    <div className="flex w-full flex-col mt-6">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(e) => handleTabChange(index, e)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === tab.props.title
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            } flex items-center`}
          >
            {tab.props.icon && <span className="mr-2">{tab.props.icon}</span>}
            {tab.props.title}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs.map(
          (tab, index) =>
            activeTab === tab.props.title && (
              <div key={index} className="tab-content">
                {tab.props.children}
              </div>
            )
        )}
      </div>
    </div>
  );
};

