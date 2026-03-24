import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  HiMoon, 
  HiSun, 
  HiOutlineSparkles,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineChatAlt2,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineArchive,
  HiOutlineUserGroup,
  HiOutlineLogout
} from 'react-icons/hi'
import { useAdminAuth } from '../../context/AdminAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import Swal from 'sweetalert2'
import PageTransition from '../../components/PageTransition'
import { useScrollTopOnRouteChange } from '../../hooks/useScrollTopOnRouteChange'
import faviconLogo from '../../assets/favicon.png'
import { Sidebar, SidebarBody, SidebarLink } from '../../components/ui/sidebar'
import { cn } from '../../lib/utils'
import './AdminLayout.css'

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const { dark, toggle: toggleDark } = useDarkMode()
  useScrollTopOnRouteChange()
  
  const [open, setOpen] = useState(false)

  const links = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <HiOutlineViewGrid />,
    },
    {
      label: "AI Assistant",
      href: "/admin/assistant",
      icon: <HiOutlineSparkles className="text-amber-500" />,
    },
    {
      label: "Clients",
      href: "/admin/clients",
      icon: <HiOutlineUsers />,
    },
    {
      label: "Properties",
      href: "/admin/properties",
      icon: <HiOutlineHome />,
    },
    {
      label: "Deals",
      href: "/admin/deals",
      icon: <HiOutlineShoppingBag />,
    },
    {
      label: "Leads & Inquiries",
      href: "/admin/inquiries",
      icon: <HiOutlineChatAlt2 />,
    },
    {
      label: "Activity Log",
      href: "/admin/activity",
      icon: <HiOutlineClipboardList />,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: <HiOutlineDocumentReport />,
    },
    {
      label: "Archives",
      href: "/admin/archives",
      icon: <HiOutlineArchive />,
    },
    {
      label: "Admin Users",
      href: "/admin/users",
      icon: <HiOutlineUserGroup />,
    },
  ]

  const handleLogout = () => {
    Swal.fire({
      title: 'Log out of CHara?',
      text: 'Are you sure you want to end your current session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Keep Session',
      confirmButtonColor: '#dc2626',
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      customClass: {
        popup: 'logout-confirmation-modal',
        confirmButton: 'swal-btn-danger',
        cancelButton: 'swal-btn-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        void logout().then(() => navigate('/admin/login'))
      }
    })
  }

  return (
    <div className={cn(
      "flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 w-full flex-1 overflow-hidden min-h-screen",
      "admin-layout-v2"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  className={location.pathname === link.href ? "bg-neutral-200 dark:bg-neutral-800 text-accent font-semibold" : ""}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <SidebarLink
              link={{
                label: dark ? "Light Mode" : "Dark Mode",
                href: "#",
                icon: (
                  <div onClick={(e) => { e.preventDefault(); toggleDark(); }} className="flex items-center justify-center w-full h-full">
                    {dark ? <HiSun className="text-yellow-500" /> : <HiMoon className="text-blue-500" />}
                  </div>
                ),
              }}
              onClick={(e) => { e.preventDefault(); toggleDark(); }}
            />
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <HiOutlineLogout className="text-red-500" />,
              }}
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
            />
            <div className="mt-4 px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.[0] ?? 'A'}
                </div>
                {open && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col"
                  >
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 truncate max-w-[150px]">
                      {user?.name ?? 'Admin'}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {user ? 'Administrator' : 'Guest'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900/50 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  )
}

const Logo = () => {
  return (
    <Link
      to="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={faviconLogo} alt="" className="h-6 w-6 flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl text-neutral-800 dark:text-neutral-100 whitespace-pre"
      >
        CHara Realty
      </motion.span>
    </Link>
  )
}

const LogoIcon = () => {
  return (
    <Link
      to="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={faviconLogo} alt="" className="h-6 w-6 flex-shrink-0" />
    </Link>
  )
}
