import React from 'react';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, Menu, User } from 'lucide-react';

const Sidebar = ({ onOpenCreateModal }) => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-[245px] border-r border-gray-300 bg-white px-3 py-8 flex flex-col">
            <div className="mb-10 px-3">
                <h1 className="text-2xl font-semibold" style={{ fontFamily: 'cursive' }}>BQMUSIC</h1>
            </div>
            <nav className="flex-1 space-y-2">
                <NavItem icon={<Home className="w-6 h-6" />} label="Trang chủ" />
                <NavItem icon={<Search className="w-6 h-6" />} label="Tìm kiếm" />
                <NavItem icon={<Compass className="w-6 h-6" />} label="Khám phá" />
                <NavItem icon={<MessageCircle className="w-6 h-6" />} label="Tin nhắn" />
                <NavItem icon={<Heart className="w-6 h-6" />} label="Thông báo" />
                <div
                    onClick={onOpenCreateModal}
                    className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                    <PlusSquare className="w-6 h-6" /> <span className="font-medium">Tạo</span>
                </div>
                <NavItem icon={<User className="w-6 h-6" />} label="Trang cá nhân" />
            </nav>
            <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition mt-auto">
                <Menu className="w-6 h-6" /> <span className="font-medium">Xem thêm</span>
            </a>
        </aside>
    );
};

const NavItem = ({ icon, label }) => (
    <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition">
        {icon}
        <span className="font-medium">{label}</span>
    </a>
);

export default Sidebar;
