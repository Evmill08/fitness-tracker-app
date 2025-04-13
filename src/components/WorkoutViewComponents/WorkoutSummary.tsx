import { Exercise, Workout, User } from "@/interfaces/interfaces";
import { exerciseService } from "@/services/ExerciseService";
import React, { useState, useEffect } from "react";
import WorkoutStats from "./WorkoutStats";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';
import PersonalBestComponent from "../PersonalBestComponent";

interface WorkoutSummaryProps{
    workout: Workout,
    isOpen: boolean,
    onClose: () => void;
}

function WorkoutSummary ({workout, isOpen, onClose}: WorkoutSummaryProps){
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && workout.Exercises.length > 0){
            const duration = 750;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: {x: 0},
                    colors: ['#5eead4', '#2dd4bf', '#14b8a6'] 
                });

                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#5eead4', '#2dd4bf', '#14b8a6']
                });

                if (Date.now() < end){
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen){
            fetchCurrentUser();
            fetchWorkoutExercises();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    async function fetchCurrentUser(){
        try{
            setLoading(true);
            setError(null);

            const storedUser = localStorage.getItem("currentUser");
            if(storedUser){
                const parsedUser = JSON.parse(storedUser) as User;

                if (parsedUser && parsedUser.UserID){
                    setUser(parsedUser);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Error fetching User`);
        } finally {
            setLoading(false);
        }
    }

    async function fetchWorkoutExercises(){
        try{
            setLoading(true);
            setError(null);

            const fetchedExercises = await exerciseService.getExercisesByWorkoutID(workout.WorkoutID);

            console.log("Summary exercises: ", JSON.stringify(fetchedExercises));


            if (fetchedExercises){
                setExercises(fetchedExercises);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Error fetching Exercises`);
        } finally {
            setLoading(false);
        }
    }



    if (exercises.length > 0){
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                {/* Overlay with blur effect */}
                <div 
                    className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-50"
                    onClick={onClose}
                />
                
                {/* Popup content */}
                <div 
                    className="bg-opacity-95 rounded-xl p-5 shadow-lg w-full max-w-md mx-4 z-10 transform transition-all flex flex-col"
                    style={{backgroundColor: 'rgba(18, 41, 43, .95'}}
                >
                    <h1 className="text-white text-3xl">Nice Work!</h1>
    
                    <PersonalBestComponent workout={workout}/>
    
                    <div className="mt-4">
                        <WorkoutStats workout={workout}/>
                    </div>
    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="py-4 text-lg font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed"
                            onClick={() => navigate('/stats')}
                            disabled={loading}
                        >
                            View History
                        </button>
                        
                        <button
                            type="button"
                            className="py-4 text-lg font-bold text-teal-300 border border-teal-300 transition-all rounded-lg hover:bg-white hover:bg-opacity-10 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
    
export default WorkoutSummary;