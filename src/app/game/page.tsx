"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GameDto } from "./game.dto";
import { api } from "@/lib/api";

export default function Page() {
  const [games, setGames] = useState<GameDto[] | { error: any }>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [drawerType, setDrawerType] = useState<null | "details" | "create">(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelGame, setPanelGame] = useState<GameDto | null>(null);
  const [newGameName, setNewGameName] = useState("");

  const fetchGameDetails = async (id: number) => {
    try {
      const data = await api.get<GameDto>(`/game/${id}`);

      setPanelGame(data);
      setDrawerType("details");
    } catch (err: any) {
      console.error("Error:", err.message);
      //toast.error(err.message)
    }
  };

  const initializeGame = async (id: number) => {
    try {
      await api.post(`/game/${id}/init`, {});
      await Promise.all([fetchGames(), fetchGameDetails(id)]);

      console.log("Game initialized successfully");
    } catch (err: any) {
      console.error("Failed to initialize game:", err.message);
    }
  };

  useEffect(() => {
    if (drawerType) {
      requestAnimationFrame(() => setDrawerOpen(true));
    } else {
      setDrawerOpen(false);
    }
  }, [drawerType]);

  const fetchGames = async () => {
    try {
      const data = await api.get<GameDto[]>("/game");
      setGames(data);
    } catch (err: any) {
      setGames({ error: err.message });
    }
  };

  const createGame = async (name: string) => {
    try {
      await api.post("/game", { name });

      await fetchGames();
      setDrawerOpen(false);
      setNewGameName("");
      setTimeout(() => setDrawerType(null), 300);
    } catch (err: any) {
      console.error("An error occurred while creating the game:", err.message);
    }
  };

  const deleteGame = async (id: number) => {
    try {
      await api.delete(`/game/${id}`);

      await fetchGames();
    } catch (err: any) {
      console.error("An error occurred while deleting the game:", err.message);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          </div>
          <button
            onClick={() => {
              setDrawerType("create");
              setPanelGame(null);
            }}
            className="px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            Create New Game
          </button>
        </div>

        {Array.isArray(games) ? (
          games.length === 0 ? (
            <h3 className="text-lg font-medium text-gray-900">
              No games found
            </h3>
          ) : (
            <div className="flex flex-col gap-3">
              {games.map((game) => (
                <div key={game.id} className="block group">
                  <button
                    type="button"
                    onClick={() => fetchGameDetails(game.id)}
                    className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-between"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {game.name}
                      </h2>
                      <span className="text-sm text-gray-500">
                        ID: {game.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative inline-block">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index === game.id ? null : game.id);
                          }}
                          className="px-2 text-black font-bold cursor-pointer"
                        >
                          :
                        </span>

                        {index === game.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10"
                          >
                            <button
                              onClick={() => deleteGame(game.id)}
                              className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {String((games as { error: any }).error)}
          </div>
        )}
      </div>
      {drawerType && (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              drawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setDrawerOpen(false);
              setTimeout(() => {
                setDrawerType(null);
                setPanelGame(null);
              }, 300);
            }}
          />
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 flex flex-col gap-4 overflow-y-auto
              transform transition-transform duration-300 ease-in-out
              ${drawerOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setDrawerOpen(false);
                setTimeout(() => {
                  setDrawerType(null);
                  setPanelGame(null);
                }, 300);
              }}
            >
              &times;
            </button>
            {drawerType === "details" && panelGame && (
              <>
                <h2 className="text-2xl text-black font-bold mb-2">
                  {panelGame.name}
                </h2>
                <div className="text-gray-600 mb-4">ID: {panelGame.id}</div>
                <div className="text-gray-600 mb-4">
                  Created At: {new Date(panelGame.createdAt).toString()}
                </div>
                <div className="text-gray-600 mb-4">
                  Initialized: {panelGame.isInitialized ? "Yes" : "No"}
                </div>
                {panelGame.isInitialized ? (
                  <Link
                    href={`/game/${panelGame.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Open Editor
                  </Link>
                ) : (
                  <button
                    onClick={() => initializeGame(panelGame.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Initialize Game
                  </button>
                )}
              </>
            )}
            {drawerType === "create" && (
              <>
                <h2 className="text-2xl text-black font-bold mb-4">
                  Create New Game
                </h2>
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-black text-lg"
                  placeholder="Game name"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  autoFocus
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded mt-2 disabled:opacity-50"
                  disabled={!newGameName.trim()}
                  onClick={() => createGame(newGameName)}
                >
                  Create
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
