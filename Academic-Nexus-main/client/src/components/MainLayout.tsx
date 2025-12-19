import React from 'react';
import { CardNav } from '@/components/CardNav';

interface NavCard {
  title: string;
  items: { label: string; href: string }[];
}

interface CurrentUser {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  name?: string;
  additional_roles?: string[];
}

interface MainLayoutProps {
  children: React.ReactNode;
  user: CurrentUser;
}

const getNavItems = (user: CurrentUser): NavCard[] => {
  if (!user) return [];

  const additionalRoles = user.additional_roles || [];

  switch (user.role) {
    case 'student':
      return [
        {
          title: 'Academics',
          items: [
            { label: 'Mind Map', href: '/student/mindmap' },
            { label: 'Results', href: '/student/results' },
          ],
        },
        {
          title: 'Exams',
          items: [
            { label: 'Hall Ticket', href: '/student/ticket' },
            { label: 'Seating Plan', href: '/student/seating' },
          ],
        },
        {
          title: 'Extra',
          items: additionalRoles.includes('club_coordinator')
            ? [{ label: 'Manage Club Events', href: '/student/events' }]
            : [{ label: 'Campus Events', href: '/student/events' }],
        },
      ];

    case 'faculty':
      return [
        {
          title: 'Classroom',
          items: [
            { label: 'Attendance', href: '/faculty/attendance' },
            { label: 'My Schedule', href: '/faculty/schedule' },
          ],
        },
        {
          title: 'Profile',
          items: additionalRoles.includes('seating_manager')
            ? [{ label: 'Allocate Seating', href: '/faculty/seating' }]
            : [{ label: 'Service Record', href: '/faculty/service' }],
        },
        {
          title: 'Exam Duty',
          items: [
            { label: 'Invigilation Schedule', href: '/faculty/invigilation' },
          ],
        },
      ];

    case 'admin':
      return [
        {
          title: 'People',
          items: [
            { label: 'Manage Students', href: '/admin/students' },
            { label: 'Manage Faculty', href: '/admin/faculty' },
            { label: 'Assign Duties', href: '/admin/duties' },
          ],
        },
        {
          title: 'Exams',
          items: [
            { label: 'Bulk Hall Ticket Upload', href: '/admin/tickets' },
            { label: 'Exam Schedule', href: '/admin/schedule' },
          ],
        },
        {
          title: 'System',
          items: [
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Settings', href: '/admin/settings' },
          ],
        },
      ];

    default:
      return [];
  }
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children, user }) => {
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  const navItems = getNavItems(user);
  // Ensure we always have at least a default Home card
  const itemsToDisplay = navItems.length > 0 ? navItems : [
    {
      title: 'Home',
      items: [{ label: 'Dashboard', href: `/${user.role}/dashboard` }],
    },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Floating Navigation Cards */}
      <CardNav items={itemsToDisplay} />
      
      {/* Content Container - Padded so Nav doesn't overlap */}
      <div className="pt-32 px-6 pb-12 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};
