import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { Users, Activity } from 'lucide-react';
import groupService from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';
import './css/Groups.css';

const MyGroups = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyGroups = async () => {
            if (!user?.idUser) return;
            try {
                // Call the real API to get user's groups
                const data = await groupService.getUserGroups(user.idUser);
                // Extract the array properly depending on the API wrapper
                // Sometimes APIs return { data: [...] } or { result: [...] } or { content: [...] }
                let groupList = [];
                if (Array.isArray(data)) {
                    groupList = data;
                } else if (data && typeof data === 'object') {
                    const potentialArray = data.result || data.data || data.content || data.items;
                    if (Array.isArray(potentialArray)) {
                        groupList = potentialArray;
                    }
                }
                setMyGroups(groupList);
            } catch (error) {
                console.error("Error fetching my groups:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyGroups();
    }, [user?.idUser]);

    return (
        <div className="groups-container">
            <Sidebar />

            <main className="groups-main ml-[120px]">
                <div className="groups-content">
                    <header className="groups-header">
                        <div className="header-text">
                            <h1 className="text-4xl font-black tracking-tight mb-2">My Communities</h1>
                            <p className="text-slate-400 font-medium">Manage the groups you've joined.</p>
                        </div>
                    </header>

                    <section className="groups-section mt-8">
                        {loading ? (
                            <div className="py-20 text-center opacity-50 flex flex-col justify-center items-center gap-4">
                                <Activity className="w-8 h-8 animate-spin text-indigo-400" />
                                <p>Loading your communities...</p>
                            </div>
                        ) : myGroups.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-white/5">
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No Communities Yet</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8">
                                    You haven't joined any groups. Explore the community tab to find spaces that match your music taste.
                                </p>
                                <button
                                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 font-bold rounded-xl transition-colors text-white"
                                    onClick={() => navigate('/groups')}
                                >
                                    Explore Communities
                                </button>
                            </div>
                        ) : (
                            <div className="groups-grid">
                                {myGroups.map(group => (
                                    <div
                                        key={group.id}
                                        className="group-card group"
                                        onClick={() => navigate(`/groups/${group.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-image">
                                            {/* Handle cases where imageUrl might be null/empty from API */}
                                            <img
                                                src={group.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop"}
                                                alt={group.name}
                                            />
                                            <div className="card-overlay flex flex-col justify-end p-6">
                                                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2">
                                                    Joined
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            {/* Display mock or real stats based on available data */}
                                            <div className="member-count flex items-center gap-2 mb-2">
                                                <Users className="w-3 h-3" />
                                                <span>{group.members || "1 Member"}</span>
                                            </div>
                                            <h3 className="group-name text-xl font-bold mb-2">{group.name}</h3>
                                            <p className="group-desc text-slate-400 line-clamp-2 text-sm">{group.description || group.about || "A vibrant community for music lovers."}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MyGroups;
