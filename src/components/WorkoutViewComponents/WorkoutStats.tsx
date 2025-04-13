import {Workout } from "@/interfaces/interfaces";
import React, { useState, useEffect } from "react";

function WorkoutStats ({workout}: {workout: Workout}){
    const [workoutTotalWeight, setWorkoutTotalWeight] = useState<number>(0);
    const [workoutTotalSets, setWorkoutTotalSets] = useState<number>(0);
    const [workoutTotalReps, setWorkoutTotalReps] = useState<number>(0);
    const [workoutAverageRPE, setWorkoutAverageRPE] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    
    async function fetchWorkoutWeight(){
        try{
            setLoading(true);
            setError(null);

            var totalWeight = 0;

            if (workout && workout.Exercises){
                for(var exercise of workout.Exercises){
                    for(var set of exercise.Sets || []){
                        totalWeight += (set.Weight || 0) * (set.Reps || 0);
                    }
                }
            }

            setWorkoutTotalWeight(totalWeight);
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching total weight");
        } finally {
            setLoading(false);
        }
    }

    async function fetchWorkoutReps(){
        try{
            setLoading(false);
            setError(null);

            var totalReps = 0;
            if (workout && workout.Exercises){
                for (var exercise of workout.Exercises){
                    for (var set of exercise.Sets || []){
                        totalReps += set.Reps || 0;
                    }
                }
            }

            setWorkoutTotalReps(totalReps);

        }catch (err){
            setError(err instanceof Error ? err.message : "Error fetching total reps");
        } finally {
            setLoading(false);
        }
    }

    
    async function fetchWorkoutSets(){
        try{
            setLoading(true);
            setError(null);

            var totalSets = 0;

            if (workout){
                for (var exercise of workout.Exercises){
                    totalSets += (exercise.Sets || []).length;
                }
            }

            setWorkoutTotalSets(totalSets);

        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching total sets");
        } finally {
            setLoading(false);
        }
    }

    async function fetchAverageRPE(){
        try{
            setLoading(true);
            setError(null);

            var totalRPE = 0;
            var setsLength = 0;
            if (workout && workout.Exercises){
                for (var exercise of workout.Exercises){
                    for (var set of exercise.Sets || []){
                        totalRPE += set.RPE || 0;
                        setsLength++;
                    }
                }
            }

            const averageRPE = setsLength > 0 ? parseFloat((totalRPE / setsLength).toFixed(2)) : 0;

            setWorkoutAverageRPE(averageRPE);

        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching average RPE");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (workout){
            fetchAverageRPE();
            fetchWorkoutReps();
            fetchWorkoutSets();
            fetchWorkoutWeight();
        }
    }, [workout])

    return (
        // TODO: Put loading and error stuff here
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg w-full h-full">
            <h3 className="text-teal-300 font-semibold mb-3 text-sm">Workout Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs">Sets</div>
                    <div className="text-white font-bold">{workoutTotalSets}</div>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs">Reps</div>
                    <div className="text-white font-bold">{workoutTotalReps}</div>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs">Total Weight</div>
                    <div className="text-white font-bold">{workoutTotalWeight} lbs</div>
                </div>
                <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs">Avg. RPE</div>
                    <div className="text-white font-bold">{workoutAverageRPE}</div>
                </div>
            </div>
        </div>
    )
}

export default WorkoutStats;