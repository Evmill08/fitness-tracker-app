import { Exercise, ExSet, MuscleGroup, Workout } from "@/interfaces/interfaces";
import { exerciseService } from "@/services/ExerciseService";
import { workoutService } from "@/services/WorkoutService";
import { exSetService } from "@/services/ExSetService";
import { muscleGroupService } from "@/services/MuscleGroupService";
import React, { useState, useEffect } from "react";
import { useWorkout } from "@/contexts/WorkoutContext";
import MuscleGroupSelectorComponent from "./MuscleGroupSelectorComponent";

function WorkoutExerciseCardComponent ({exercise} : {exercise : Exercise}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(exercise.MuscleGroups || []);
    const [sets, setSets] = useState<ExSet[]>(exercise.Sets || []);
    const [exerciseName, setExerciseName] = useState(exercise.ExerciseName);
    const [exerciseType, setExerciseType] = useState(exercise.ExerciseType);
    const [editingName, setEditingName] = useState(false);
    const [editingType, setEditingType] = useState(false);
    //const [newMuscleGroup, setNewMuscleGroup] = useState("");
    //const [showMuscleGroupInput, setShowMuscleGroupInput] = useState(false);
    const [showMuscleSelector, setShowMuscleSelector] = useState<boolean>(false);
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
    const {refreshWorkout} = useWorkout();

    async function fetchCurrentWorkout(){
        try{
            setLoading(true);
            setError(null);

            const storedWorkout = localStorage.getItem('currentWorkout');
            if (storedWorkout){
                const parsedWorkout = JSON.parse(storedWorkout) as Workout;
                if (parsedWorkout){
                    setWorkout(parsedWorkout);

                    const fetchedMuscleGroups = await muscleGroupService.getMuscleGroupFromExercise(exercise.ExerciseID);
                    if (fetchedMuscleGroups){
                      setMuscleGroups(fetchedMuscleGroups);
                      //console.log("Muscle groups: ", JSON.stringify(muscleGroups));
                    }
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching current workout");
        } finally {
            setLoading(false);
        }
    }

    async function updateWorkout(){
        try{
            setLoading(true);
            setError(null);

            const updatedWorkout = await workoutService.fetchWorkoutByID(exercise.WorkoutID);
            //console.log("Updated Workout: ", JSON.stringify(updatedWorkout));
            if (updatedWorkout){
                setWorkout(updatedWorkout);
            }
        } catch(err){
            setError(err instanceof Error ? err.message : "Error updating current workout");
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCurrentWorkout();
    }, [])

    async function handleRemoveExercise() {
        try{
            setLoading(true);
            setError(null);

            const exerciseID = exercise.ExerciseID;
            //console.log("Exercise ID to delete: ", exerciseID);
            const deleted = await exerciseService.removeExerciseFromWorkout(exerciseID);
            if (!deleted){
                throw new Error("Error removing exercise");
            }


            setSets([]);
            setMuscleGroups([]);
            setExerciseName("");
            setExerciseType("");

            await refreshWorkout();

            updateWorkout();

        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching current workout");
        } finally {
            setLoading(false);
        }
    }

    // async function handleAddMuscleGroup() {
    //     if (!newMuscleGroup.trim()) return;

    //     try {
    //         setLoading(true);
    //         setError(null);

    //         const muscleGroupObj = await muscleGroupService.getMuscleGroupByName(newMuscleGroup);
    //         console.log("muscle group to be added by handleAddMuscleGroup: ", JSON.stringify(muscleGroupObj));
    //         if (muscleGroupObj){

    //           setMuscleGroups((prevMuscleGroups) => {
    //             const updatedMuscleGroups = [...prevMuscleGroups, muscleGroupObj];

    //             console.log("Muscle Groups after add: ", JSON.stringify(updatedMuscleGroups));

    //             const exerciseData = {
    //               ExerciseID: exercise.ExerciseID,
    //               ExerciseName: exerciseName,
    //               ExerciseType: exerciseType,
    //               MuscleGroups: updatedMuscleGroups,  
    //               Sets: exercise.Sets,
    //               RestTime: exercise.RestTime,
    //               WorkoutID: exercise.WorkoutID
    //             };

    //             console.log("Exercise Data: ", JSON.stringify(exerciseData));

    //             exerciseService.updateExercise(exerciseData).then(updatedExercise => {
    //               console.log("Updated exercise for add mg: ", JSON.stringify(updatedExercise));
    //               updateWorkout();
    //             }).catch(err => setError(err instanceof Error ? err.message : "Error updating exercise"));

    //             return updatedMuscleGroups;
                
    //           })

    //           setShowMuscleGroupInput(false);
    //           setNewMuscleGroup("");

    //         } else {
    //           throw new Error("Error adding muscle group");
    //       }
          
    //     } catch (err){
    //         setError(err instanceof Error ? err.message : "Error adding muscle group to exercise");

    //     } finally {
    //         setLoading(false);
    //     }

    // }


    async function handleAddMuscleGroup(){
      try {
        setLoading(true);
        setError(null);

        if (!selectedMuscle) return;

        const isMuscleGroupExists = muscleGroups.some(
          mg => mg.MuscleGroupName === selectedMuscle.MuscleGroupName
        );

        if (!isMuscleGroupExists){
          setMuscleGroups((prevMuscleGroups) => {
            const updatedMuscleGroups = [...prevMuscleGroups, selectedMuscle];

            const exerciseData = {
                ExerciseID: exercise.ExerciseID,
                ExerciseName: exerciseName,
                ExerciseType: exerciseType,
                MuscleGroups: updatedMuscleGroups,  
                Sets: exercise.Sets,
                RestTime: exercise.RestTime,
                WorkoutID: exercise.WorkoutID
            };

            exerciseService.updateExercise(exerciseData).then(updatedExercise => {
              console.log("Updated exercise for add mg: ", JSON.stringify(updatedExercise));
              updateWorkout();
            }).catch(err => setError(err instanceof Error ? err.message : "Error updating exercise"));

            return updatedMuscleGroups;
          })

          //setShowMuscleSelector(false);
          //setSelectedMuscle(null);
        } else {
          console.error("Muscle Group already added");
        }
    
      } catch (err){
        setError(err instanceof Error ? err.message : "Error updating muscle group");
      } finally {
        setLoading(false);
      }
    }

    async function handleRemoveMuscleGroup(index: number){
        try{
            setLoading(true);
            setError(null);

            const muscleGroupToRemove = muscleGroups[index];
            if (muscleGroupToRemove){

              setMuscleGroups((prevMuscleGroups) => {
                const updatedMuscleGroups = [...prevMuscleGroups];
                updatedMuscleGroups.splice(index, 1);

                //console.log("Muscle Groups after delete: ", JSON.stringify(updatedMuscleGroups));

                const exerciseData = {
                  ExerciseID: exercise.ExerciseID,
                  ExerciseName: exerciseName,
                  ExerciseType: exerciseType,
                  MuscleGroups: updatedMuscleGroups,
                  Sets: exercise.Sets,
                  RestTime: exercise.RestTime,
                  WorkoutID: exercise.WorkoutID
                }

                //console.log("Exercise Data: ", JSON.stringify(exerciseData));

                exerciseService.updateExercise(exerciseData).then(updatedExercise => {
                  //console.log("Updated exercise for add mg: ", JSON.stringify(updatedExercise));
                  updateWorkout();
                }).catch(err => setError(err instanceof Error ? err.message : "Error updating exercise"));

                return updatedMuscleGroups;

              })

            } else {
              throw new Error ("Error removing muscle Group");
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error Adding Set to exercise");

        } finally {
            setLoading(false);
        }
    }

    async function handleAddSet() {
        try{
            //setLoading(true);
            setError(null);
            
            let weight = 50;
            let reps = 10;
            let rpe = 6;

            if (sets.length > 0){
                const lastSet = sets[sets.length - 1];
                weight = lastSet.Weight;
                reps = lastSet.Reps;
                rpe = lastSet.RPE;
            }

            const newSet = await exSetService.addExSetToExericse(weight, reps, rpe, exercise.ExerciseID);
            //console.log("Set ADDED: ", JSON.stringify(newSet));
            const newExercise = await exerciseService.getExerciseByID(exercise.ExerciseID);
            //console.log("new exercise: ", JSON.stringify(newExercise));

            if (newSet){
              setSets([...sets, newSet]);
              //console.log("Sets after addition: ", JSON.stringify(sets));
              await refreshWorkout();
            }

            updateWorkout();
    
        } catch (err){
            setError(err instanceof Error ? err.message : "Error Adding Set to exercise");

        } finally {
            setLoading(false);
        }

    }

    async function handleRemoveSet(index: number) {
        try{
            //setLoading(true)
            setError(null);

            const setToRemove = sets[index];
            //console.log("Set to remove: ", JSON.stringify(setToRemove));

            if (setToRemove){
                //console.log("Exercise set ID to remove: ", setToRemove.ExSetID);
                const deleted = await exSetService.removeExSetFromExercise(setToRemove.ExSetID, exercise.ExerciseID);
                if (!deleted){
                    throw new Error("Error removing set. Please try again");
                }

                const updatedSets = [...sets];
                updatedSets.splice(index, 1);
                setSets(updatedSets);
                await refreshWorkout();

                updateWorkout();
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error removing Set to exercise");

        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateSet(index: number, field: keyof ExSet, value: number){
        try{
            //setLoading(true);
            setError(null);

            const setToUpdate = sets[index];

            if (setToUpdate){
                const updatedSet = {...setToUpdate, [field]: value};

                const returnedUpdatedSet = await exSetService.updateExSet(updatedSet);

                if (returnedUpdatedSet){
                    const updatedSets = [...sets];
                    updatedSets[index] = updatedSet;
                  

                    setSets(updatedSets);
                    await refreshWorkout();

                    const updatedExercise = await exerciseService.getExerciseByID(updatedSet.ExerciseID);
                    //console.log("Updated Exercise after updating set: ", JSON.stringify(updatedExercise));

                    const updatedWorkout = await workoutService.fetchWorkoutByID(updatedExercise.WorkoutID);
                    //console.log("Updated workout after updating sets: ", JSON.stringify(updatedWorkout));

                    updateWorkout();
                }
            } else {
                throw new Error(`Error updating ${field}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Error updating ${field}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateExerciseName() {
        try{
            setLoading(true)
            setError(null);

            const updatedExercise = {...exercise, ExerciseName: exerciseName};

            const returnedUpdatedExercise = await exerciseService.updateExercise(updatedExercise);

            if (!returnedUpdatedExercise){
                throw new Error("Error updating exercise name");
            }

            setEditingName(false);

            updateWorkout();
        }catch (err) {
            setError(err instanceof Error ? err.message : `Error updating Exercise Name`);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateExerciseType() {
        try{
            setLoading(true);
            setError(null);

            const updatedExercise = {...exercise, ExerciseType: exerciseType};

            const success = await exerciseService.updateExercise(updatedExercise);

            if (!success){
                throw new Error("Error updating exercise type");
            }

            setEditingType(false);
        }catch (err) {
            setError(err instanceof Error ? err.message : `Error updating Exercise Type`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-opacity-95 rounded-xl p-5 h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)', minHeight: '280px' }}>
          {loading && <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-300"></div>
          </div>}
          
          {error && <div className="absolute top-2 right-2 left-2 bg-red-500 bg-opacity-90 text-white p-2 rounded-lg text-sm">{error}</div>}
          
          <div className="flex justify-between items-start mb-4">
            {/* Exercise Name - Editable */}
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="bg-white bg-opacity-10 rounded px-3 py-1 text-white text-xl font-bold border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    autoFocus
                    onBlur={handleUpdateExerciseName}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateExerciseName()}
                  />
                </div>
              ) : (
                <h2 
                  className="text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200"
                  onClick={() => setEditingName(true)}
                >
                  {exerciseName}
                </h2>
              )}
            </div>
            
            {/* Remove Exercise Button */}
            <button
              className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 rounded-full"
              onClick={handleRemoveExercise}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Exercise Type - Editable */}
          <div className="mb-4">
            <p className="text-teal-300 text-sm font-medium mb-1">Exercise Type:</p>
            {editingType ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="bg-white bg-opacity-10 rounded px-3 py-1 text-white text-base border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  autoFocus
                  onBlur={handleUpdateExerciseType}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateExerciseType()}
                />
              </div>
            ) : (
              <p 
                className="text-white text-base cursor-pointer hover:text-gray-300 transition-colors duration-200"
                onClick={() => setEditingType(true)}
              >
                {exerciseType}
              </p>
            )}
          </div>
          
          {/* Sets */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-teal-300 text-sm font-medium">Sets:</p>
              <button
                className="text-teal-300 hover:text-teal-200 transition-colors duration-200 text-sm flex items-center"
                onClick={handleAddSet}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Set
              </button>
            </div>
            
            {sets.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No sets added yet</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 pb-1">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-3">Weight</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3">RPE</div>
                  <div className="col-span-1"></div>
                </div>
                
                {sets.map((set, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2 text-sm text-gray-300">{idx + 1}</div>
                    
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.Weight}
                        onChange={(e) => handleUpdateSet(idx, 'Weight', Number(e.target.value))}
                        className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm border border-transparent focus:border-teal-300 focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.Reps}
                        onChange={(e) => handleUpdateSet(idx, 'Reps', Number(e.target.value))}
                        className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm border border-transparent focus:border-teal-300 focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.RPE}
                        onChange={(e) => handleUpdateSet(idx, 'RPE', Number(e.target.value))}
                        className="w-full bg-white bg-opacity-10 rounded px-2 py-1 text-white text-sm border border-transparent focus:border-teal-300 focus:outline-none"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        onClick={() => handleRemoveSet(idx)}
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Muscle Groups */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="text-teal-300 text-sm font-medium">Muscle Groups:</p>
              <button
                className="text-teal-300 hover:text-teal-200 transition-colors duration-200 text-sm flex items-center"
                onClick={() => setShowMuscleSelector(!showMuscleSelector)}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Group
              </button>
            </div>
            
            {showMuscleSelector && (
              <div className="mb-4">
                <label className="block text-teal-300 mb-2">Select Muscle Group</label>
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
            )}
            
            {muscleGroups.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No muscle groups added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(muscleGroups || []).map((muscleGroup, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white bg-opacity-10 px-3 py-1 rounded-full text-white text-sm flex items-center group"
                  >
                    {muscleGroup.MuscleGroupName}
                    <button
                      className="ml-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => handleRemoveMuscleGroup(idx)}
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    );
}

export default WorkoutExerciseCardComponent;