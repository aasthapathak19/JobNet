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
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] || "" });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const trimmedFullname = input.fullname.trim();
        if (!trimmedFullname) {
            toast.error("Please enter your full name");
            return;
        }
        if (trimmedFullname.length < 2) {
            toast.error("Full name must be at least 2 characters");
            return;
        }

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

        const trimmedPhone = input.phoneNumber.trim();
        if (!trimmedPhone) {
            toast.error("Please enter your phone number");
            return;
        }
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(trimmedPhone)) {
            toast.error("Enter a valid phone number (7-15 digits)");
            return;
        }

        if (!input.password) {
            toast.error("Please enter a password");
            return;
        }
        if (input.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (!input.role) {
            toast.error("Please select whether you are a Student or Recruiter");
            return;
        }

        const formData = new FormData();
        formData.append("fullname", trimmedFullname);
        formData.append("email", trimmedEmail);
        formData.append("phoneNumber", trimmedPhone);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await api.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message || "Account created successfully! Please log in.");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to create your account"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-full max-w-lg border border-gray-200 rounded-md p-6 mx-4 my-10 shadow-sm bg-white'>
                    <h1 className='font-bold text-2xl mb-5 text-gray-900'>Sign Up</h1>
                    <div className='my-3'>
                        <Label htmlFor="signup-fullname" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                            id="signup-fullname"
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="Your full name"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className='my-3'>
                        <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            id="signup-email"
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
                        <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <Input
                            id="signup-phone"
                            type="tel"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="9876543210"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className='my-3'>
                        <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                            id="signup-password"
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="Minimum 8 characters"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className='my-4'>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Role</Label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="signup-student"
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4 accent-[#6A38C2]"
                                />
                                <Label htmlFor="signup-student" className="cursor-pointer text-sm text-gray-700">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="signup-recruiter"
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer h-4 w-4 accent-[#6A38C2]"
                                />
                                <Label htmlFor="signup-recruiter" className="cursor-pointer text-sm text-gray-700">Recruiter</Label>
                            </div>
                        </div>
                    </div>
                    <div className='my-4'>
                        <Label htmlFor="signup-profile-photo" className="text-sm font-medium text-gray-700 mb-1 block">Profile Photo (Optional)</Label>
                        <Input
                            id="signup-profile-photo"
                            accept="image/*"
                            type="file"
                            onChange={changeFileHandler}
                            className="cursor-pointer mt-1"
                        />
                    </div>
                    {
                        loading ? (
                            <Button disabled className="w-full my-4 bg-[#6A38C2]">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4 bg-[#6A38C2] hover:bg-[#5b30a6]">
                                Sign Up
                            </Button>
                        )
                    }
                    <div className='text-center mt-2'>
                        <span className='text-sm text-gray-600'>Already have an account? <Link to="/login" className='text-[#6A38C2] font-semibold hover:underline'>Login</Link></span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup
