import React from 'react';
import { BusFront, CalendarDays, FlaskConical, GraduationCap, LayoutDashboard, RadioTower, WalletCards, CheckSquare } from 'lucide-react';
import UiIcon from '../../components/UiIcon';

function Sidebar({ isOpen, currentPage, onPageChange }) {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', id: 'Dashboard' },
        { icon: CheckSquare, label: 'Tasks', id: 'Tasks' },
        { icon: CalendarDays, label: 'Calendar', id: 'Calendar' },
        { icon: BusFront, label: 'Transport', id: 'Transport' },
        { icon: FlaskConical, label: 'Soil Analysis', id: 'Analytics' },
        { icon: RadioTower, label: 'Drone & IoT', id: 'Drone & IoT' },
        { icon: WalletCards, label: 'Financial', id: 'Financial' },
        { icon: GraduationCap, label: 'Learning', id: 'Learning' }
    ];

    const handleItemClick = (itemId) => {
        if (onPageChange) {
            onPageChange(itemId);
        }
    };

    return (
        <div className={`dashboard-sidebar ${isOpen ? '' : 'collapsed'}`}>
            {/* Header Section */}
            <div className="dashboard-sidebar-header">
                <div className="dashboard-logo-container">
                    <img
                        src="/images/shefarms-logo.jpg"
                        alt="SheFarms logo"
                        className="dashboard-logo-image"
                     />
                    {isOpen && (
                        <div className="dashboard-logo-content">
                            <h1 className="dashboard-logo-title">SheFarms</h1>
                            <p className="dashboard-logo-subtitle">Rural agriculture cooperative</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="dashboard-sidebar-nav">
                <ul className="dashboard-nav-menu">
                    {menuItems.map((item, index) => (
                        <li key={index} className={`dashboard-nav-item ${currentPage === item.id ? 'active' : ''}`}>
                            <button 
                                className="dashboard-nav-link"
                                onClick={() => handleItemClick(item.id)}
                            >
                                <item.icon className="dashboard-nav-icon" aria-hidden="true" />
                                {isOpen && <span className="dashboard-nav-label">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer Section */}
            {isOpen && (
                <div className="dashboard-sidebar-footer">
                    <div className="dashboard-user-profile">
                        <div className="dashboard-user-avatar"><UiIcon name="user" size={20} /></div>
                        <div className="dashboard-user-info">
                            <span className="dashboard-user-name">Women Farmer</span>
                            <span className="dashboard-user-role">Agriculture Leader</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
