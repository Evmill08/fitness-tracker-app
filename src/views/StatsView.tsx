import React, { useState, useEffect } from "react";
import StatsPersonalBestsComponent from "@/components/StatsViewComponents/StatsPersonalBestsComponent";
import StatsWorkoutComponent from "@/components/StatsViewComponents/StatsWorkoutComponent";
import { useNavigate, Link } from "react-router-dom";
import { User } from "@/interfaces/interfaces";

function StatsView() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [toggleState, setToggleState] = useState<number>(1);

    return (
        <div className="w-11/12 mx-auto py-6">
            <h1 className="text-2xl font-bold text-yellow-400 mb-6">Statistics Dashboard</h1>
            
            <div className="stats-view-container bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="tabs-container">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-700">
                        <button
                            className={`px-6 py-3 text-base font-medium transition-colors duration-200 relative ${
                                toggleState === 1
                                    ? 'text-teal-300'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                            onClick={() => setToggleState(1)}
                            disabled={loading}
                        >
                            Personal Bests
                            {toggleState === 1 && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-teal-300"></div>
                            )}
                        </button>

                        <button
                            className={`px-6 py-3 text-base font-medium transition-colors duration-200 relative ${
                                toggleState === 2
                                    ? 'text-teal-300'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                            onClick={() => setToggleState(2)}
                            disabled={loading}
                        >
                            Workout Stats
                            {toggleState === 2 && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-teal-300"></div>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 md:p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-300"></div>
                                <p className="mt-4 text-gray-400">Loading stats...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-400">
                                Error: {error}
                            </div>
                        ) : (
                            <div className="content">
                                {toggleState === 1 ? (
                                    <StatsPersonalBestsComponent />
                                ) : (
                                    <StatsWorkoutComponent />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsView;