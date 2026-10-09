import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import api, { getErrorMessage } from '@/lib/api'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.map(skill => skill) || "",
        file: "",
        profilePhotoFile: ""
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file })
    }

    const photoChangeHandler = (e) => {
        setInput({ ...input, profilePhotoFile: e.target.files?.[0] || "" });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await api.post(`${USER_API_END_POINT}/profile/update`, formData);
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                if (input.profilePhotoFile) {
                    const photoData = new FormData();
                    photoData.append("file", input.profilePhotoFile);
                    const photoResponse = await api.post(`${USER_API_END_POINT}/profile/photo`, photoData);
                    dispatch(setUser(photoResponse.data.user));
                }
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to update profile"));
        } finally{
            setLoading(false);
        }
        setOpen(false);
        console.log(input);
    }



    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="fullname" className="text-right">Name</Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="phoneNumber" className="text-right">Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="skills" className="text-right">Skills</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={input.skills}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="profilePhoto" className="text-right">Photo</Label>
                                <Input
                                    id="profilePhoto"
                                    name="profilePhoto"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={photoChangeHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="file" className="text-right">Resume</Label>
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={fileChangeHandler}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {
                                loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Update</Button>
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateProfileDialog
