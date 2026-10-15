import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '@/lib/api'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'
import ForgotPasswordModal from './ForgotPasswordModal'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [navigate, user]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const trimmedEmail = input.email.trim();
        if (!trimmedEmail) {
            toast.error("Please enter your email address");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }
        if (!input.password) {
            toast.error("Please enter your password");
            return;
        }

        const payload = {
            email: trimmedEmail,
            password: input.password,
            ...(input.role ? { role: input.role } : {}),
        };

        try {
            dispatch(setLoading(true));
            const res = await api.post(`${USER_API_END_POINT}/login`, payload);
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message || "Logged in successfully");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to log in"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-full max-w-lg border border-gray-200 rounded-md p-6 mx-4 my-10 shadow-sm bg-white'>
                    <h1 className='font-bold text-2xl mb-5 text-gray-900'>Login</h1>
                    <div className='my-3'>
                        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            id="login-email"
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="you@example.com"
                            className="mt-1"
                            required
                        />
                    </div>

                    <div className='my-3'>
                        <div className='flex items-center justify-between'>
                            <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                            <button
                                type="button"
                                onClick={() => setForgotModalOpen(true)}
                                className="text-xs font-semibold text-[#6A38C2] hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <Input
                            id="login-password"
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="Enter your password"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className='my-4'>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Role (Optional)</Label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="login-student"
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4 accent-[#6A38C2]"
                                />
                                <Label htmlFor="login-student" className="cursor-pointer text-sm text-gray-700">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="login-recruiter"
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4 accent-[#6A38C2]"
                                />
                                <Label htmlFor="login-recruiter" className="cursor-pointer text-sm text-gray-700">Recruiter</Label>
                            </div>
                        </div>
                    </div>
                    {
                        loading ? (
                            <Button disabled className="w-full my-4 bg-[#6A38C2]">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4 bg-[#6A38C2] hover:bg-[#5b30a6]">
                                Login
                            </Button>
                        )
                    }
                    <div className='text-center mt-2'>
                        <span className='text-sm text-gray-600'>Don't have an account? <Link to="/signup" className='text-[#6A38C2] font-semibold hover:underline'>Sign Up</Link></span>
                    </div>
                </form>
            </div>
            <ForgotPasswordModal
                open={forgotModalOpen}
                setOpen={setForgotModalOpen}
                initialEmail={input.email}
                onPasswordResetSuccess={(email) => setInput(prev => ({ ...prev, email, password: "" }))}
            />
        </div>
    );
};

export default Login
