import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, KeyRound } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const ForgotPasswordModal = ({ open, setOpen, initialEmail = "", onPasswordResetSuccess }) => {
    const [formData, setFormData] = useState({
        email: initialEmail,
        phoneNumber: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [submitting, setSubmitting] = useState(false);

    // Keep email synced if initialEmail changes when opening modal
    React.useEffect(() => {
        if (open) {
            setFormData(prev => ({
                ...prev,
                email: initialEmail || prev.email,
            }));
        }
    }, [open, initialEmail]);

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const trimmedEmail = formData.email.trim();
        if (!trimmedEmail) {
            toast.error("Please enter your registered email");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        const trimmedPhone = formData.phoneNumber.trim();
        if (!trimmedPhone) {
            toast.error("Please enter your registered phone number");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(`${USER_API_END_POINT}/reset-password`, {
                email: trimmedEmail,
                phoneNumber: trimmedPhone,
                newPassword: formData.newPassword,
            });

            if (res.data.success) {
                toast.success(res.data.message || "Password reset successfully!");
                if (onPasswordResetSuccess) {
                    onPasswordResetSuccess(trimmedEmail);
                }
                setFormData({
                    email: "",
                    phoneNumber: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setOpen(false);
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to reset password"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[440px] bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-purple-100 text-[#6A38C2]">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Reset Password</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                        Enter your registered email and phone number to set a new password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submitHandler} className="space-y-4 mt-2">
                    <div>
                        <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                            Registered Email
                        </Label>
                        <Input
                            id="reset-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={changeHandler}
                            placeholder="you@example.com"
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="reset-phone" className="text-sm font-medium text-gray-700">
                            Registered Phone Number
                        </Label>
                        <Input
                            id="reset-phone"
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={changeHandler}
                            placeholder="e.g. 8092433308"
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="reset-new-password" className="text-sm font-medium text-gray-700">
                            New Password (min 8 characters)
                        </Label>
                        <Input
                            id="reset-new-password"
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={changeHandler}
                            placeholder="Enter new password"
                            className="mt-1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="reset-confirm-password" className="text-sm font-medium text-gray-700">
                            Confirm New Password
                        </Label>
                        <Input
                            id="reset-confirm-password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={changeHandler}
                            placeholder="Confirm new password"
                            className="mt-1"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPasswordModal;
