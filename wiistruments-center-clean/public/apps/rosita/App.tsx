import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { RotateCcw, Package, Search, ChevronDown } from 'lucide-react';

interface WiiApp {
  id: string;
  name: string;
  description: string;
  version?: string;
  isInstalled: boolean;
  isActivated: boolean;
  hasUpdate: boolean;
  productCount?: number;
  thumbnail: string;
  color: string;
  category: string;
  githubRepo?: string;
  localPath?: string;
  lastModified?: string;
  autoSaveEnabled?: boolean;
}

// Apps will be loaded dynamically from apps.json

function App() {
  const [apps, setApps] = useState<WiiApp[]>([]);
  const [currentView, setCurrentView] = useState<'myapps' | 'updates' | 'applibrary'>('myapps');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [devMode, setDevMode] = useState<boolean>(true);
  const [_selectedApp, setSelectedApp] = useState<WiiApp | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [devLogs, setDevLogs] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<{[key: string]: string}>({});
  const [fileWatcherActive, setFileWatcherActive] = useState(false);
  const [currentApp, setCurrentApp] = useState<WiiApp | null>(null);
  const [showStudio, setShowStudio] = useState(false);

  useEffect(() => {
    loadAppLibrary();
    initializeApp();
    setupEventListeners();
  }, []);

  const loadAppLibrary = async () => {
    try {
      addDevLog('📦 Loading app library from apps.json...');
      const response = await fetch('/apps.json');
      const data = await response.json();
      setApps(data.apps);
      addDevLog(`✅ Loaded ${data.apps.length} apps from library`);
    } catch (error) {
      addDevLog(`❌ Failed to load app library: ${error}`);
      // Fallback to empty array if loading fails
      setApps([]);
    }
  };

  const initializeApp = async () => {
    try {
      addDevLog('🚀 Initializing Wiistruments Center...');
      
      // Initialize GitHub
      const gitResult = await invoke('init_github');
      setGithubConnected(gitResult as boolean);
      addDevLog(gitResult ? '✅ GitHub connected' : '❌ GitHub connection failed');

      // Start file watchers
      await invoke('start_file_watchers');
      setFileWatcherActive(true);
      addDevLog('👁️ File watchers started');

      // Initialize auto-save
      await invoke('init_auto_save');
      addDevLog('💾 Auto-save system initialized');

      addDevLog('🎵 Wiistruments Center ready!');
    } catch (error) {
      addDevLog(`❌ Initialization error: ${error}`);
    }
  };

  const setupEventListeners = async () => {
    // File change events
    await listen('file-changed', (event) => {
      const { app_id, file_path } = event.payload as { app_id: string, file_path: string };
      addDevLog(`📁 File changed: ${app_id}/${file_path}`);
      markAppForUpdate(app_id);
      triggerAutoSave(app_id);
    });

    // Auto-save events
    await listen('auto-save-complete', (event) => {
      const { app_id, commit_hash } = event.payload as { app_id: string, commit_hash: string };
      addDevLog(`💾 Auto-saved ${app_id}: ${commit_hash.substring(0, 7)}`);
      setAutoSaveStatus(prev => ({ ...prev, [app_id]: 'saved' }));
    });

    // GitHub sync events
    await listen('github-sync-complete', (event) => {
      const { app_id, success } = event.payload as { app_id: string, success: boolean };
      if (success) {
        addDevLog(`☁️ ${app_id} synced to GitHub`);
        setApps(prev => prev.map(app => 
          app.id === app_id ? { ...app, hasUpdate: false } : app
        ));
      } else {
        addDevLog(`❌ GitHub sync failed for ${app_id}`);
      }
    });

    // GitHub release check events
    await listen('github-release-found', (event) => {
      const { repo, version, app_id } = event.payload as { repo: string, version: string, app_id: string };
      addDevLog(`📦 New release found: ${repo} v${version}`);
      setApps(prev => prev.map(app => 
        app.id === app_id ? { ...app, hasUpdate: true, version } : app
      ));
    });
  };

  const addDevLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDevLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 29)]);
  };

  const markAppForUpdate = (appId: string) => {
    setApps(prev => prev.map(app => 
      app.id === appId ? { 
        ...app, 
        hasUpdate: true, 
        lastModified: new Date().toISOString() 
      } : app
    ));
    setAutoSaveStatus(prev => ({ ...prev, [appId]: 'modified' }));
  };

  const triggerAutoSave = async (appId: string) => {
    try {
      setAutoSaveStatus(prev => ({ ...prev, [appId]: 'saving' }));
      await invoke('auto_save_app', { appId });
    } catch (error) {
      addDevLog(`❌ Auto-save failed for ${appId}: ${error}`);
      setAutoSaveStatus(prev => ({ ...prev, [appId]: 'error' }));
    }
  };

  const launchApp = async (app: WiiApp) => {
    try {
      addDevLog(`🚀 Loading ${app.name} in main window...`);
      setCurrentApp(app);
      addDevLog(`✅ ${app.name} loaded successfully`);
    } catch (error) {
      addDevLog(`❌ Launch failed: ${error}`);
    }
  };

  const closeApp = () => {
    setCurrentApp(null);
    setShowStudio(false);
    addDevLog(`📱 Returned to Wiistruments Center`);
  };

  const openStudio = () => {
    setShowStudio(true);
    setCurrentApp(null);
    addDevLog(`🎛️ Entered Studio Mode`);
  };

  const manualSave = async (appId: string) => {
    try {
      addDevLog(`💾 Manual save triggered for ${appId}`);
      await invoke('manual_save_and_sync', { appId });
    } catch (error) {
      addDevLog(`❌ Manual save failed: ${error}`);
    }
  };

  const checkGitHubReleases = async () => {
    if (!githubConnected) {
      addDevLog('❌ GitHub not connected');
      return;
    }
    
    setIsCheckingUpdates(true);
    try {
      addDevLog('🔍 Checking GitHub releases...');
      await invoke('check_all_releases');
    } catch (error) {
      addDevLog(`❌ Release check failed: ${error}`);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const connectGitHub = async () => {
    try {
      addDevLog('🔗 Connecting to GitHub...');
      await invoke('connect_github');
      setGithubConnected(true);
      addDevLog('✅ GitHub connected successfully');
    } catch (error) {
      addDevLog(`❌ GitHub connection failed: ${error}`);
    }
  };

  const getFilteredApps = () => {
    let filtered = apps;
    
    switch (currentView) {
      case 'myapps':
        filtered = apps.filter(app => app.isInstalled);
        break;
      case 'updates':
        filtered = apps.filter(app => app.hasUpdate);
        break;
      case 'applibrary':
        filtered = apps.filter(app => !app.isInstalled);
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(app => app.category === selectedCategory);
        }
        break;
    }
    
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getAutoSaveStatusColor = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-green-100 text-green-800 border-green-300';
      case 'saving': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'modified': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredApps = getFilteredApps();

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Custom Title Bar - Rosita Style */}
      <div className="custom-title-bar" data-tauri-drag-region style={{
        position: 'relative',
        width: '100%',
        height: '32px',
        background: 'linear-gradient(145deg, #ff69b4, #e75a9a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid #d1477a',
        boxShadow: 'inset 1px 1px 0 rgba(255, 255, 255, 0.3)',
        WebkitAppRegion: 'drag',
        cursor: 'grab'
      } as any}>
        <div className="window-controls" style={{ 
          position: 'absolute', 
          left: '20px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '8px',
          WebkitAppRegion: 'no-drag'
        } as any}>
          <div className="window-control close" onClick={() => (window as any).closeApp?.()} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#FF5F57',
            cursor: 'pointer'
          }}></div>
          <div className="window-control minimize" onClick={() => (window as any).minimizeApp?.()} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#FFBD2E',
            cursor: 'pointer'
          }}></div>
          <div className="window-control maximize" onClick={() => (window as any).maximizeApp?.()} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#28CA42',
            cursor: 'pointer'
          }}></div>
        </div>
        <span className="title-text" style={{
          fontWeight: 'bold',
          color: 'white',
          fontSize: '14px',
          fontFamily: "'Courier New', 'Monaco', monospace"
        }}>{currentApp ? currentApp.name : showStudio ? 'Studio Pro' : 'Wiistruments Center'}</span>
        
        {/* Navigation buttons in title bar - ALWAYS visible */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {/* Studio button - always visible */}
          <button 
            onClick={openStudio}
            className="w-6 h-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-xs border border-white/30"
            title="Open Studio (Multi-App Sync)"
          >
            🎛️
          </button>
          
          {/* Home button - always visible */}
          <button 
            onClick={closeApp}
            className="w-6 h-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-xs border border-white/30"
            title="Return to Wiistruments Center"
          >
            🏠
          </button>
          
          {/* Help button - LAST and context-aware */}
          <button 
            className="w-6 h-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-xs border border-white/30"
            title={currentApp ? `${currentApp.name} Help & Instructions` : showStudio ? "Studio Help" : "Wiistruments Center Help"}
          >
            ?
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');
        .pixel-font { font-family: 'Press Start 2P', monospace; line-height: 1.6; }
        .code-font { font-family: 'JetBrains Mono', monospace; }
        .player2-font { font-family: 'Orbitron', 'Press Start 2P', monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .bounce-in { animation: bounceIn 0.5s ease-out; }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
        
        /* Window control hover effects */
        .window-control:hover {
          opacity: 0.8;
        }
        
        /* Custom title bar styles */
        .custom-title-bar:active {
          cursor: grabbing;
        }
        
        /* Sidebar transition */
        .sidebar-transition {
          transition: all 0.3s ease-in-out;
        }
      `}</style>

      {/* App Content, Studio, or Main Content */}
      {currentApp ? (
        /* Full Screen App View */
        <div className="flex-1 relative">
          {/* Load app content via iframe for proper CSS/JS execution */}
          <iframe 
            src={`/apps/${currentApp.id}/index.html`}
            className="w-full h-full border-0 bg-white"
            title={currentApp.name}
            allow="microphone; midi; autoplay"
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
          />
        </div>
      ) : showStudio ? (
        /* Studio Mode */
        <div className="flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* Studio content */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto p-8">
              <div className="text-8xl mb-6">🎛️</div>
              <h1 className="text-4xl font-bold text-white mb-4 player2-font">STUDIO MODE</h1>
              <p className="text-xl text-white/80 mb-6 code-font">Multi-App Synchronization</p>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <div className="text-white/90 space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="code-font">Launch multiple instruments simultaneously</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="code-font">Sync BPM and tempo across all apps</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="code-font">Master volume and effects control</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400">🔒</span>
                    <span className="code-font">Premium Feature - Subscription Required</span>
                  </div>
                </div>
                <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 code-font font-bold">
                  UPGRADE TO STUDIO PRO
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Sidebar + App List View */
        <>
          {/* Sidebar */}
          <div className="w-80 bg-white/10 backdrop-blur-md border-r border-white/30 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/30 bg-white/5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
              <div className="w-6 h-8 relative animate-bounce">
                <div className="absolute top-0 left-1 w-4 h-2 bg-pink-400 border border-black"></div>
                <div className="absolute top-1 left-1 w-4 h-2 bg-yellow-100 border border-black"></div>
                <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute top-1.5 right-2 w-0.5 h-0.5 bg-black rounded-full"></div>
                <div className="absolute top-3 left-0.5 w-5 h-3 bg-white border border-black"></div>
                <div className="absolute top-3.5 left-0 w-1 h-1.5 bg-pink-400 border border-black animate-pulse"></div>
                <div className="absolute top-3.5 right-0 w-1 h-1.5 bg-pink-400 border border-black animate-pulse"></div>
                <div className="absolute bottom-0 left-1.5 w-1 h-2 bg-black"></div>
                <div className="absolute bottom-0 right-1.5 w-1 h-2 bg-black"></div>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white player2-font tracking-wider drop-shadow-lg" style={{ 
                background: 'linear-gradient(45deg, #ff1493, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>WIISTRUMENTS</span>
              <p className="text-xs text-white/80 code-font mt-1">YOUR EXPERIENCE. YOUR SOUND.</p>
              {devMode && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded pixel-font">DEV</span>
                  {fileWatcherActive && <span className="text-xs bg-green-400 text-black px-2 py-1 rounded pixel-font">WATCH</span>}
                  {githubConnected && <span className="text-xs bg-blue-400 text-black px-2 py-1 rounded pixel-font">GIT</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 bg-white/5">
          <ul className="space-y-3">
            {[
              { key: 'myapps', label: 'MY APPS', gradient: 'from-pink-500 to-purple-500' },
              { key: 'updates', label: `UPDATES (${apps.filter(app => app.hasUpdate).length})`, gradient: 'from-yellow-500 to-orange-500' },
              { key: 'applibrary', label: 'APP LIBRARY', gradient: 'from-blue-500 to-cyan-500' },
              { key: 'studio', label: 'STUDIO PRO 🔒', gradient: 'from-purple-600 to-indigo-600' }
            ].map(({ key, label, gradient }) => (
              <li key={key}>
                <button
                  onClick={() => key === 'studio' ? openStudio() : setCurrentView(key as any)}
                  className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all duration-200 code-font border-2 ${
                    currentView === key
                      ? `bg-gradient-to-r ${gradient} text-white border-white shadow-lg`
                      : 'text-white border-white/40 hover:border-white hover:bg-white/20 bg-white/10'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/30 space-y-3 bg-white/5">
          <button 
            onClick={checkGitHubReleases}
            disabled={isCheckingUpdates || !githubConnected}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 text-white border-2 border-white/60 hover:border-white hover:bg-white/20 rounded-xl transition-all duration-200 code-font font-bold bg-white/10 disabled:opacity-50"
          >
            <RotateCcw className={`w-5 h-5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdates ? 'CHECKING...' : 'CHECK UPDATES'}</span>
          </button>

          {devMode && (
            <>
              <div className="border-t border-white/30 pt-3">
                <p className="text-xs text-white/80 pixel-font mb-2">GITHUB</p>
                {!githubConnected ? (
                  <button 
                    onClick={connectGitHub}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 pixel-font text-xs border-2 border-white"
                  >
                    CONNECT
                  </button>
                ) : (
                  <div className="text-xs text-green-400 pixel-font">✅ CONNECTED</div>
                )}
              </div>

              <div className="border-t border-white/30 pt-3">
                <p className="text-xs text-white/80 pixel-font mb-2">DEV TOOLS</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDevMode(false)}
                    className="px-3 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-all duration-200 pixel-font text-xs border border-black"
                  >
                    DISABLE
                  </button>
                  <button 
                    onClick={() => setDevLogs([])}
                    className="px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-all duration-200 pixel-font text-xs border border-white"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            </>
          )}
          
          {!devMode && (
            <button 
              onClick={() => setDevMode(true)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 pixel-font text-xs border-2 border-gray-400"
            >
              ENABLE DEV MODE
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className={`border-b border-gray-200 px-8 py-6 shadow-sm transition-all duration-300 ${
          currentView === 'applibrary' 
            ? 'bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100' 
            : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 player2-font" style={{ 
              background: 'linear-gradient(45deg, #ff1493, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {currentView === 'myapps' && 'MY APPS'}
              {currentView === 'updates' && 'UPDATES'}  
              {currentView === 'applibrary' && 'APP LIBRARY'}
            </h1>
            <div className="flex items-center space-x-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 code-font shadow-sm transition-all duration-200 bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all code-font font-bold shadow-sm text-gray-700 bg-white border-gray-300 hover:border-purple-500 hover:bg-purple-50">
                <span>WELCOME JADE</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Category Bar */}
          {currentView === 'applibrary' && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', name: 'All Apps', icon: '🎵' },
                { id: 'synthesizers', name: 'Synthesizers', icon: '🎹' },
                { id: 'drums', name: 'Drum Machines', icon: '🥁' },
                { id: 'grooveboxes', name: 'Grooveboxes', icon: '🎛️' },
                { id: 'effects', name: 'Effects', icon: '⚡' },
                { id: 'samplers', name: 'Samplers', icon: '📼' },
                { id: 'sequencers', name: 'Sequencers', icon: '🎶' }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full whitespace-nowrap code-font font-bold border-2 transition-all duration-200 text-xs ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-white shadow-lg'
                      : 'bg-white border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        {/* App List */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-8">
            {filteredApps.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border-4 border-gray-200 shadow-lg">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 player2-font">
                  NO {currentView.toUpperCase().replace('APPLIBRARY', 'APPS TO EXPLORE')} FOUND
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApps.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-300 shadow-sm">
                    <div className="flex items-center space-x-6">
                      {/* App Icon */}
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-4 shadow-lg flex-shrink-0"
                        style={{ 
                          backgroundColor: 'white',
                          borderColor: app.color,
                          boxShadow: `0 0 20px ${app.color}40`
                        }}
                      >
                        <span style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                          {app.thumbnail}
                        </span>
                      </div>

                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 code-font cursor-pointer hover:text-purple-600 transition-colors" onClick={() => setSelectedApp(app)}>
                            {app.name}
                          </h3>
                          {app.version && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 code-font border-2 border-gray-300 shadow-sm">
                              v{app.version}
                            </span>
                          )}
                          {app.productCount && (
                            <span className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700 code-font border-2 border-blue-200 shadow-sm">
                              {app.productCount} products
                            </span>
                          )}
                          {devMode && (
                            <>
                              <span className="px-2 py-1 bg-yellow-100 rounded-full text-xs text-yellow-800 pixel-font border border-yellow-300">
                                DEV
                              </span>
                              {app.autoSaveEnabled && autoSaveStatus[app.id] && (
                                <span className={`px-2 py-1 rounded-full text-xs pixel-font border ${getAutoSaveStatusColor(autoSaveStatus[app.id])}`}>
                                  {autoSaveStatus[app.id].toUpperCase()}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {currentView === 'myapps' && (
                          <p className="text-gray-600 code-font text-lg">{app.description}</p>
                        )}
                        {app.lastModified && devMode && (
                          <p className="text-xs text-gray-500 code-font mt-1">
                            Last modified: {new Date(app.lastModified).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="text-right min-w-[140px] flex-shrink-0">
                        {!app.isInstalled ? (
                          <button className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 code-font font-bold border-2 border-white shadow-lg">
                            INSTALL
                          </button>
                        ) : app.hasUpdate ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center text-sm text-orange-600 font-bold code-font bg-orange-50 px-3 py-1 rounded-full border-2 border-orange-200">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                              UPDATE AVAILABLE
                            </div>
                            <button
                              onClick={() => manualSave(app.id)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 code-font font-bold border-2 border-white shadow-lg"
                            >
                              💾 SAVE & SYNC
                            </button>
                          </div>
                        ) : app.isActivated ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center text-sm text-green-600 font-bold code-font bg-green-50 px-3 py-1 rounded-full border-2 border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              ACTIVATED
                            </div>
                            <button 
                              onClick={() => launchApp(app)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 code-font font-bold border-2 border-white shadow-lg hover:scale-105 transform"
                            >
                              🚀 LAUNCH
                            </button>
                          </div>
                        ) : (
                          <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 code-font font-bold border-2 border-white shadow-lg">
                            ACTIVATE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Dev Console */}
        {devMode && devLogs.length > 0 && (
          <div className="bg-black text-green-400 p-4 border-t border-gray-600 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="pixel-font text-xs text-green-400">AUTO-SAVE CONSOLE</h3>
              <button 
                onClick={() => setDevLogs([])}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs pixel-font hover:bg-red-600"
              >
                CLEAR
              </button>
            </div>
            <div className="space-y-1">
              {devLogs.map((log, index) => (
                <div key={index} className="text-xs code-font text-green-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        </>
      )}
      </div>
    </div>
  );
}

export default App;