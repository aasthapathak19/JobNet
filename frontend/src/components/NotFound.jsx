import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-sm font-semibold text-[#6A38C2]">404</p>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Page not found</h1>
                <p className="text-gray-500 mt-3">The page may have moved or the address may be incorrect.</p>
                <div className="flex justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                    <Button asChild><Link to="/"><Home className="h-4 w-4 mr-2" />Home</Link></Button>
                </div>
            </div>
        </main>
    );
};

export default NotFound;
