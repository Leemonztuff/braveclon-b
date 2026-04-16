'use client';

import { PlayerState } from '@/lib/gameState';

interface BattleScreenProps {
  state: PlayerState;
  stageId: number;
  onEnd: (victory: boolean) => void;
}

export default function BattleScreen({ state, stageId, onEnd }: BattleScreenProps) {
  return (
    <div className="w-full h-screen flex flex-col justify-between bg-black text-white">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900">
        <div className="flex gap-4">
          <span>Gold</span>
          <span>Gems</span>
        </div>
        <button className="bg-gray-700 px-3 py-1 rounded">MENU</button>
      </div>

      <div className="flex justify-center items-center h-1/3 border-b border-gray-700">
        <div className="flex gap-6">
          <div className="w-16 h-16 bg-gray-700 rounded"></div>
          <div className="w-16 h-16 bg-gray-700 rounded"></div>
          <div className="w-16 h-16 bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="relative flex-1">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          BATTLEFIELD
        </div>
      </div>

      <div className="bg-gray-900 p-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-2 bg-green-500 mb-1"></div>
                <div className="h-2 bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black px-4 py-2">
        <div className="h-3 bg-red-600 rounded"></div>
      </div>

      <div className="bg-gray-900 p-2">
        <div className="flex justify-between">
          <div className="w-12 h-12 bg-gray-700 rounded"></div>
          <div className="w-12 h-12 bg-gray-700 rounded"></div>
          <div className="w-12 h-12 bg-gray-700 rounded"></div>
          <div className="w-12 h-12 bg-gray-700 rounded"></div>
          <div className="w-12 h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}