import { useState } from 'react';
import React from 'react';
import AdminSidebar from '../AdminSidebar';

export default function Compare() {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const changeLog = [
    {
      id: 1,
      type: 'added',
      title: 'Layer 3 Added',
      description: 'New reinforcement wall added to Sector C specifications.',
      author: 'D. Doe',
      time: '10:30 AM',
      icon: 'plus'
    },
    {
      id: 2,
      type: 'modified',
      title: 'Dimension Update',
      description: 'Adjusted width of main corridor in Sector B from 2.5m to 2.8m.',
      author: 'A. Morgan',
      time: '10:35 AM',
      icon: 'pencil'
    },
    {
      id: 3,
      type: 'deleted',
      title: 'Removed Fixture',
      description: 'Removed obsolete lighting fixture from Layer 2 (Electrical).',
      author: 'D. Doe',
      time: '10:38 AM',
      icon: 'trash'
    },
    {
      id: 4,
      type: 'info',
      title: 'Metadata Updated',
      description: 'Status changed from \'Draft\' to \'In Review\'.',
      author: null,
      time: '10:40 AM',
      icon: 'info'
    }
  ];

  const timeline = [
    { version: 'V1.0', date: 'Mar 15', active: false },
    { version: 'V1.1', date: 'Mar 20', active: false },
    { version: 'V1.2', date: 'Mar 24', active: true },
    { version: 'V1.3', date: 'Today', active: false, current: true }
  ];

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-white">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#131521] border-b border-[#1f2335] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Compare Versions</h1>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm">foundation_plan_sector_c.dwg</span>
              <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-400 text-xs rounded">IN REVIEW</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1d2d] hover:bg-[#232638] rounded-lg text-sm transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              Approve Changes
            </button>
            <button className="relative p-2 hover:bg-[#1a1d2d] rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-[#1f2335]">
              <div className="text-right">
                <p className="text-sm font-medium">Alex Morgan</p>
                <p className="text-xs text-gray-500">Lead Geologist</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-medium">AM</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-14 bg-[#0f111a] border-b border-[#1f2335] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'side-by-side' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Side by Side
            </button>
            <button 
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overlay' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overlay
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#1a1d2d] rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#1a1d2d] rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-[#1a1d2d] rounded-lg transition-colors">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Deleted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Added
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Modified
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version Panels */}
          <div className="flex-1 flex">
            {/* Version 1.2 */}
            <div className="flex-1 border-r border-[#1f2335] flex flex-col">
              <div className="h-12 bg-[#131521] border-b border-[#1f2335] flex items-center px-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  <span className="font-medium">Version 1.2</span>
                  <span className="text-xs text-gray-500">Mar 24, 2023</span>
                </div>
              </div>
              <div className="flex-1 bg-[#0f111a] p-6 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[3/4] border-2 border-dashed border-gray-700 rounded-lg">
                  {/* Mock blueprint content */}
                  <div className="absolute inset-4 border border-gray-600">
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-gray-600">
                      <div className="bg-[#0f111a] p-2">
                        <span className="text-xs text-gray-500">Sector A</span>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-l border-gray-600">
                        <span className="text-xs text-gray-500"></span>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-t border-gray-600">
                        <span className="text-xs text-gray-500">Sector B</span>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-t border-l border-gray-600">
                        <span className="text-xs text-gray-500">Sector C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Version 1.3 */}
            <div className="flex-1 flex flex-col">
              <div className="h-12 bg-[#131521] border-b border-[#1f2335] flex items-center px-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="font-medium">Version 1.3</span>
                  <span className="text-xs text-gray-500">Today, 10:42 AM</span>
                  <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-400 text-xs rounded">Current</span>
                </div>
              </div>
              <div className="flex-1 bg-[#0f111a] p-6 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[3/4] border-2 border-dashed border-gray-700 rounded-lg">
                  {/* Mock blueprint content with changes */}
                  <div className="absolute inset-4 border border-gray-600">
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-gray-600">
                      <div className="bg-[#0f111a] p-2">
                        <span className="text-xs text-gray-500">Sector A</span>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-l border-gray-600 relative">
                        <div className="absolute top-2 right-2 w-px h-8 bg-green-500"></div>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-t border-gray-600">
                        <span className="text-xs text-gray-500">Sector B</span>
                      </div>
                      <div className="bg-[#0f111a] p-2 border-t border-l border-gray-600 relative">
                        <div className="absolute inset-2 border-2 border-dashed border-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-orange-500 font-medium">Sector C (New)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Log Panel */}
          <aside className="w-80 bg-[#131521] border-l border-[#1f2335] flex flex-col">
            <div className="p-4 border-b border-[#1f2335]">
              <h2 className="text-lg font-semibold mb-1">Change Log</h2>
              <p className="text-sm text-gray-500">5 modifications detected</p>
            </div>

            <div className="p-4 border-b border-[#1f2335]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter changes..."
                  className="w-full bg-[#1a1d2d] border border-[#2a2d3d] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {changeLog.map((change) => (
                <div key={change.id} className="bg-[#1a1d2d] rounded-lg p-3 hover:bg-[#232638] transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      change.type === 'added' ? 'bg-green-900/30 text-green-500' :
                      change.type === 'modified' ? 'bg-orange-900/30 text-orange-500' :
                      change.type === 'deleted' ? 'bg-red-900/30 text-red-500' :
                      'bg-gray-900/30 text-gray-500'
                    }`}>
                      {change.icon === 'plus' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                      {change.icon === 'pencil' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
                      {change.icon === 'trash' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {change.icon === 'info' && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium truncate">{change.title}</h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">{change.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{change.description}</p>
                      {change.author && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            change.author === 'D. Doe' ? 'bg-purple-900/50 text-purple-400' :
                            'bg-blue-900/50 text-blue-400'
                          }`}>
                            {change.author.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-500">{change.author}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1f2335]">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1d2d] hover:bg-[#232638] border border-[#2a2d3d] rounded-lg text-sm transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Diff Report (PDF)
              </button>
            </div>
          </aside>
        </div>

        {/* Timeline */}
        <div className="h-20 bg-[#131521] border-t border-[#1f2335] px-6">
          <div className="h-full flex items-center">
            <div className="flex-shrink-0 w-32 pr-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Timeline</span>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#2a2d3d]"></div>
              <div className="relative flex justify-between">
                {timeline.map((item, index) => (
                  <div key={item.version} className="flex flex-col items-center">
                    <button 
                      className={`relative z-10 w-3 h-3 rounded-full transition-colors ${
                        item.active ? 'bg-white ring-4 ring-indigo-500/30' :
                        item.current ? 'bg-indigo-500' :
                        'bg-[#2a2d3d] hover:bg-gray-500'
                      }`}
                    />
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${item.active ? 'text-white' : 'text-gray-500'}`}>
                        {item.version}
                      </p>
                      <p className="text-xs text-gray-600">{item.date}</p>
                    </div>
                    {index < timeline.length - 1 && (
                      <div className={`absolute top-1/2 left-0 right-0 h-px ${
                        item.active ? 'bg-indigo-500' : 'bg-[#2a2d3d]'
                      }`} style={{ width: `${100 / (timeline.length - 1)}%`, left: `${index * (100 / (timeline.length - 1))}%` }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 w-32 pl-4 flex justify-end">
              <button className="p-2 hover:bg-[#1a1d2d] rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
