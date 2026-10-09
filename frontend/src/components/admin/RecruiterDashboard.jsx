import { useEffect, useState } from "react";
import { BriefcaseBusiness, CircleCheck, Clock3, Files, UserCheck, UsersRound } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import Navbar from "../shared/Navbar";

const RecruiterDashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        api.get("/dashboard/recruiter", { signal: controller.signal })
            .then((response) => setData(response.data))
            .catch((requestError) => {
                if (requestError.code !== "ERR_CANCELED") setError(getErrorMessage(requestError, "Unable to load dashboard"));
            });
        return () => controller.abort();
    }, []);

    const metrics = data?.metrics;
    const cards = [
        { label: "Total jobs", value: metrics?.totalJobs, icon: Files },
        { label: "Active jobs", value: metrics?.activeJobs, icon: BriefcaseBusiness },
        { label: "Total applicants", value: metrics?.totalApplicants, icon: UsersRound },
        { label: "Pending review", value: metrics?.pendingApplications, icon: Clock3 },
        { label: "Shortlisted", value: metrics?.shortlistedCandidates, icon: UserCheck },
        { label: "Selected", value: metrics?.selectedCandidates, icon: CircleCheck },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900">Recruiter dashboard</h1>
                <p className="text-sm text-gray-500 mt-1 mb-6">Hiring activity across your jobs</p>
                {error ? <div role="alert" className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-md">{error}</div> : (
                    <section className="grid grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Recruiter metrics">
                        {cards.map(({ label, value, icon: Icon }) => (
                            <article key={label} className="bg-white border border-gray-200 rounded-md p-5 min-h-32">
                                <Icon className="h-5 w-5 text-[#6A38C2] mb-4" />
                                <p className="text-3xl font-bold text-gray-900">{value ?? "-"}</p>
                                <p className="text-sm text-gray-500 mt-1">{label}</p>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default RecruiterDashboard;
