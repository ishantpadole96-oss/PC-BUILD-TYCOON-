import React, { useState, useEffect } from 'react';
import { useSiteStore } from '../../store/siteStore';
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
    if (data) setLeaderboard(data);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#3b82f6' }}>🌐</span> Titan Network
        </h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            style={{ 
              background: 'none', border: 'none', color: activeTab === 'leaderboard' ? '#3b82f6' : '#94a3b8', 
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 5px 0',
              borderBottom: activeTab === 'leaderboard' ? '2px solid #3b82f6' : '2px solid transparent'
            }}>
            Global Leaderboard
          </button>
          <button 
            onClick={() => setActiveTab('friends')}
            style={{ 
              background: 'none', border: 'none', color: activeTab === 'friends' ? '#3b82f6' : '#94a3b8', 
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 5px 0',
              borderBottom: activeTab === 'friends' ? '2px solid #3b82f6' : '2px solid transparent'
            }}>
            Friends ({acceptedFriends.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
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
                {leaderboard.map((player, idx) => (
                  <div key={player.user_id} style={{ 
                    background: player.user_id === user.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)', 
                    border: player.user_id === user.id ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                    padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: idx < 3 ? '#f59e0b' : '#64748b', width: '30px' }}>
                      #{idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {player.username}
                        {player.user_id === user.id && <span style={{ fontSize: '11px', background: '#3b82f6', padding: '2px 6px', borderRadius: '10px' }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                        {getRankTitle(player.cash)} • {player.reputation} Rep
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                      ₹{parseInt(player.cash).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>
                    Leaderboard is empty. Be the first to save your game to the cloud!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div style={{ display: 'flex', gap: '30px', height: '100%' }}>
            
            {/* Left Col: Friends List */}
            <div style={{ flex: 2 }}>
              <h2 style={{ fontSize: '18px', color: '#e2e8f0', margin: '0 0 20px 0' }}>My Connections</h2>
              
              {pendingReceived.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Pending Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pendingReceived.map(req => (
                      <div key={req.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{req.sender?.username || 'Unknown User'}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleRespond(req.id, 'accepted')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => handleRespond(req.id, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                              {friendName[0].toUpperCase()}
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
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
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
                  {searchResults.map(u => {
                    const isAlreadyFriend = acceptedFriends.some(f => (f.sender_id === u.user_id || f.receiver_id === u.user_id));
                    const isPending = pendingSent.some(f => f.receiver_id === u.user_id) || pendingReceived.some(f => f.sender_id === u.user_id);
                    
                    return (
                      <div key={u.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{u.username}</span>
                        {isAlreadyFriend ? (
                          <span style={{ fontSize: '11px', color: '#10b981' }}>Friends</span>
                        ) : isPending ? (
                          <span style={{ fontSize: '11px', color: '#f59e0b' }}>Pending</span>
                        ) : (
                          <button onClick={() => handleSendRequest(u.user_id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
