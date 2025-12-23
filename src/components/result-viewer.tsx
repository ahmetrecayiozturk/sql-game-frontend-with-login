import React, { useMemo, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, CellValueChangedEvent, SelectionChangedEvent } from "ag-grid-community";
import { QueryResultDto } from "../app/game/[id]/query-result.dto";

ModuleRegistry.registerModules([AllCommunityModule]);

interface ResultViewerProps {
  result: QueryResultDto | { error: string } | null;
  addNewEnabled?: boolean;
  isError?: boolean;
  allowEmpty?: boolean;
  onNewRowChange?: (data: Record<string, any>) => void;
  onRowUpdateChange?: (data: Record<string, any>) => void;
  onSelectionChange?: (selectedRow: any) => void;
}

export function ResultViewer({ 
  result, 
  addNewEnabled, 
  isError, 
  allowEmpty = false,
  onNewRowChange, 
  onRowUpdateChange, 
  onSelectionChange 
}: ResultViewerProps) {
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!addNewEnabled) {
      setNewRowData({});
    }
  }, [addNewEnabled]);

  const rowData = useMemo(() => {
    if (!result || "error" in result || !result.rows || !result.columns) return [];
    return result.rows.map((row) => {
      const rowObj: any = {};
      result.columns!.forEach((col, index) => {
        rowObj[col] = row[index];
      });
      return rowObj;
    });
  }, [result]);

  const pinnedTopRowData = useMemo(() => {
    return addNewEnabled ? [newRowData] : [];
  }, [addNewEnabled, newRowData]);

  const columnDefs = useMemo<ColDef[]>(() => {
    if (!result || "error" in result || !result.columns) return [];
    return result.columns.map((col) => ({
      field: col,
      editable: true,
      filter: true,
      sortable: true,
      resizable: true,
      cellStyle: (params) => {
        if (params.node.isRowPinned() && isError && (!params.value || params.value.toString().trim() === "")) {
          return { backgroundColor: "#fee2e2", border: "1px solid #ef4444" };
        }
        return null;
      }
    }));
  }, [result, isError]);

  const handleCellValueChanged = (event: CellValueChangedEvent) => {
    if (event.node.isRowPinned()) {
      const updated = { ...newRowData, [event.column.getColId()]: event.newValue };
      setNewRowData(updated);
      onNewRowChange?.(updated);
    } else {
      onRowUpdateChange?.(event.data);
    }
  };

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    onSelectionChange?.(selectedRows.length > 0 ? selectedRows[0] : null);
  };

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Run a query to see results
      </div>
    );
  }

  if ("error" in result) {
    return (
      <div className="h-full p-4 bg-red-50 border border-red-200 rounded overflow-auto">
        <h3 className="text-red-700 font-bold mb-2 text-xs uppercase">Error Executing Query</h3>
        <pre className="text-red-600 text-sm whitespace-pre-wrap font-mono">
          {result.error}
        </pre>
      </div>
    );
  }

  const isResultEmpty = !result.rows || result.rows.length === 0;
  if (isResultEmpty && !allowEmpty && !addNewEnabled) {
    return (
      <div className="p-4 text-sm text-gray-600 font-mono">
        {result.message || "Query executed successfully. No rows returned."}
        {result.executionTime ? ` (${result.executionTime}ms)` : ""}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 w-full ag-theme-alpine">
        <AgGridReact
          key={result.columns?.join("-") + (addNewEnabled ? "-add" : "-view")}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ flex: 1, minWidth: 100 }}
          pinnedTopRowData={pinnedTopRowData}
          rowSelection="single"
          onSelectionChanged={handleSelectionChanged}
          onCellValueChanged={handleCellValueChanged}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
        />
      </div>
<div className="text-xs text-gray-400 p-1 text-right">
        {result.rows?.length} rows in {result.executionTime}ms
      </div>
    </div>
  );
}