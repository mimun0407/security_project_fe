import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, Menu, User, Settings, Activity, Bookmark, Moon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onOpenCreateModal }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsMoreMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <aside className="fixed left-0 top-0 h-screen w-[245px] border-r border-gray-300 bg-white px-3 py-8 flex flex-col z-50">
            <div className="mb-10 px-3">
                <h1 className="text-2xl font-semibold cursor-pointer" style={{ fontFamily: 'cursive' }} onClick={() => navigate('/newF')}>BQMUSIC</h1>
            </div>
            <nav className="flex-1 space-y-2">
                <NavItem icon={<Home className="w-6 h-6" />} label="Trang chủ" onClick={() => handleNavigation('/newF')} />
                <NavItem icon={<Search className="w-6 h-6" />} label="Tìm kiếm" />
                <NavItem icon={<Compass className="w-6 h-6" />} label="Khám phá" />
                <NavItem icon={<MessageCircle className="w-6 h-6" />} label="Tin nhắn" />
                <NavItem icon={<Heart className="w-6 h-6" />} label="Thông báo" />
                <div
                    onClick={onOpenCreateModal}
                    className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer group"
                >
                    <PlusSquare className="w-6 h-6 group-hover:scale-105 transition-transform" />
                    <span className="font-medium">Tạo</span>
                </div>
                <NavItem
                    icon={<User className="w-6 h-6" />}
                    label="Trang cá nhân"
                    onClick={() => handleNavigation('/user')}
                />
            </nav>

            {/* More Menu Popup */}
            {isMoreMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute bottom-20 left-4 w-[266px] mb-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 p-2 transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-5"
                >
                    <div className="flex flex-col">
                        <MenuItem icon={<Settings className="w-5 h-5" />} label="Cài đặt" />
                        <MenuItem icon={<Activity className="w-5 h-5" />} label="Hoạt động của bạn" />
                        <MenuItem icon={<Bookmark className="w-5 h-5" />} label="Đã lưu" />
                        <MenuItem icon={<Moon className="w-5 h-5" />} label="Chuyển chế độ" />
                        <MenuItem icon={<AlertCircle className="w-5 h-5" />} label="Báo cáo sự cố" />
                    </div>

                    <div className="h-1.5 bg-gray-50 -mx-2 my-2 border-t border-b border-gray-100"></div>

                    <div className="flex flex-col">
                        <div className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700">
                            Chuyển tài khoản
                        </div>
                        <div
                            onClick={handleLogout}
                            className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700"
                        >
                            Đăng xuất
                        </div>
                    </div>
                </div>
            )}

            <div
                ref={buttonRef}
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition mt-auto cursor-pointer select-none ${isMoreMenuOpen ? 'font-bold' : ''}`}
            >
                <Menu className={`w-6 h-6 transition-transform ${isMoreMenuOpen ? 'rotate-90' : ''}`} />
                <span className={`font-medium ${isMoreMenuOpen ? 'font-bold' : ''}`}>Xem thêm</span>
            </div>
        </aside>
    );
};

const NavItem = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer group">
        <div className="group-hover:scale-105 transition-transform duration-200 text-gray-800">
            {icon}
        </div>
        <span className="font-medium text-gray-900">{label}</span>
    </div>
);

const MenuItem = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
        <div className="text-gray-800">
            {icon}
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
);

export default Sidebar;
