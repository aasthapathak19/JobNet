import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Globe, Sparkles, CheckCircle, AlertCircle, Key } from 'lucide-react';
import api, { getErrorMessage } from '@/lib/api';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const POPULAR_QUERIES = [
    { label: "React in Bengaluru", query: "React Developer in Bengaluru, India" },
    { label: "Full Stack in India", query: "Full Stack Developer in India" },
    { label: "Data Scientist", query: "Data Scientist in Hyderabad, India" },
    { label: "DevOps Engineer", query: "DevOps Engineer in Pune, India" },
    { label: "AI / ML Engineer", query: "Machine Learning Engineer in India" },
];

const SyncJobsModal = ({ open, setOpen, onSyncSuccess }) => {
    const [apiKey, setApiKey] = useState("");
    const [query, setQuery] = useState("Software Developer in India");
    const [numPages, setNumPages] = useState("1");
    const [loading, setLoading] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const handleSync = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            toast.error("Please enter a search query for jobs");
            return;
        }

        try {
            setLoading(true);
            setSyncResult(null);

            const payload = {
                query: query.trim(),
                numPages: Number(numPages) || 1,
                country: "in",
                ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
            };

            const res = await api.post(`${JOB_API_END_POINT}/sync-external`, payload);

            if (res.data.success) {
                setSyncResult(res.data);
                toast.success(res.data.message || `Successfully synced ${res.data.syncedCount} jobs!`);
                if (onSyncSuccess) {
                    onSyncSuccess(res.data);
                }
            }
        } catch (error) {
            const msg = getErrorMessage(error, "Failed to sync external jobs");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = (q) => {
        setQuery(q);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[540px] bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-purple-100 text-[#6A38C2]">
                            <Globe className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            Sync Live Jobs from JSearch API
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                        Import live tech jobs across India into JobNet using JSearch RapidAPI.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSync} className="space-y-4 mt-2">
                    {/* RapidAPI Key Field */}
                    <div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="rapidapi-key" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-gray-500" /> RapidAPI Key
                            </Label>
                            <a
                                href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#6A38C2] hover:underline"
                            >
                                Get free API key &rarr;
                            </a>
                        </div>
                        <Input
                            id="rapidapi-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your RapidAPI key (or leave blank if set in .env)"
                            className="mt-1 font-mono text-xs"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            RapidAPI offers 500 free requests/month with instant access.
                        </p>
                    </div>

                    {/* Search Query Field */}
                    <div>
                        <Label htmlFor="search-query" className="text-sm font-medium text-gray-700">
                            Search Query / Role & Location
                        </Label>
                        <Input
                            id="search-query"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. React Developer in Bengaluru, India"
                            className="mt-1"
                            required
                        />
                    </div>

                    {/* Quick suggestion chips */}
                    <div>
                        <span className="text-xs text-gray-500 font-medium block mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#6A38C2]" /> Quick Suggestions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {POPULAR_QUERIES.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => handleQuickQuery(item.query)}
                                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                        query === item.query
                                            ? "bg-[#6A38C2] text-white border-[#6A38C2]"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-[#6A38C2]"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Number of Pages */}
                    <div className="flex items-center justify-between pt-1">
                        <Label htmlFor="num-pages" className="text-sm font-medium text-gray-700">
                            Fetch Volume
                        </Label>
                        <select
                            id="num-pages"
                            value={numPages}
                            onChange={(e) => setNumPages(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-[#6A38C2] bg-white cursor-pointer"
                        >
                            <option value="1">1 Page (~10 jobs)</option>
                            <option value="2">2 Pages (~20 jobs)</option>
                        </select>
                    </div>

                    {/* Result Banner if synced */}
                    {syncResult && (
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">{syncResult.message}</p>
                                {syncResult.syncedJobs?.length > 0 && (
                                    <p className="mt-1 text-green-700">
                                        Imported: {syncResult.syncedJobs.map(j => `${j.title} (${j.company})`).slice(0, 3).join(", ")}
                                        {syncResult.syncedJobs.length > 3 ? "..." : ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Close
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching & Syncing...
                                </>
                            ) : (
                                <>
                                    <Globe className="mr-2 h-4 w-4" /> Sync Jobs
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SyncJobsModal;
