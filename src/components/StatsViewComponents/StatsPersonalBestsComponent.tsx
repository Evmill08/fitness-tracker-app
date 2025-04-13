import { Workout, PersonalBest, Exercise, ExSet, User } from "@/interfaces/interfaces";
import { personalBestService } from "@/services/PersonalBestService";
import React, { useState, useEffect, useCallback } from "react";
import {Link } from "react-router-dom";

function StatsPersonalBestsComponent() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storedPersonalBests, setStoredPersonalBests] = useState<PersonalBest[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [sortedPBs, setSortedPBs] = useState<PersonalBest[]>([]);

    async function fetchUser(){
        try{
            setLoading(true);
            setError(null);

            const storedUser = localStorage.getItem("currentUser");

            if (storedUser){
                const parsedUser = JSON.parse(storedUser) as User;

                if (parsedUser && parsedUser.UserID){
                    return parsedUser
                }
            } 
            return null;
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching current user");
            return null;
        } finally {
            setLoading(false);
        }
    }

    const fetchStoredPersonalBests = useCallback(async (userID: number) => {
        try{
            setLoading(true);
            setError(null);

            
            const personalBests = await personalBestService.getUserPersonalBests(userID);
            console.log("Personal Bests retrieved: ", JSON.stringify(personalBests));

            if (personalBests.length > 0){
                setStoredPersonalBests(personalBests);
                return personalBests;
            }
            return [];

            
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching personal bests");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializePersonalBests = async () => {
            const currentUser = await fetchUser();

            if (currentUser){
                setUser(currentUser);

                const storedPersonalBests = await fetchStoredPersonalBests(currentUser.UserID);
                if (storedPersonalBests && storedPersonalBests.length > 0){
                    setStoredPersonalBests(storedPersonalBests);
                    const sortedPersonalBests = await personalBestService.sortPersonalBestsByDate(storedPersonalBests);

                    if (sortedPersonalBests && sortedPersonalBests.length > 0){
                        setSortedPBs(storedPersonalBests);
                    }
                }
                
            }
        };
        initializePersonalBests();
    }, []);

    const formatDate = (workoutDate: Date): string => {
        const date = new Date(workoutDate);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    if (sortedPBs.length > 0){
        return (
            <div className="min-h-screen bg-gray-800 p-6">
                {loading && <p className="text-white text-center">Loading...</p>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                
                <h1 className="text-white text-center text-3xl font-bold mb-8">Personal Bests</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {sortedPBs && sortedPBs.length > 0 ? (
                    sortedPBs.map((PB, index) => (
                    <div 
                        key={index}
                        className="bg-opacity-95 rounded-xl p-5 h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)', minHeight: '200px' }}
                    >
                        <div className="flex-1 relative">
                        <h1 className="text-yellow-400 text-xl font-bold mb-3">{PB.ExerciseName}</h1>
                        
                        <div className="text-white mb-6">
                            <p className="text-teal-300 text-xl font-medium mb-1">Weight: {PB.Weight}</p>
                            <p className="text-teal-300 text-xl font-medium mb-1">Reps: {PB.Reps}</p>
                            <p className="text-teal-300 text-xl font-medium mb-1">Date Set: {formatDate(PB.DateSet)}</p>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3">
                    No personal bests recorded yet.
                    </div>
                )}
                </div>
            </div>
        )
    } else {
        return (
            <div className="text-center py-8 text-gray-400 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3">
                No Personal Bests recorded yet. Start a new workout?

                <Link to="/workout">
                    <div className="w-full max-w-md py-4 text-lg font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50">Start New Workout?</div>
                </Link>
            </div>
        )
    }
}

export default StatsPersonalBestsComponent;