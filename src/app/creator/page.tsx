"use client";

import { useEffect, useState } from "react";
import { TableDto } from "./table.dto";
import { api } from "@/lib/api";
import { Plus, LayoutGrid, Database } from "lucide-react";
import { TableGroup } from "@/components/table.group";
import CreateAssetModal from "@/components/modals/CreateAssetModal";
import { ResultViewer } from "@/components/result-viewer";
import { TabProps, TabView } from "@/components/tab.view";
import { QueryResultDto } from "../game/[id]/query-result.dto";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("../../components/MonacoWrapper"), {
  ssr: false,
});

export default function Page() {
  const [templateTables, setTemplateTables] = useState<TableDto[] | null>(null);
  const [managementTables, setManagementTables] = useState<TableDto[] | null>(
    null
  );
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editorTabs, setEditorTabs] = useState<TabProps[]>([
    {
      id: "1",
      title: "Query 1",
      content: "SELECT * FROM citizens",
      result: null,
    },
  ]);
  const [activeEditorTabId, setActiveEditorTabId] = useState("1");

  const [tableTabs, setTableTabs] = useState<TabProps[]>([]);
  const [activeTableTabId, setActiveTableTabId] = useState<string | null>(null);

  const activeTabObj = editorTabs.find((t) => t.id === activeEditorTabId);
  const activeQuery = activeTabObj?.content || "";
  const activeResult = activeTabObj?.result || null;

  const activeTableTabObj = tableTabs.find((t) => t.id === activeTableTabId);
  const activeTableResult = activeTableTabObj?.result || null;
  const activeTableIsT = activeTableTabObj?.isT;

  const [editMode, setEditMode] = useState<"add" | "update" | null>(null);
  const [pendingData, setPendingData] = useState<any>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleRun = async () => {
    try {
      const data = await api.post<QueryResultDto>(`/creator/template`, {
        query: activeQuery,
      });
      setEditorTabs((prev) =>
        prev.map((t) =>
          t.id === activeEditorTabId ? { ...t, result: data } : t
        )
      );
    } catch (err) {
      setEditorTabs((prev) =>
        prev.map((t) =>
          t.id === activeEditorTabId
            ? { ...t, result: { error: "An unexpected error occurred." } }
            : t
        )
      );
    }
  };

  const fetchTables = async () => {
    try {
      const [sandboxData, managementData] = await Promise.all([
        api.get<TableDto[]>("/creator/t/tables"),
        api.get<TableDto[]>("/creator/m/tables"),
      ]);
      setTemplateTables(sandboxData);
      setManagementTables(managementData);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSave = async () => {
    if (!activeTableTabId || !pendingData || !editMode) return;

    const type = activeTableIsT ? 't' : 'm';
    const tableName = activeTableTabId;

    try {
      if (editMode === 'add') {
        await api.post(`/creator/table/${type}/${tableName}/row`, { data: pendingData });
      } else if (editMode === 'update') {
        await api.put(`/creator/table/${type}/${tableName}/row`, { data: pendingData });
      }
      await fetchTable(tableName, activeTableIsT!);
      setEditMode(null);
      setPendingData(null);
      setSelectedRow(null);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || !activeTableTabId) return;

    const type = activeTableIsT ? 't' : 'm';
    const tableName = activeTableTabId;

    try {
      await api.delete(`/creator/table/${type}/${tableName}/row`, { id: selectedRow.id });
      await fetchTable(tableName, activeTableIsT!);
      setSelectedRow(null);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    newExpanded.has(tableName)
      ? newExpanded.delete(tableName)
      : newExpanded.add(tableName);
    setExpandedTables(newExpanded);
  };

  const fetchTable = async (tableName: string, isT: boolean) => {
    try {
      const data = await api.get<QueryResultDto>(
        `/creator/table/${isT ? "t" : "m"}/${tableName}`
      );

      const existingTabIndex = tableTabs.findIndex((t) => t.id === tableName);
      if (existingTabIndex !== -1) {
        setTableTabs((prev) =>
          prev.map((t, i) =>
            i === existingTabIndex ? { ...t, result: data } : t
          )
        );
      } else {
        const newTab: TabProps = {
          id: tableName,
          title: tableName,
          result: data,
          isT: isT,
        };
        setTableTabs((prev) => [...prev, newTab]);
      }
      setActiveTableTabId(tableName);
    } catch (err) {
      console.error(`Error fetching table ${tableName}:`, err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-sm overflow-hidden relative">
      <div className="w-[300px] bg-[#F3F4F6] flex flex-col border-r border-gray-300 select-none">
        <div className="p-4 text-xs font-bold text-gray-500 tracking-wider flex justify-between items-center border-b border-gray-200 bg-white">
          <span>EXPLORER</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-blue-600 transition-all border border-transparent hover:border-gray-200"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <TableGroup
            title="Management Tables"
            tables={managementTables}
            expandedTables={expandedTables}
            toggleTable={toggleTable}
            handleTableClick={(name) => fetchTable(name, false)}
            isT={false}
          />

          <TableGroup
            title="Template Tables"
            tables={templateTables}
            expandedTables={expandedTables}
            toggleTable={toggleTable}
            handleTableClick={(name) => fetchTable(name, true)}
            isT={true}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col border-r border-gray-300 min-w-0">
        <div className="bg-gray-100 border-b border-gray-300 flex items-end justify-between h-10 px-2">
          <TabView
            tabs={editorTabs}
            activeTabId={activeEditorTabId}
            setActiveTabId={setActiveEditorTabId}
            setTabs={setEditorTabs}
          />
          <button
            onClick={handleRun}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded mb-1 flex items-center gap-2 transition-colors shadow-sm active:scale-95"
          >
            <span>▶</span> Run
          </button>
        </div>
        <div className="flex-1 relative">
          <MonacoEditor
            query={activeQuery}
            onChange={(val) => {
              setEditorTabs((prev) =>
                prev.map((t) =>
                  t.id === activeEditorTabId ? { ...t, content: val } : t
                )
              );
            }}
          />
        </div>
        <div className="h-1/2 border-t border-gray-300 bg-black flex flex-col">
          <ResultViewer result={activeResult} />
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col min-w-0">
        {tableTabs.length > 0 ? (
          <>
            <div className="bg-gray-100 border-b border-gray-300 flex items-end justify-between h-10 px-2">
              <TabView
                tabs={tableTabs}
                activeTabId={activeTableTabId!}
                setActiveTabId={setActiveTableTabId}
                setTabs={setTableTabs}
                isPlusButtonVisible={false}
              />
              <div className="gap-2 flex">
                <button
                  disabled={
                    !editMode ||
                    !pendingData ||
                    Object.keys(pendingData).length === 0
                  }
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded mb-1 flex items-center gap-2 transition-colors shadow-sm active:scale-95 disabled:opacity-30"
                >
                  SAVE
                </button>

                <button
                  onClick={() => {
                    setEditMode("add");
                    setPendingData(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded mb-1 flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                >
                  + ADD
                </button>
                <button
                  disabled={!selectedRow}
                  onClick={handleDelete}
                  className="bg-white border border-gray-300 text-gray-600 text-xs font-bold py-1 px-3 rounded mb-1 flex items-center gap-2 transition-colors shadow-sm active:scale-95 disabled:opacity-30"
                >
                  DELETE
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative bg-white">
              <ResultViewer
                result={activeTableResult}
                allowEmpty={true}
                addNewEnabled={editMode === "add"}
                onNewRowChange={(data) => {
                  setPendingData(data);
                }}
                onRowUpdateChange={(data) => {
                  setPendingData(data);
                  setEditMode("update");
                }}
                onSelectionChange={(row) => setSelectedRow(row)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center max-w-sm px-6">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Database size={40} className="text-gray-200" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Table Area
              </h2>
              <p className="text-sm leading-relaxed">
                Select a table from the explorer to start editing.
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTables}
      />
    </div>
  );
}