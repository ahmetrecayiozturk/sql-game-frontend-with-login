import { useState } from "react";
import { X } from "lucide-react";
import { QueryResultDto } from "@/app/game/[id]/query-result.dto";

export interface TabProps {
  id: string;
  title: string;
  content?: string;
  result: QueryResultDto | { error: string }| null;
  isT?: boolean;
}

interface TabViewProps {
  activeTabId: string;
  tabs: TabProps[];
  setActiveTabId: (id: string) => void;
  setTabs: (tabs: TabProps[]) => void;
  isPlusButtonVisible?: boolean;
}

export function TabView({
  tabs,
  setActiveTabId,
  setTabs,
  activeTabId,
  isPlusButtonVisible = true,
}: TabViewProps) {
  const handleCloseTab = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);

    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleNewTab = () => {
    const newTab: TabProps = {
      id: `tab-${Date.now()}`,
      title: `Tab ${tabs.length + 1}`,
      content: "",
      result: null as any,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };
  return (
    <div className="flex items-center gap-1 h-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTabId(tab.id)}
          className={`px-2 h-8 text-xs font-medium rounded-t-md border-t border-l border-r flex items-center gap-2 transition-all group ${
            activeTabId === tab.id
              ? "bg-white border-gray-300 text-blue-600 relative top-px z-5"
              : "bg-gray-200 border-transparent text-gray-500 hover:bg-gray-300 mt-1"
          }`}
        >
          <span>{tab.title}</span>
          {activeTabId === tab.id && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 rounded-full hover:bg-gray-100 hover:text-red-500 transition-all cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
        </button>
      ))}
      {isPlusButtonVisible && (
      <button
        onClick={handleNewTab}
        className="ml-1 p-1 text-gray-500 hover:text-blue-600 font-bold"
        title="New Tab"
      >
        +
      </button>
      )}
    </div>
  );
}
