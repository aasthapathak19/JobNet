import { useEffect, useState } from "react";
import { Bookmark, BriefcaseBusiness, CheckCircle2, UserRoundCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import Job from "./Job";
import Navbar from "./shared/Navbar";

const CandidateDashboard = () => {
    const user = useSelector((store) => store.auth.user);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        api.get("/dashboard/candidate", { signal: controller.signal })
            .then((response) => setData(response.data))
            .catch((requestError) => {
                if (requestError.code !== "ERR_CANCELED") setError(getErrorMessage(requestError, "Unable to load dashboard"));
            });
        return () => controller.abort();
    }, []);

    if (user?.role !== "student") return <Navigate to="/admin/dashboard" replace />;

    const metrics = data?.metrics;
    const cards = [
        { label: "Profile completion", value: metrics ? `${metrics.profileCompletion}%` : "-", icon: UserRoundCheck },
        { label: "Applications", value: metrics?.appliedJobs ?? "-", icon: BriefcaseBusiness },
        { label: "Saved jobs", value: metrics?.savedJobs ?? "-", icon: Bookmark },
        { label: "Shortlisted", value: metrics?.statusCounts?.Shortlisted ?? 0, icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Candidate dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.fullname}</p>
                </header>

                {error ? <div role="alert" className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-md">{error}</div> : (
                    <>
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-label="Candidate metrics">
                            {cards.map(({ label, value, icon: Icon }) => (
                                <article key={label} className="bg-white border border-gray-200 rounded-md p-4">
                                    <Icon className="h-5 w-5 text-[#6A38C2] mb-3" />
                                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                                    <p className="text-sm text-gray-500">{label}</p>
                                </article>
                            ))}
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended for you</h2>
                            {!data ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((item) => <div key={item} className="h-64 bg-gray-200 animate-pulse rounded-md" />)}</div>
                            ) : data.recommendations.length ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.recommendations.map((job) => <Job key={job._id} job={job} />)}
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">Add skills to your profile to improve recommendations.</div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default CandidateDashboard;
