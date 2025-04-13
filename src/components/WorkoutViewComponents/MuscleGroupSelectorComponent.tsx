import {MuscleGroup } from "@/interfaces/interfaces";
import { muscleGroupService } from "@/services/MuscleGroupService";
import React, { useState, useEffect, useCallback } from "react";

interface MuscleGroupSelectorProps {
    onSelectMuscle: (muscle: MuscleGroup) => void;
}

const MuscleGroupSelectorComponent: React.FC<MuscleGroupSelectorProps> = ({
    onSelectMuscle,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<string>("Select Category");
    const [selectedMuscle, setSelectedMuscle] = useState<string>("Select Muscle Group");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
    const [showMuscleDropdown, setShowMuscleDropdown] = useState<boolean>(false);
    const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
    const [muscleGroupMap, setMuscleGroupMap] = useState<Map<string, MuscleGroup[]>>();

    const fetchMuscleGroupMap = useCallback(async () => {
        try{
            setLoading(true);
            setError(null);
    
            const muscleMap = await muscleGroupService.getMuscleGroupMap();
    
            if (muscleMap.has("Upper") && muscleMap.has("Core") && muscleMap.has("Arms") && muscleMap.has("Lower")){
              setMuscleGroupMap(muscleMap);
            }
    
          } catch(err){
            setError(err instanceof Error ? err.message : "Error fetching muscle group map");
          } finally {
            setLoading(false);
          }

    }, []);

    useEffect(() => {
        fetchMuscleGroupMap();
    }, [fetchMuscleGroupMap]);
    
    async function handleCategoryChange(selectedCategory: string){
        try{
            setLoading(true);
            setError(null);

            if (muscleGroupMap){
                setCategory(selectedCategory);
                setSelectedMuscle("Select Muscle Group");
                setShowMuscleDropdown(true);

                const muscleGroupList = muscleGroupMap.get(selectedCategory);

                if (muscleGroupList){
                    setMuscleGroups(muscleGroupList);
                }

                setShowCategoryDropdown(false);
                setShowMuscleDropdown(true);

            }
        } catch(err){
            setError(err instanceof Error ? err.message : "Error changing category");
        } finally {
            setLoading(false);
        }
    }

    async function handleMuscleChange(mg: MuscleGroup){
        try{
            setLoading(true);
            setError(null);

            setSelectedMuscle(mg.MuscleGroupName);
            onSelectMuscle(mg);
            setShowMuscleDropdown(false);

        } catch(err){
            setError(err instanceof Error ? err.message : "Error changing muscle");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="muscle-group-selector flex space-x-2">
            {/* Category Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                >
                    {category}
                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                    </svg>
                </button>
                
                {showCategoryDropdown && muscleGroupMap && (
                    <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                        <ul className="py-2 text-sm text-gray-700">
                            {Array.from(muscleGroupMap.keys()).map((key) => (
                                <li key={key}>
                                    <button 
                                        onClick={() => handleCategoryChange(key)}
                                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        {key}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Muscle Group Dropdown */}
            {showMuscleDropdown && (
                <div className="relative">
                    <button 
                        onClick={() => setShowMuscleDropdown(!showMuscleDropdown)}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center"
                    >
                        {selectedMuscle}
                        <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </button>
                    
                    <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                        <ul className="py-2 text-sm text-gray-700">
                            {muscleGroups.map((mg) => (
                                <li key={mg.MuscleGroupName}>
                                    <button 
                                        onClick={() => handleMuscleChange(mg)}
                                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        {mg.MuscleGroupName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MuscleGroupSelectorComponent;