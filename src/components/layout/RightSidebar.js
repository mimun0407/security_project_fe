import React from 'react';

const DEFAULT_AVATAR_URL = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?w=360";

const RightSidebar = ({ currentUser, suggestions, onFollow }) => {
    return (
        <aside className="fixed right-0 top-0 h-screen w-[320px] bg-white px-8 py-8 overflow-y-auto hidden lg:block">
            {/* --- PHẦN HIỂN THỊ USER HIỆN TẠI --- */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => { e.target.src = DEFAULT_AVATAR_URL }}
                    />
                    <div>
                        {/* Hiển thị username (login id) */}
                        <div className="font-semibold text-sm">{currentUser.username || "Chưa đăng nhập"}</div>
                        {/* Hiển thị name (Tên hiển thị) */}
                        <div className="text-gray-500 text-xs">{currentUser.name}</div>
                    </div>
                </div>
                <button className="text-blue-500 text-xs font-semibold">Chuyển</button>
            </div>
            {/* ----------------------------------- */}

            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 font-semibold text-sm">Gợi ý cho bạn</span>
                    <button className="text-xs font-semibold">Xem tất cả</button>
                </div>
                <div className="space-y-3">
                    {suggestions.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => { e.target.src = DEFAULT_AVATAR_URL }}
                                />
                                <div>
                                    <div className="font-semibold text-sm">{user.username}</div>
                                    <div className="text-gray-500 text-xs">{user.mutual}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => onFollow(user.id)}
                                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${user.isFollowed ? 'text-red-500 hover:text-red-700 bg-red-50' : 'text-blue-500 hover:text-blue-700'}`}
                            >
                                {user.isFollowed ? "Hủy theo dõi" : "Theo dõi"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8 text-xs text-gray-400 space-y-2">
                <div>© 2024 INSTAGRAM FROM META</div>
            </div>
        </aside>
    );
};

export default RightSidebar;
