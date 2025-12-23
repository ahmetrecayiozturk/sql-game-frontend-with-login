"use client";

import { TableDto } from "@/app/creator/table.dto";
import { 
  ChevronDown, 
  ChevronRight, 
  Table, 
  Play, 
  LayoutList,
  Database
} from "lucide-react";

interface TableGroupProps {
  title: string;
  tables: TableDto[] | null;
  expandedTables: Set<string>;
  toggleTable: (name: string) => void;
  isT: boolean;
  handleTableClick: (tableName: string, isT: boolean) => void;
}

export const TableGroup = ({
  title,
  tables,
  expandedTables,
  toggleTable,
  handleTableClick,
  isT,
}: TableGroupProps) => {
  if (!tables || tables.length === 0) return null;

  return (
    <div className="flex flex-col mb-2">
      <div className="px-3 py-2 font-bold text-gray-500 flex items-center bg-gray-100/50 border-y border-gray-200">
        <Database size={12} className="mr-2" />
        <span className="uppercase text-[10px] tracking-widest">
          {title}
        </span>
      </div>

      <div className="flex flex-col">
        {tables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          return (
            <div key={table.name} className="flex flex-col">
              <div
                onClick={() => toggleTable(table.name)}
                className={`
                  flex items-center px-3 py-2 cursor-pointer 
                  hover:bg-gray-200 text-gray-700 transition-all group
                  ${isExpanded ? "bg-gray-200/50 text-blue-700" : ""}
                `}
              >
                <span className="text-gray-400 mr-2">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                
                <Table size={16} className={isExpanded ? "text-blue-600" : "text-gray-500"} />
                
                <span className={`ml-2 truncate text-sm ${isExpanded ? "font-semibold" : "font-medium"}`}>
                  {table.name}
                </span>

                <div className="flex-1" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTableClick(table.name, isT);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 transition-all"
                  title="Open in Editor"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>

              {isExpanded && (
                <div className="flex flex-col border-l border-gray-300 ml-5 mb-1 bg-white/30">
                  {table.columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center pl-6 pr-2 py-1.5 cursor-pointer hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-colors"
                    >
                      <LayoutList size={12} className="mr-2 opacity-70" />
                      <span className="text-[13px] font-mono">{col}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};