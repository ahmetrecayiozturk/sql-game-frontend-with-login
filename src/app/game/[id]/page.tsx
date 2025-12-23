"use client";
import { useState, MouseEvent, use } from "react";
import dynamic from "next/dynamic";
import { ResultViewer } from "../../../components/result-viewer";
import { QueryResultDto } from "./query-result.dto";
import { Notebook } from "../../../components/notebook";
import { TaskView } from "../../../components/task-view";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { TabProps, TabView } from "@/components/tab.view";
import { TaskDto } from "./task.dto";

const MonacoEditor = dynamic(
  () => import("../../../components/MonacoWrapper"),
  {
    ssr: false,
  }
);

type TabView = "tasks" | "notes";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [editorTabs, setEditorTabs] = useState<TabProps[]>([
    {
      id: "1",
      title: "Query 1",
      content: "SELECT * FROM citizens",
      result: null as any,
    },
  ]);
  const [activeEditorTabId, setActiveEditorTabId] = useState("1");

  const activeTabObj = editorTabs.find((t) => t.id === activeEditorTabId);
  const activeQuery = activeTabObj?.content || "";
  const activeResult = activeTabObj?.result || null;

  const [activeTab, setActiveTab] = useState<TabView>("tasks");

  const [tasks, setTasks] = useState<TaskDto[]>([]);

  const handleRun = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const data = await api.post<QueryResultDto>(`/game/${id}/query`, {
        query: activeQuery,
      });

      setEditorTabs((prev) =>
        prev.map((t) =>
          t.id === activeEditorTabId
            ? { ...t, content: activeQuery, result: data }
            : t
        )
      );
      fetchTasks();
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

    const fetchTasks = async () => {
      try {
        const tasks =await api.get<TaskDto[]>("/game/" + id + "/tasks");
        setTasks(tasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

  useState(() => {
    fetchTasks();
  });  


  return (
    <div className="flex flex-col h-screen relative bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-300 min-w-0">
          <div className="bg-gray-100 border-b border-gray-300 p-0 flex items-end justify-between h-10 px-2">
            <TabView
              tabs={editorTabs}
              activeTabId={activeEditorTabId}
              setActiveTabId={setActiveEditorTabId}
              setTabs={setEditorTabs}
            />
            <button
              onClick={handleRun}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded mb-1 flex items-center gap-2 transition-colors shadow-sm"
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
            <div className="flex-1 overflow-hidden relative">
              <ResultViewer result={activeResult} />
            </div>
          </div>
        </div>

        <div className="w-[450px] bg-black flex flex-col border-l border-gray-200 shadow-xl z-10">
          <div className="flex border-b border-gray-200 bg-black">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 py-3 text-sm text-white ${
                activeTab === "tasks" ? "bg-gray-700" : "bg-gray-800"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-3 text-sm text-white ${
                activeTab === "notes" ? "bg-gray-700" : "bg-gray-800"
              }`}
            >
              Notebook
            </button>
          </div>
          <div className="flex-1 p-2 overflow-hidden relative">
            {activeTab === "tasks" ? (
              <TaskView tasks={tasks} />
            ) : (
              <div className="h-full p-2 bg-gray-100">
                <Notebook />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
