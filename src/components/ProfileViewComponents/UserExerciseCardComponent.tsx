import { Exercise, ExSet, MuscleGroup } from "@/interfaces/interfaces";
import React, { useState, useEffect } from "react";

function UserExerciseCardComponent ({exercise} : {exercise : Exercise}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sets, setSets] = useState<ExSet[]>([]);
    const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);

    useEffect(() => {
        const loadExerciseData = async () => {
            if (exercise){
                setSets(exercise.Sets || []);
                setMuscleGroups(exercise.MuscleGroups);
            }
        }
        loadExerciseData();
    }, [exercise]);

    return (
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-4 shadow-md h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-yellow-400 text-xl font-bold hover:text-yellow-300 transition-colors duration-200">
                    {exercise.ExerciseName}
                </h2>
            </div>

            <div className="mb-4">
                <h3 className="text-teal-300 text-sm font-medium mb-1">{exercise.ExerciseType}</h3>
            </div>

            <div className="mb-4 flex-grow">
                <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 pb-1">
                        <div className="col-span-2">Set</div>
                        <div className="col-span-3">Weight</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-3">RPE</div>
                    </div>
                
                    {sets.length > 0 ? (
                        sets.map((set, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-2 text-sm text-gray-300">{idx + 1}</div>
                        
                                <div className="col-span-3">
                                    <p className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm">
                                        {set.Weight}
                                    </p>
                                </div>
                                
                                <div className="col-span-3">
                                    <p className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm">
                                        {set.Reps}
                                    </p>
                                </div>
                                
                                <div className="col-span-3">
                                    <p className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm">
                                        {set.RPE}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-sm">No sets recorded</div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {(muscleGroups || []).map((muscleGroup, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white bg-opacity-10 px-3 py-1 rounded-full text-white text-sm"
                    >
                        {muscleGroup.MuscleGroupName}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserExerciseCardComponent;
