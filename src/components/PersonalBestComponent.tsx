import { Workout, PersonalBest, Exercise, ExSet, User } from "@/interfaces/interfaces";
import { personalBestService } from "@/services/PersonalBestService";
import React, { useState, useEffect, useCallback } from "react";
import {Link } from "react-router-dom";


function PersonalBestComponent({workout}: {workout: Workout}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [storedPersonalBests, setStoredPersonalBests] = useState<PersonalBest[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [newPersonalBests, setNewPersonalBests] = useState<PersonalBest[]>([]);

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

    const getExercisePB = useCallback((exercise: Exercise, user: User) => {
        try{
            let exercisePB = {
                ExerciseID: exercise.ExerciseID,
                ExerciseName: exercise.ExerciseName,
                Weight: 0,
                Reps: 0,
                DateSet: new Date,
                UserID: user.UserID
            }

            if (exercise.Sets.length > 0){
                for (var set of exercise.Sets){
                    if ((set.Weight > exercisePB.Weight) || (set.Weight == exercisePB.Weight && set.Reps >= exercisePB.Reps)){
                        exercisePB.Weight = set.Weight;
                        exercisePB.Reps = set.Reps;
                        exercisePB.DateSet = set.DateStarted;
                    }
                }
            } 
            console.log("Exercise PB for exercise: ", JSON.stringify(exercisePB));
            return exercisePB;
            
        } catch (err){
            setError(err instanceof Error ? err.message : "Error getting exercise pb");
            return null;
        }
    }, []);

    const checkPersonalBests = useCallback(async (exercises: Exercise[], user: User, currentStoredPBs: PersonalBest[]) => {
        try {
            setLoading(true);
            setError(null);
    
            const updatedPersonalBests: PersonalBest[] = [];
            const newPBs: PersonalBest[] = [];
    
            for (var exercise of exercises) {
                const exercisePB = getExercisePB(exercise, user);
    
                if (!exercisePB) {
                    console.warn("No personal best could be generated for this exercise");
                    continue; // Skip this exercise but continue with others
                }
    
                try {
                    const result = await personalBestService.checkPersonalBest(
                        user.UserID,
                        exercisePB
                    );
    
                    if (result && !result.StatusCode) { // Make sure result is not an error object
                        console.log("Processed PB for exercise:", JSON.stringify(result));
                        updatedPersonalBests.push(result);
                        
                        // Check if this is a new personal best that should be displayed
                        const existingPB = currentStoredPBs.find(pb => 
                            pb.ExerciseName === result.ExerciseName && pb.UserID === result.UserID
                        );
                        
                        if (!existingPB || 
                            result.Weight > existingPB.Weight || 
                            (result.Weight === existingPB.Weight && result.Reps > existingPB.Reps)) {
                            newPBs.push(result);
                        }
                    } else {
                        console.error("Received error response:", result);
                    }
                } catch (pbError) {
                    console.error("Error processing personal best for exercise:", pbError);
                    // Continue processing other exercises
                }
            }
    
            // Update stored personal bests
            if (updatedPersonalBests.length > 0) {
                setStoredPersonalBests(prevPBs => {
                    const mergedPbs = [...prevPBs];
                    updatedPersonalBests.forEach(newPB => {
                        const existingIndex = mergedPbs.findIndex(pb => 
                            pb.ExerciseName === newPB.ExerciseName && pb.UserID === newPB.UserID
                        );
    
                        if (existingIndex !== -1) {
                            mergedPbs[existingIndex] = newPB;
                        } else {
                            mergedPbs.push(newPB);
                        }
                    });
                    return mergedPbs;
                });
            }
            
            // Update new personal bests to display
            if (newPBs.length > 0) {
                setNewPersonalBests(newPBs);
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error checking personal bests");
        } finally {
            setLoading(false);
        }
    }, [getExercisePB]); 

    useEffect(() => {
        const initializePersonalBests = async () => {
            const currentUser = await fetchUser();

            //console.log("Workout passed to summary:", JSON.stringify(workout));

            if (currentUser){
                setUser(currentUser);

                const workoutExercises = workout.Exercises;
                //console.log("Workout Exercises in personal bests: ", JSON.stringify(workoutExercises));

                if (workoutExercises && workoutExercises.length > 0){
                    setExercises(workoutExercises);

                    const storedPBs = await fetchStoredPersonalBests(currentUser.UserID);
                    console.log("Stored PBs in initialize: ", JSON.stringify(storedPBs));

                    await checkPersonalBests(workoutExercises, currentUser, storedPBs);
                }
            }
        };
        initializePersonalBests();
        console.log("Stored personal bests after initialize: ", JSON.stringify(storedPersonalBests));
    }, []);

    // For each new personal best, show personal best and info. Will be used in Workout Summary.
    // Instead of setting the list in workout summary, just put all work in this component, as its own component
    // that shows all personal bests, and then just import that into workout summary.
    if (newPersonalBests.length > 0){
        return (

            <div className="bg-opacity-95 rounded-xl p-5 h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)', minHeight: '280px' }}>
                {loading && <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-xl">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-300"></div>
                </div>}

                {error && <div className="absolute top-2 right-2 left-2 bg-red-500 bg-opacity-90 text-white p-2 rounded-lg text-sm">{error}</div>}

                <div className="pb-container mt-4">
                    <h1 className="text-white text-xl font-bold">Congratulations on your Personal Bests!</h1>
                    {newPersonalBests.map((pb, index) => (
                        <Link to="/stats" key={index}>
                            <div className="flex flex-wrap rounded-2xl gap-2 mt-1 hover:shadow-xl transition-all hover:bg-white hover:bg-opacity-10 hover:scale-105 p-3">
                                <span className="text-white font-lg w-full">New personal best for {pb.ExerciseName}</span>
                                <p className="text-teal-300 text-md mb-1 mr-3">Weight: {pb.Weight}</p>
                                <p className="text-teal-300 text-md mb-1 mr-3">Reps: {pb.Reps}</p>
                                <p className="text-teal-300 text-md mb-1">Date Set: {new Date(pb.DateSet).toDateString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }
    return null;
}

export default PersonalBestComponent;