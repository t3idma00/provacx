import React from "react";
import type { ViewType, ToolType, ViewRibbonProps } from "../types";

// Ribbon tab configuration
interface RibbonItem {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
}

interface RibbonGroup {
  id: string;
  label: string;
  items: RibbonItem[];
}

interface RibbonTab {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

const ribbonTabs: RibbonTab[] = [
  {
    id: "home",
    label: "Home",
    groups: [
      {
        id: "clipboard",
        label: "Clipboard",
        items: [
          { id: "paste", label: "Paste", icon: "📋", shortcut: "Ctrl+V" },
          { id: "copy", label: "Copy", icon: "📄", shortcut: "Ctrl+C" },
          { id: "cut", label: "Cut", icon: "✂️", shortcut: "Ctrl+X" },
        ],
      },
      {
        id: "tools",
        label: "Tools",
        items: [
          { id: "select", label: "Select", icon: "⬆️", shortcut: "V" },
          { id: "pan", label: "Pan", icon: "✋", shortcut: "H" },
          { id: "zoom", label: "Zoom", icon: "🔍", shortcut: "Z" },
        ],
      },
    ],
  },
  {
    id: "views",
    label: "Views",
    groups: [
      {
        id: "projections",
        label: "Projections",
        items: [
          { id: "plan", label: "Plan View", icon: "📐", shortcut: "1" },
          { id: "section", label: "Section", icon: "📊", shortcut: "2" },
          { id: "end", label: "End Elevation", icon: "📏", shortcut: "3" },
          { id: "detail", label: "Detail View", icon: "🔎", shortcut: "4" },
        ],
      },
      {
        id: "section-tools",
        label: "Section Tools",
        items: [
          { id: "cut_line", label: "Cut Line", icon: "✂️" },
          { id: "detail_area", label: "Detail Area", icon: "⬜" },
        ],
      },
    ],
  },
  {
    id: "draw",
    label: "Draw",
    groups: [
      {
        id: "ducts",
        label: "Ductwork",
        items: [
          { id: "duct", label: "Duct", icon: "▬", shortcut: "D" },
        ],
      },
      {
        id: "fittings",
        label: "Fittings",
        items: [
          { id: "elbow", label: "Elbow", icon: "↱", shortcut: "E" },
          { id: "tee", label: "Tee", icon: "⊥", shortcut: "T" },
          { id: "reducer", label: "Reducer", icon: "◁", shortcut: "R" },
        ],
      },
      {
        id: "terminals",
        label: "Terminals",
        items: [
          { id: "diffuser", label: "Diffuser", icon: "◇" },
          { id: "grille", label: "Grille", icon: "☰" },
        ],
      },
      {
        id: "accessories",
        label: "Accessories",
        items: [
          { id: "damper", label: "Damper", icon: "⫿" },
          { id: "equipment", label: "Equipment", icon: "◻️" },
        ],
      },
    ],
  },
  {
    id: "annotate",
    label: "Annotate",
    groups: [
      {
        id: "dimensions",
        label: "Dimensions",
        items: [
          { id: "dimension", label: "Dimension", icon: "↔️" },
        ],
      },
      {
        id: "text",
        label: "Text",
        items: [
          { id: "text", label: "Text", icon: "T" },
        ],
      },
    ],
  },
];

export function ViewRibbon({
  activeView,
  onViewChange,
  activeTool,
  onToolChange,
}: ViewRibbonProps) {
  const [activeTab, setActiveTab] = React.useState("home");

  const handleItemClick = (itemId: string) => {
    // Check if it's a view
    if (["plan", "section", "end", "detail"].includes(itemId)) {
      onViewChange(itemId as ViewType);
    } else {
      // It's a tool
      onToolChange(itemId as ToolType);
    }
  };

  const currentTab = ribbonTabs.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col bg-gray-50 border-b border-gray-200">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        {ribbonTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="flex items-stretch h-24 px-2 bg-white">
        {currentTab?.groups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            <div className="flex flex-col py-1">
              {/* Group Items */}
              <div className="flex items-center gap-1 flex-1">
                {group.items.map((item) => {
                  const isActive =
                    item.id === activeTool ||
                    (["plan", "section", "end", "detail"].includes(item.id) &&
                      item.id === activeView);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded transition-colors min-w-[60px] ${
                        isActive
                          ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs mt-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Group Label */}
              <div className="text-xs text-gray-500 text-center mt-auto pt-1 border-t border-gray-100">
                {group.label}
              </div>
            </div>

            {/* Group Separator */}
            {groupIndex < currentTab.groups.length - 1 && (
              <div className="w-px bg-gray-200 mx-2 my-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* View Indicator Bar */}
      <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 text-xs text-gray-600">
        <span>Current View:</span>
        <span className="font-medium text-blue-600 capitalize">{activeView}</span>
        <span className="mx-2">|</span>
        <span>Active Tool:</span>
        <span className="font-medium text-gray-900 capitalize">{activeTool}</span>
      </div>
    </div>
  );
}

export default ViewRibbon;
