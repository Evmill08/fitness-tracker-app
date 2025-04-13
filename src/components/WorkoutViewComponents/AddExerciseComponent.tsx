import { Exercise, Workout, MuscleGroup } from "@/interfaces/interfaces";
import { exerciseService } from "@/services/ExerciseService";
import { workoutService } from "@/services/WorkoutService";
import React, { useState } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { muscleGroupService } from "@/services/MuscleGroupService";
import MuscleGroupSelectorComponent from "./MuscleGroupSelectorComponent";


function AddExerciseComponent(){
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    //const [muscleGroup, setMuscleGroup] = useState<string>("");
    const [exerciseName, setExerciseName] = useState<string>("");
    const [exerciseType, setExerciseType] = useState<string>("");
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [formattedMuscleGroups, setFormattedMuscleGroups] = useState<MuscleGroup[]>([]);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
    const {refreshWorkout} = useWorkout();

    async function handleAddExercise() {
        if (!exerciseName || !exerciseType || muscleGroups.length == 0){
            setError("Exercise name, type, and at least one muscle group are required");
            return;
        }

        try{
            setLoading(true);
            setError(null);

            const formattedGroups = await formatMuscleGroups();
            //console.log("Formatted Muscle Groups: ", JSON.stringify(formattedMuscleGroups));

            const storedWorkout = localStorage.getItem('currentWorkout');
            if (!storedWorkout){
                throw new Error("No active workout found");
            }

            const parsedWorkout = JSON.parse(storedWorkout) as Workout;
            
            const addedExercise = await workoutService.addExerciseToWorkout(
                exerciseName,
                exerciseType,
                formattedGroups,
                [],
                0,
                parsedWorkout.WorkoutID
            );

            if (addedExercise){
                setExercise(addedExercise);
                console.log("Added Exercise: ", JSON.stringify(addedExercise));
            };

            const exists = await exerciseService.checkExerciseExists(addedExercise.ExerciseID);

            //console.log("Exercise fetched by add component: ", JSON.stringify(exists));

            await refreshWorkout();
            
            setExerciseName("");
            setExerciseType("");
            setMuscleGroups([]);
            setFormattedMuscleGroups([]);
            setExercise(null);
            setShowForm(false);

        } catch (err){
            setError(err instanceof Error ? err.message : "Error adding exercise to Workout");
        } finally {
            setLoading(false);
        }
    }

    // function handleAddMuscleGroup(){
    //     if (!muscleGroup.trim()) return;

    //     setMuscleGroups([...muscleGroups, muscleGroup]);
    //     //console.log("Muscle groups after group added: ", JSON.stringify(muscleGroups));
    //     setMuscleGroup("");
    // }

    function handleAddMuscleGroup(){
        if (!selectedMuscle) return;

        if (!muscleGroups.includes(selectedMuscle.MuscleGroupName)){
            setMuscleGroups([...muscleGroups, selectedMuscle.MuscleGroupName]);
        }

        setSelectedMuscle(null);
    }

    function handleRemoveMuscleGroup(index: number){
        const updatedMuscleGroups = [...muscleGroups];
        updatedMuscleGroups.splice(index, 1);
        setMuscleGroups(updatedMuscleGroups);
    }

    async function formatMuscleGroups(): Promise<MuscleGroup[]> {
        const formattedGroups: MuscleGroup[] = [];
        
        try {
            for (const muscleGroupName of muscleGroups) {
                const muscleGroupObj = await muscleGroupService.getMuscleGroupByName(muscleGroupName);
                if (muscleGroupObj) {
                    formattedGroups.push(muscleGroupObj);
                }
            }
            return formattedGroups;
        } catch (error) {
            console.error("Error formatting muscle groups:", error);
            throw error;
        }
    }

    if (!showForm){
        return (
            <div 
                className="bg-opacity-95 rounded-xl p-5 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full" 
                style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)' }}
                onClick={() => setShowForm(true)}
            >
                <div className="text-teal-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h3 className="text-teal-300 text-xl font-semibold mb-2">Add New Exercise</h3>
                <p className="text-gray-300 text-center">Click to add a new exercise to your workout</p>
            </div>
        );
    }
    
    return (
        <div 
            className="bg-opacity-95 rounded-xl p-5 flex flex-col shadow-lg h-full"
            style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)' }}
        >
            <h3 className="text-teal-300 text-xl font-semibold mb-4">Add New Exercise</h3>
            
            {error && (
                <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-100 p-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <div className="mb-4">
                <label className="block text-teal-300 mb-2" htmlFor="exerciseName">Exercise Name</label>
                <input
                    id="exerciseName"
                    type="text"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Bench Press"
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-teal-300 mb-2" htmlFor="exerciseType">Exercise Type</label>
                <input
                    id="exerciseType"
                    type="text"
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Compound, Isolation"
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-teal-300 mb-2">Muscle Groups</label>
                <div className="flex space-x-2 items-center">
                    <MuscleGroupSelectorComponent 
                        onSelectMuscle={(muscle) => setSelectedMuscle(muscle)}
                    />
                    {selectedMuscle && (
                        <button
                            onClick={handleAddMuscleGroup}
                            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                            type="button"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
            
            {muscleGroups.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {muscleGroups.map((mg, index) => (
                            <span 
                                key={index} 
                                className="bg-teal-800 text-teal-100 py-1 px-3 rounded-full flex items-center"
                            >
                                {mg}
                                <button
                                    onClick={() => handleRemoveMuscleGroup(index)}
                                    className="ml-2 text-teal-300 hover:text-white focus:outline-none"
                                    type="button"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-auto pt-4 flex justify-between">
                <button
                    onClick={() => setShowForm(false)}
                    className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    type="button"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAddExercise}
                    disabled={loading}
                    className={`bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="button"
                    aria-disabled={loading || !exerciseName || !exerciseType || muscleGroups.length == 0}
                >
                    {loading ? 'Adding...' : 'Add Exercise'}
                </button>
            </div>
        </div>
    );
}

export default AddExerciseComponent;