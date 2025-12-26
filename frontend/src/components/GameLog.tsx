import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export const GameLog = ({ gameState }: { gameState: any }) => {
    const [expanded, setExpanded] = useState(false);
    const logs = gameState.chat || [];
    const messagesToShow = expanded ? logs : logs.slice(-2);
    
    const logContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (expanded && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, expanded]);

    if (logs.length === 0) return null;

    return (
        <div 
          className={clsx(
              "fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs z-30 transition-all duration-300 border-t border-gray-700",
              expanded ? "h-64" : "h-12 cursor-pointer hover:bg-black/90"
          )}
          onClick={() => !expanded && setExpanded(true)}
        >
            <div className="relative h-full">
                {expanded && (
                    <button 
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                    >
                        ⬇️
                    </button>
                )}
                
                <div 
                  ref={logContainerRef}
                  className={clsx("p-2 overflow-y-auto h-full flex flex-col gap-1", !expanded && "justify-end")}
                >
                    {messagesToShow.map((msg: any) => (
                        <div key={msg.id} className="opacity-80 hover:opacity-100">
                            <span className="text-gray-500 font-mono">[{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>{' '}
                            <span className="text-blue-300">{msg.text.split(']')[0]}]</span>{' '}
                            <span>{msg.text.split(']').slice(1).join(']')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
