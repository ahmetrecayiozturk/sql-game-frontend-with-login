import React, { useState, useEffect } from "react";

export function Notebook() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem("notes", newNotes);
  };

  return (
    <div className="flex flex-col h-full bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-inner overflow-hidden">
      <div className="bg-yellow-100 px-4 py-2 border-b border-yellow-200 flex justify-between items-center">
        <span className="text-[15px] text-yellow-700 opacity-70">Notes</span>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          className="w-full h-full bg-yellow-50 p-4 resize-none focus:outline-none text-gray-800 text-sm leading-relaxed"
          placeholder="Take notes here..."
          value={notes}
          onChange={handleNoteChange}
          style={{ 
            fontFamily: '"Courier New", Courier, monospace',
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '100% 24px',
            lineHeight: '24px',
            paddingTop: '0px'
          }}
        ></textarea>
      </div>
    </div>
  );
}
