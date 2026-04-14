import { AlertCircle } from 'lucide-react';

export function AlertModal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Notice</h2>
        <p className="text-zinc-300 font-medium mb-6">{message}</p>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold tracking-wider transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
