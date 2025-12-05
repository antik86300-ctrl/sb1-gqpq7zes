import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Trash2, LogOut, Moon, Sun, Smile, Search, Settings, Bell, BellOff, Edit2, Check, X, Download, Pin, Star, MoreVertical, Filter, Lock, Globe } from 'lucide-react';

export default function ChatClasse() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [userColor, setUserColor] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [channels] = useState(['general', 'devoirs', 'projets', 'detente', 'aide']);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [reactions, setReactions] = useState({});
  const [userStatus, setUserStatus] = useState('en ligne');
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [fontSize, setFontSize] = useState('medium');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [userBio, setUserBio] = useState('');
  const messagesEndRef = useRef(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '👏', '💯', '🤔', '😎', '🙌', '✨', '💪', '🤗', '😍', '🥳'];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯'];
  const statuses = [
    { label: 'En ligne', value: 'en ligne', color: 'bg-green-500' },
    { label: 'Occupé', value: 'occupe', color: 'bg-yellow-500' },
    { label: 'Absent', value: 'absent', color: 'bg-gray-500' },
    { label: 'Ne pas déranger', value: 'dnd', color: 'bg-red-500' }
  ];
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const key = `chat-final-${selectedChannel}`;
        const messagesData = await window.storage.get(key, true);
        const usersData = await window.storage.get('chat-final-users', true);
        const pinnedKey = `pinned-final-${selectedChannel}`;
        const pinnedData = await window.storage.get(pinnedKey, true);
        const reactionsKey = `reactions-final-${selectedChannel}`;
        const reactionsData = await window.storage.get(reactionsKey, true);
        
        if (messagesData) setMessages(JSON.parse(messagesData.value));
        if (usersData) setOnlineUsers(JSON.parse(usersData.value));
        if (pinnedData) setPinnedMessages(JSON.parse(pinnedData.value));
        if (reactionsData) setReactions(JSON.parse(reactionsData.value));
      } catch (error) {
        setMessages([]);
        setOnlineUsers([]);
        setPinnedMessages([]);
        setReactions({});
      }
    };
    loadData();

    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedChannel]);

  const handleLogin = async () => {
    if (username.trim()) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      setUserColor(color);
      setIsLoggedIn(true);
      
      const user = { 
        name: username, 
        color, 
        status: userStatus,
        bio: userBio,
        timestamp: Date.now()
      };
      const updatedUsers = [...onlineUsers.filter(u => u.name !== username), user];
      setOnlineUsers(updatedUsers);
      await window.storage.set('chat-final-users', JSON.stringify(updatedUsers), true);
    }
  };

  const handleLogout = async () => {
    const updatedUsers = onlineUsers.filter(u => u.name !== username);
    setOnlineUsers(updatedUsers);
    await window.storage.set('chat-final-users', JSON.stringify(updatedUsers), true);
    setIsLoggedIn(false);
    setUsername('');
    setUserBio('');
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      if (editingMsg) {
        const updatedMessages = messages.map(m => 
          m.id === editingMsg.id 
            ? { ...m, text: newMessage, edited: true }
            : m
        );
        setMessages(updatedMessages);
        await window.storage.set(`chat-final-${selectedChannel}`, JSON.stringify(updatedMessages), true);
        setEditingMsg(null);
      } else {
        const message = {
          id: Date.now(),
          user: username,
          userColor: userColor,
          text: newMessage,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('fr-FR'),
          channel: selectedChannel,
          replyTo: replyTo,
          status: userStatus
        };
        
        const updatedMessages = [...messages, message];
        setMessages(updatedMessages);
        await window.storage.set(`chat-final-${selectedChannel}`, JSON.stringify(updatedMessages), true);
      }
      
      setNewMessage('');
      setReplyTo(null);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm('Supprimer ce message ?')) {
      const updatedMessages = messages.filter(m => m.id !== msgId);
      setMessages(updatedMessages);
      await window.storage.set(`chat-final-${selectedChannel}`, JSON.stringify(updatedMessages), true);
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMsg(msg);
    setNewMessage(msg.text);
    setShowMessageMenu(null);
  };

  const handlePinMessage = async (msg) => {
    const isPinned = pinnedMessages.some(p => p.id === msg.id);
    let updatedPinned;
    
    if (isPinned) {
      updatedPinned = pinnedMessages.filter(p => p.id !== msg.id);
    } else {
      updatedPinned = [...pinnedMessages, msg];
    }
    
    setPinnedMessages(updatedPinned);
    await window.storage.set(`pinned-final-${selectedChannel}`, JSON.stringify(updatedPinned), true);
    setShowMessageMenu(null);
  };

  const handleAddReaction = async (msgId, emoji) => {
    const msgReactions = reactions[msgId] || {};
    const userReactions = msgReactions[emoji] || [];
    
    let updatedReactions;
    if (userReactions.includes(username)) {
      updatedReactions = {
        ...reactions,
        [msgId]: {
          ...msgReactions,
          [emoji]: userReactions.filter(u => u !== username)
        }
      };
    } else {
      updatedReactions = {
        ...reactions,
        [msgId]: {
          ...msgReactions,
          [emoji]: [...userReactions, username]
        }
      };
    }
    
    setReactions(updatedReactions);
    await window.storage.set(`reactions-final-${selectedChannel}`, JSON.stringify(updatedReactions), true);
  };

  const handleClearAll = async () => {
    if (window.confirm('Supprimer TOUS les messages ?')) {
      setMessages([]);
      await window.storage.set(`chat-final-${selectedChannel}`, JSON.stringify([]), true);
    }
  };

  const handleExportChat = () => {
    const exportData = {
      channel: selectedChannel,
      messages: messages,
      pinnedMessages: pinnedMessages,
      exportDate: new Date().toISOString(),
      users: onlineUsers
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${selectedChannel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoggedIn) {
        handleSendMessage();
      } else {
        handleLogin();
      }
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setShowMessageMenu(null);
  };

  const handleBlockUser = (user) => {
    if (blockedUsers.includes(user)) {
      setBlockedUsers(blockedUsers.filter(u => u !== user));
    } else {
      setBlockedUsers([...blockedUsers, user]);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (blockedUsers.includes(msg.user)) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return msg.text.toLowerCase().includes(search) || msg.user.toLowerCase().includes(search);
    }
    if (filterType === 'pinned') return pinnedMessages.some(p => p.id === msg.id);
    if (filterType === 'mentions') return msg.text.includes(`@${username}`);
    return true;
  });

  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-500';
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500'} flex items-center justify-center p-4`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 w-full max-w-lg`}>
          <div className="flex justify-center mb-6">
            <MessageCircle className={`w-24 h-24 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          
          <h1 className={`text-4xl font-black text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Chat de Classe
          </h1>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Rejoins la conversation 🚀
          </p>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ton nom
              </label>
              <input
                type="text"
                placeholder="Entre ton nom..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={20}
                className={`w-full px-4 py-3 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ta bio (optionnel)
              </label>
              <textarea
                placeholder="Dis quelque chose sur toi..."
                value={userBio}
                onChange={(e) => setUserBio(e.target.value)}
                maxLength={100}
                rows={2}
                className={`w-full px-4 py-3 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ton statut
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setUserStatus(status.value)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      userStatus === status.value
                        ? 'bg-blue-500 text-white scale-105'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
                      <span className="text-sm">{status.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              🚀 Rejoindre
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {darkMode ? 'Mode clair' : 'Mode sombre'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex flex-col ${getFontSizeClass()}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white shadow-xl`}>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Chat de Classe</h1>
                <p className="text-sm opacity-80">{username} • {selectedChannel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg ${showSearch ? 'bg-white/30' : 'hover:bg-white/20'}`}
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setNotifications(!notifications)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                {notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleExportChat}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${showSettings ? 'bg-white/30' : 'hover:bg-white/20'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span className="font-bold">{onlineUsers.length}</span>
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleClearAll}
                className="p-2 hover:bg-red-500/50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white/90'} rounded-lg focus:outline-none`}
              />
            </div>
          )}

          {showSettings && (
            <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-white/90'} rounded-lg p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Taille du texte
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
                  >
                    <option value="small">Petit</option>
                    <option value="medium">Moyen</option>
                    <option value="large">Grand</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mon statut
                  </label>
                  <select
                    value={userStatus}
                    onChange={(e) => {
                      setUserStatus(e.target.value);
                      const updatedUsers = onlineUsers.map(u => 
                        u.name === username ? { ...u, status: e.target.value } : u
                      );
                      setOnlineUsers(updatedUsers);
                      window.storage.set('chat-final-users', JSON.stringify(updatedUsers), true);
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
                  >
                    {statuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-4 p-4 overflow-hidden">
        {/* Left Sidebar */}
        <div className={`hidden lg:block w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-4`}>
          <h2 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Canaux
          </h2>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                  selectedChannel === channel
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>

          {pinnedMessages.length > 0 && (
            <div className="mt-6">
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <Pin className="w-4 h-4" />
                Épinglés
              </h3>
              <div className="space-y-2">
                {pinnedMessages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className={`text-xs p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="font-bold">{msg.user}</div>
                    <div className="truncate">{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Filtres
            </h3>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
            >
              <option value="all">Tous</option>
              <option value="pinned">Épinglés</option>
              <option value="mentions">Mentions</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-16`}>
                <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold">Aucun message</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isPinned = pinnedMessages.some(p => p.id === msg.id);
                const msgReactions = reactions[msg.id] || {};
                
                return (
                  <div key={msg.id} className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`flex items-start gap-2 max-w-xl ${msg.user === username ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 ${msg.userColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {msg.user[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`px-4 py-3 rounded-2xl ${
                          msg.user === username
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                        } shadow-md`}>
                          {isPinned && (
                            <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                              <Pin className="w-3 h-3" />
                              Épinglé
                            </div>
                          )}
                          
                          {msg.replyTo && (
                            <div className={`text-xs mb-2 pb-2 border-b opacity-80 ${msg.user === username ? 'border-white/30' : darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                              <div className="font-semibold">Réponse à {msg.replyTo.user}</div>
                              <div className="truncate">{msg.replyTo.text.substring(0, 40)}...</div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">
                              {msg.user === username ? 'Toi' : msg.user}
                            </span>
                            <button
                              onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                              className="opacity-0 group-hover:opacity-100 p-1"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="break-words">{msg.text}</div>
                          
                          <div className="text-xs opacity-80 mt-2">
                            {msg.timestamp}
                            {msg.edited && <span className="ml-2 italic">(modifié)</span>}
                          </div>

                          {showMessageMenu === msg.id && (
                            <div className={`absolute ${msg.user === username ? 'right-0' : 'left-0'} mt-2 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-2xl p-2 z-20 min-w-[180px]`}>
                              <button
                                onClick={() => handleReply(msg)}
                                className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} flex items-center gap-2`}
                              >
                                <Send className="w-4 h-4" />
                                Répondre
                              </button>
                              
                              <button
                                onClick={() => handlePinMessage(msg)}
                                className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} flex items-center gap-2`}
                              >
                                <Pin className="w-4 h-4" />
                                {isPinned ? 'Désépingler' : 'Épingler'}
                              </button>
                              
                              {msg.user === username && (
                                <>
                                  <button
                                    onClick={() => handleEditMessage(msg)}
                                    className={`w-full text-left px-3 py-2 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} flex items-center gap-2`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Modifier
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="w-full text-left px-3 py-2 rounded hover:bg-red-500 text-red-500 hover:text-white flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {Object.entries(msgReactions).map(([emoji, users]) => 
                            users.length > 0 && (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className={`px-2 py-1 rounded-full text-sm ${
                                  users.includes(username)
                                    ? 'bg-blue-500 text-white'
                                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                              >
                                {emoji} {users.length}
                              </button>
                            )
                          )}
                          
                          <div className="relative">
                            <button
                              onClick={() => setShowMessageMenu(showMessageMenu === `react-${msg.id}` ? null : `react-${msg.id}`)}
                              className={`px-2 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                            
                            {showMessageMenu === `react-${msg.id}` && (
                              <div className={`absolute bottom-full mb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-2 flex gap-1 z-20`}>
                                {reactionEmojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      handleAddReaction(msg.id, emoji);
                                      setShowMessageMenu(null);
                                    }}
                                    className="text-2xl hover:scale-125 transition"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {(replyTo || editingMsg) && (
            <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}>
              <div>
                <div className="text-sm font-semibold">
                  {editingMsg ? 'Modification' : `Réponse à ${replyTo?.user}`}
                </div>
                <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {editingMsg ? editingMsg.text : replyTo?.text}
                </div>
              </div>
              <button 
                onClick={() => {
                  setReplyTo(null);
                  setEditingMsg(null);
                  setNewMessage('');
                }}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            {showEmoji && (
              <div className={`mb-3 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl hover:scale-125 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`mb-2 p-2 rounded-lg ${showEmoji ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <textarea
                  placeholder="Écris ton message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="2"
                  className={`w-full px-4 py-3 border-2 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300'
                  } rounded-xl focus:outline-none focus:border-blue-500 resize-none`}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`p-4 rounded-xl ${
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {editingMsg ? <Check className="w-6 h-6" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`hidden xl:block w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-4`}>
          <h2 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Membres ({onlineUsers.length})
          </h2>
          
          <div className="space-y-2">
            {onlineUsers.map((user, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} ${user.name === username ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 ${user.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${user.name === username ? 'text-blue-500' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user.name}
                      {user.name === username && <span className="text-xs font-normal ml-1">(toi)</span>}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {statuses.find(s => s.value === user.status)?.label || 'En ligne'}
                    </div>
                    {user.bio && (
                      <div className={`text-xs mt-1 italic truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        "{user.bio}"
                      </div>
                    )}
                  </div>
                  
                  {user.name !== username && (
                    <button
                      onClick={() => handleBlockUser(user.name)}
                      className={`p-2 rounded ${
                        blockedUsers.includes(user.name)
                          ? 'bg-red-500 text-white'
                          : darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      {blockedUsers.includes(user.name) ? <Lock className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <h3 className={`font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Statistiques
            </h3>
            <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="font-bold">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Épinglés:</span>
                <span className="font-bold">{pinnedMessages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Membres:</span>
                <span className="font-bold">{onlineUsers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}