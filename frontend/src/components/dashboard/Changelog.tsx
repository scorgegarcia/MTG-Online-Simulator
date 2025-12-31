import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScrollText, ChevronDown, X } from 'lucide-react';
import changelogContent from '../../assets/changelog.md?raw';

export default function Changelog() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  let imageIndex = 0;

  return (
    <div className="w-full mt-12 transition-all duration-500 ease-in-out">
      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}

      <div className={`group relative bg-slate-900/40 border ${isExpanded ? 'border-amber-500/40' : 'border-slate-800 hover:border-slate-700'} rounded-xl transition-all duration-300`}>
        
        {/* Header / Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${isExpanded ? 'bg-amber-950/30 border-amber-500/30 text-amber-500' : 'bg-slate-950 border-slate-700 text-slate-500'}`}>
              <ScrollText size={18} />
            </div>
            <div className="text-left">
              <h2 className={`text-sm font-serif font-bold transition-colors ${isExpanded ? 'text-slate-100' : 'text-slate-400'}`}>Chronicles of the Realm</h2>
              {!isExpanded && <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">Click to expand changelog</p>}
            </div>
          </div>
          
          <div className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </div>
        </button>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 pt-0">
            {/* Scroll Content Container */}
            <div className="relative bg-[#1a1612] rounded-lg border border-[#3d2b1f] overflow-hidden shadow-inner max-h-[400px] flex flex-col">
              {/* Scroll Background Texture */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] pointer-events-none"></div>
              
              {/* Top Scroll Roll */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#3d2b1f] to-transparent z-10 opacity-50"></div>
              
              {/* Content Area */}
              <div className="overflow-y-auto p-6 custom-scrollbar relative z-0">
                <div className="prose prose-invert prose-sm max-w-none 
                  prose-headings:font-serif prose-headings:text-amber-200 prose-headings:border-b prose-headings:border-amber-900/50 prose-headings:pb-1 prose-headings:mb-4
                  prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                  prose-p:text-slate-300 prose-p:leading-relaxed
                  prose-li:text-slate-400 prose-strong:text-amber-500
                  prose-ul:list-disc prose-ul:pl-4
                ">
                  <ReactMarkdown
                    components={{
                      img: ({ ...props }) => {
                        const currentIndex = imageIndex;
                        imageIndex += 1;

                        const isCover = currentIndex === 0;

                        if (isCover) {
                          return (
                            <div className="my-4 -mx-6">
                              <img
                                {...props}
                                draggable={false}
                                className="w-full h-auto rounded-lg border border-amber-900/40 shadow-xl"
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="my-4">
                            <img
                              {...props}
                              draggable={false}
                              className="w-48 h-auto rounded-lg border-2 border-amber-900/50 cursor-zoom-in hover:border-amber-500/50 transition-all shadow-lg hover:scale-[1.02]"
                              onClick={() => setZoomedImage(props.src || null)}
                            />
                            {props.alt && <p className="text-[10px] text-slate-500 mt-1 italic">{props.alt}</p>}
                          </div>
                        );
                      },
                    }}
                  >
                    {changelogContent}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Bottom Scroll Roll */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#3d2b1f] to-transparent z-10 opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Decorative corner accents (only visible when expanded) */}
        {isExpanded && (
          <>
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-amber-900/20 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-amber-900/20 rounded-bl-lg pointer-events-none"></div>
          </>
        )}
      </div>
    </div>
  );
}
