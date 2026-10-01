import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { LogOut, User2, Briefcase, Menu, X } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    }

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className={`text-sm font-medium transition-colors ${isActive(to)
                ? 'text-[#6A38C2] border-b-2 border-[#6A38C2] pb-0.5'
                : 'text-gray-700 hover:text-[#6A38C2]'
                }`}
        >
            {children}
        </Link>
    );

    return (
        <nav className='bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm'>
            <div className='flex items-center justify-between max-w-7xl mx-auto h-16 px-4'>
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-[#6A38C2] to-[#9b59b6] rounded-lg flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <h1 className='text-xl font-extrabold text-gray-900'>
                        Job<span className='text-[#6A38C2]'>Net</span>
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <div className='hidden md:flex items-center gap-8'>
                    <ul className='flex font-medium items-center gap-6'>
                        {user && user.role === 'recruiter' ? (
                            <>
                                <li><NavLink to="/admin/companies">Companies</NavLink></li>
                                <li><NavLink to="/admin/jobs">Jobs</NavLink></li>
                            </>
                        ) : (
                            <>
                                <li><NavLink to="/">Home</NavLink></li>
                                <li><NavLink to="/jobs">Jobs</NavLink></li>
                                <li><NavLink to="/browse">Browse</NavLink></li>
                            </>
                        )}
                    </ul>

                    {!user ? (
                        <div className='flex items-center gap-2'>
                            <Link to="/login">
                                <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-[#6A38C2] hover:text-[#6A38C2] h-9">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] h-9">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer group">
                                    <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-[#6A38C2] transition-all">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        <AvatarFallback className="bg-gradient-to-br from-[#6A38C2] to-[#9b59b6] text-white font-bold text-sm">
                                            {user?.fullname?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 shadow-lg border-gray-100" align="end">
                                <div className='p-4 border-b border-gray-100'>
                                    <div className='flex gap-3 items-center'>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.profile?.profilePhoto} />
                                            <AvatarFallback className="bg-gradient-to-br from-[#6A38C2] to-[#9b59b6] text-white font-bold">
                                                {user?.fullname?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className='font-semibold text-sm text-gray-900'>{user?.fullname}</h4>
                                            <p className='text-xs text-gray-500'>{user?.email}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${user.role === 'recruiter' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-[#6A38C2]'}`}>
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>
                                    {user?.profile?.bio && (
                                        <p className='text-xs text-gray-400 mt-2 line-clamp-2'>{user.profile.bio}</p>
                                    )}
                                </div>
                                <div className='p-2'>
                                    {user && user.role === 'student' && (
                                        <Link to="/profile" className='flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                                            <User2 className="h-4 w-4 text-gray-400" />
                                            View Profile
                                        </Link>
                                    )}
                                    <button
                                        onClick={logoutHandler}
                                        className='flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors'
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
                    {user && user.role === 'recruiter' ? (
                        <>
                            <Link to="/admin/companies" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Companies</Link>
                            <Link to="/admin/jobs" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Jobs</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Home</Link>
                            <Link to="/jobs" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Jobs</Link>
                            <Link to="/browse" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Browse</Link>
                        </>
                    )}
                    {!user ? (
                        <div className="flex gap-2 pt-2">
                            <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                                <Button className="w-full bg-[#6A38C2]">Sign Up</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.profile?.profilePhoto} />
                                    <AvatarFallback className="bg-[#6A38C2] text-white text-xs">{user?.fullname?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{user?.fullname}</p>
                                    <p className="text-xs text-gray-400">{user?.role}</p>
                                </div>
                            </div>
                            {user.role === 'student' && (
                                <Link to="/profile" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>View Profile</Link>
                            )}
                            <button onClick={logoutHandler} className="block text-sm text-red-600 py-2">Logout</button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar