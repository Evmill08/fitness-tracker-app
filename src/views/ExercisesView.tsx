'use client'

import React, { useState, useEffect } from "react";
import { exerciseService } from "@/services/ExerciseService";
import { Exercise, User } from "../interfaces/interfaces";

import { useNavigate } from "react-router-dom";
import ExerciseCardComponent from "@/components/ExerciseCardComponent";

function ExerciseView() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try{
                const storedUser = localStorage.getItem('currentUser');
                
                if (storedUser){
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    if (parsedUser && parsedUser.UserID){
                        await fetchExerciseCards(parsedUser.UserID);
                    }
                } else {
                    throw new Error("Error fetching initial data");
                }
            } catch (err){
                setError(err instanceof Error ? err.message : "Error initializing data");
            }
        };
        fetchInitialData();
    }, [navigate]);

    async function fetchExerciseCards(userID: number){
        try{
            setLoading(true);
            setError(null);

            const exerciseCards = await exerciseService.getExerciseCards(userID);
            //console.log("exercise cards: ", JSON.stringify(exerciseCards));
            setExercises(exerciseCards);
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching exercises. Please try again.");
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
          {loading && <p className="text-white text-center">Loading...</p>}
          {error && <p className="text-red-400 text-center">{error}</p>}
      
          <h1 className="text-white text-center text-3xl font-bold mb-8">My Exercises</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {exercises && exercises.length > 0 ? (
                exercises.map((exercise, idx) => (
                    <ExerciseCardComponent exercise={exercise} key={idx}/>
                ))
            ) : (
                <div className="text-center py-8 text-gray-400 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3">
                    No exercises added yet. All exercises added to any workout will show up here.
                </div>
            )}
            </div>
        </div>
    );
}

export default ExerciseView;