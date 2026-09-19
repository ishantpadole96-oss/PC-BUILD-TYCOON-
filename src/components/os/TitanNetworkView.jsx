import React, { useState, useEffect } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { useGameStore } from '../../store/gameStore';
import { 
  fetchGlobalLeaderboard, 
  fetchFriends, 
  searchUsers, 
  sendFriendRequest, 
  respondToFriendRequest, 
  removeFriend 
} from '../../utils/supabase';

export function TitanNetworkView() {
  const user = useSiteStore(s => s.user);
  const setAuthModalOpen = useSiteStore(s => s.setAuthModalOpen);
  const cash = useGameStore(s => s.cash);
  const reputation = useGameStore(s => s.reputation);
  
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadLeaderboard();
      loadFriends();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data } = await fetchGlobalLeaderboard();
    
    let board = data || [];
    
    // If user is a mock user or not found in leaderboard, add them locally
    if (user) {
      const userName = user.user_metadata?.full_name || user.email?.replace('@titanos.com', '') || 'You';
      const userId = user.id || `mock_${userName}`;
      const alreadyInBoard = board.some(p => p.user_id === userId || p.username === userName);
      
      if (!alreadyInBoard) {
        board = [...board, {
          user_id: userId,
          username: userName,
          cash: cash || 0,
          reputation: reputation || 0
        }];
        // Sort by cash descending
        board.sort((a, b) => (b.cash || 0) - (a.cash || 0));
      }
    }
    
    setLeaderboard(board);
    setLoading(false);
  };

  const loadFriends = async () => {
    const { data } = await fetchFriends();
    if (data) setFriends(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    const { data } = await searchUsers(searchQuery);
    if (data) setSearchResults(data.filter(u => u.user_id !== user.id));
    setLoading(false);
  };

  const handleSendRequest = async (receiverId) => {
    await sendFriendRequest(receiverId);
    alert('Friend request sent!');
    setSearchQuery('');
    setSearchResults([]);
    loadFriends();
  };

  const handleRespond = async (id, status) => {
    await respondToFriendRequest(id, status);
    loadFriends();
  };

  const handleRemove = async (id) => {
    if(window.confirm('Remove this friend?')) {
      await removeFriend(id);
      loadFriends();
    }
  };

  // Rank title generator based on cash
  const getRankTitle = (cash) => {
    if (cash >= 100000000) return '🏆 Titan';
    if (cash >= 10000000) return '💎 Mogul';
    if (cash >= 1000000) return '🥇 Millionaire';
    if (cash >= 100000) return '📈 Investor';
    return '🌱 Beginner';
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a', color: 'white' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌐</div>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Titan Network</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px', textAlign: 'center', maxWidth: '400px' }}>
          Connect with other Tycoons, view the Global Leaderboard, and build your empire online.
        </p>
        <button 
          onClick={() => setAuthModalOpen(true)}
          style={{ background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          Sign In to Access
        </button>
      </div>
    );
  }

  // Filter friends based on status
  const pendingReceived = friends.filter(f => f.status === 'pending' && f.receiver_id === user.id);
  const pendingSent = friends.filter(f => f.status === 'pending' && f.sender_id === user.id);
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  const userName = user.user_metadata?.full_name || user.email?.replace('@titanos.com', '') || 'You';
  const userId = user.id || `mock_${userName}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#3b82f6' }}>🌐</span> Titan Network
        </h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {['leaderboard', 'friends', 'requests'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', border: 'none', 
                color: activeTab === tab ? '#3b82f6' : '#94a3b8', 
                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 5px 0',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                position: 'relative'
              }}>
              {tab === 'leaderboard' && 'Global Leaderboard'}
              {tab === 'friends' && `Friends (${acceptedFriends.length})`}
              {tab === 'requests' && (
                <>
                  Requests
                  {pendingReceived.length > 0 && (
                    <span style={{ 
                      position: 'absolute', top: '-8px', right: '-12px',
                      background: '#ef4444', color: 'white', fontSize: '11px', 
                      width: '18px', height: '18px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {pendingReceived.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {/* ===== LEADERBOARD TAB ===== */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', color: '#e2e8f0', margin: 0 }}>Top 50 Tycoons</h2>
              <button onClick={loadLeaderboard} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
            
            {loading ? <p style={{ color: '#94a3b8' }}>Loading leaderboard...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboard.map((player, idx) => {
                  const isMe = player.user_id === userId || player.username === userName;
                  return (
                    <div key={player.user_id || idx} style={{ 
                      background: isMe ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)', 
                      border: isMe ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                      padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: idx < 3 ? '#f59e0b' : '#64748b', width: '30px' }}>
                        #{idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {player.username}
                          {isMe && <span style={{ fontSize: '11px', background: '#3b82f6', padding: '2px 6px', borderRadius: '10px' }}>YOU</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                          {getRankTitle(player.cash)} • {player.reputation || 0} Rep
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                        ₹{parseInt(player.cash || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>
                    Leaderboard is empty. Be the first to save your game to the cloud!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== FRIENDS TAB ===== */}
        {activeTab === 'friends' && (
          <div style={{ display: 'flex', gap: '30px', height: '100%', flexWrap: 'wrap' }}>
            
            {/* Left Col: Friends List */}
            <div style={{ flex: 2, minWidth: '250px' }}>
              <h2 style={{ fontSize: '18px', color: '#e2e8f0', margin: '0 0 20px 0' }}>My Connections</h2>
              
              <div>
                <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Friends</h3>
                {acceptedFriends.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No friends yet. Search for users to add them!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {acceptedFriends.map(f => {
                      const isSender = f.sender_id === user.id;
                      const friendName = isSender ? (f.receiver?.username || 'Unknown') : (f.sender?.username || 'Unknown');
                      return (
                        <div key={f.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                              {friendName[0]?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{friendName}</span>
                          </div>
                          <button onClick={() => handleRemove(f.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Add Friend */}
            <div style={{ flex: 1, minWidth: '220px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
              <h2 style={{ fontSize: '16px', color: '#e2e8f0', margin: '0 0 15px 0' }}>Add Friends</h2>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="Search username..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}>
                  Search
                </button>
              </form>

              {loading && <p style={{ color: '#94a3b8', fontSize: '13px' }}>Searching...</p>}
              
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {searchResults.map(sr => (
                    <div key={sr.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{sr.username}</span>
                      <button 
                        onClick={() => handleSendRequest(sr.user_id)}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sent Requests */}
              {pendingSent.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Sent Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingSent.map(req => (
                      <div key={req.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px' }}>{req.receiver?.username || 'Unknown User'}</span>
                        <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>PENDING</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <div>
            <h2 style={{ fontSize: '18px', color: '#e2e8f0', margin: '0 0 20px 0' }}>Friend Requests</h2>
            
            {/* Incoming Requests */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📥 Incoming Requests
                {pendingReceived.length > 0 && (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                    {pendingReceived.length}
                  </span>
                )}
              </h3>
              {pendingReceived.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                  No incoming friend requests right now.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingReceived.map(req => (
                    <div key={req.id} style={{ 
                      background: 'rgba(59, 130, 246, 0.08)', 
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      padding: '15px 20px', borderRadius: '8px', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                          {(req.sender?.username || '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{req.sender?.username || 'Unknown User'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Wants to connect with you</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleRespond(req.id, 'accepted')} style={{ 
                          background: '#10b981', color: 'white', border: 'none', 
                          padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' 
                        }}>
                          ✓ Accept
                        </button>
                        <button onClick={() => handleRespond(req.id, 'rejected')} style={{ 
                          background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', 
                          padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' 
                        }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📤 Sent Requests
                {pendingSent.length > 0 && (
                  <span style={{ background: '#f59e0b', color: 'black', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                    {pendingSent.length}
                  </span>
                )}
              </h3>
              {pendingSent.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                  You haven't sent any friend requests yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingSent.map(req => (
                    <div key={req.id} style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '15px 20px', borderRadius: '8px', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                          {(req.receiver?.username || '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{req.receiver?.username || 'Unknown User'}</div>
                          <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>⏳ Waiting for response...</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>PENDING</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
