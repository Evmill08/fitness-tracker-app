import { Workout, User } from "@/interfaces/interfaces";
import { userService } from "@/services/UserService";
import { workoutService } from "@/services/WorkoutService";
import React, { useState, useEffect } from "react";
import {Link, useNavigate } from "react-router-dom";
import UserExerciseCardComponent from "./UserExerciseCardComponent";

function WorkoutHistoryComponent() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
    const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
    const [displayWorkouts, setDisplayWorkouts] = useState<Workout[]>([]);
    const [editingWorkoutName, setEditingWorkoutName] = useState<boolean>(false);
    const [workoutName, setWorkoutName] = useState<string>("");
    const [listOpenWorkouts, setListOpenWorkouts] = useState<boolean[]>([]);
    const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [filterMonth, setFilterMonth] = useState<number | null>(null);
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [availableMonths, setAvailableMonths] = useState<number[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const navigate = useNavigate();
    

    useEffect(() => {
        const initializeData = async () => {
            const currentUser = localStorage.getItem("currentUser");

            try {
                setLoading(true);
                setError(null);

                if (currentUser){
                    const parsedUser = JSON.parse(currentUser) as User;
    
                    if (parsedUser){
                        setUser(parsedUser);
    
                        const userWorkouts = await userService.getUserWorkouts(parsedUser.UserID);
                        const sortedWorkouts = await workoutService.sortWorkoutsByDate(userWorkouts);
    
                        if (sortedWorkouts){
                            setAllWorkouts(sortedWorkouts);
                            setFilteredWorkouts(sortedWorkouts);

                            const months = new Set<number>();
                            const years = new Set<number>();

                            sortedWorkouts.forEach(workout => {
                                const date = new Date(workout.Date);
                                months.add(date.getMonth());
                                years.add(date.getFullYear());
                            });

                            setAvailableMonths(Array.from(months).sort((a,b) => a - b));
                            setAvailableYears(Array.from(years).sort((a, b) => b - a));

                            setListOpenWorkouts(new Array(Math.min(sortedWorkouts.length, itemsPerPage)).fill(false));
                        }
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error fetching user or workouts");
            } finally {
                setLoading(false);
            }
        }

        initializeData();
    }, [navigate]);

    useEffect(() => {
        let filtered = [...allWorkouts];

        if (filterMonth != null && filterYear != null){
            filtered = filtered.filter(workout => {
                const date = new Date(workout.Date);
                return date.getMonth() == filterMonth && date.getFullYear() == filterYear;
            });
        } else if (filterMonth != null){
            filtered = filtered.filter(workout => {
                const date = new Date(workout.Date);
                return date.getMonth() == filterMonth;
            });
        } else if (filterYear != null){
            filtered = filtered.filter(workout => {
                const date = new Date(workout.Date);
                return filterYear == date.getFullYear();
            });
        }

        setFilteredWorkouts(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
    }, [filterMonth, filterYear, allWorkouts, itemsPerPage]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayWorkouts(filteredWorkouts.slice(startIndex, endIndex));
        setListOpenWorkouts(new Array(Math.min(itemsPerPage, filteredWorkouts.length)).fill(false));
    }, [currentPage, filteredWorkouts, itemsPerPage]);


    async function handleUpdateWorkoutName(index: number){
        if (displayWorkouts && index <= displayWorkouts.length){
            if (!workoutName.trim()){
                setWorkoutName(displayWorkouts[index].WorkoutName);
                setEditingWorkoutIndex(null);
                return;
            }
    
            try{
                setLoading(true);
                setError(null);

                const workoutToUpdate = displayWorkouts[index];
                const updatedWorkout = {...workoutToUpdate, WorkoutName: workoutName};

                const returnedUpdatedWorkout = await workoutService.updateWorkout(updatedWorkout);

                if (returnedUpdatedWorkout){

                    const updatedAllWorkouts = allWorkouts.map(w => w.WorkoutID == returnedUpdatedWorkout.WorkoutID ? returnedUpdatedWorkout : w);

                    const updatedFilteredWorkouts = filteredWorkouts.map(w => w.WorkoutID == returnedUpdatedWorkout.WorkoutID ? returnedUpdatedWorkout : w);

                    const updatedDisplayWorkouts = filteredWorkouts.map(w => w.WorkoutID == returnedUpdatedWorkout.WorkoutID ? returnedUpdatedWorkout : w);



                    setAllWorkouts(updatedAllWorkouts);
                    setFilteredWorkouts(updatedFilteredWorkouts);
                    setDisplayWorkouts(updatedDisplayWorkouts);
                    setEditingWorkoutIndex(null);
                }
    
                
            } catch (err){
                setError(err instanceof Error ? err.message : "Error updating workout name");
            } finally {
                setLoading(false);
            }
        }
    }

    async function toggleOpenWorkout(index: number){
        if (index >= 0 && index < listOpenWorkouts.length){
            const updatedList = [...listOpenWorkouts];
            updatedList[index] = !updatedList[index];
            setListOpenWorkouts(updatedList);

        } else {
            console.error("Error opening workout info");
        }
    }

    function startEditingWorkoutName(index: number){
        setEditingWorkoutIndex(index);
        setWorkoutName(displayWorkouts[index].WorkoutName);
    }

    function formatDate(date: Date){
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const formatSeconds = (duration: number) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const remainingSeconds = duration % 60;

        let timeString = "";

        if (hours > 0){
            timeString += `${String(hours).padStart(2, '0')}h `;
        }

        if (hours > 0 || minutes > 0){
            timeString += `${String(minutes).padStart(2, '0')}m `;
        }

        timeString += `${String(remainingSeconds).padStart(2,'0')}s `

        return timeString;
    }

    function getMonthName(monthIndex: number): string {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex]; 
    }

    function clearFilters(){
        setFilterMonth(null);
        setFilterYear(null);
    }

    function handlePageChange(newPage: number){
        if (newPage >= 1 && newPage <= totalPages){
            setCurrentPage(newPage);
            setListOpenWorkouts(new Array(Math.min(itemsPerPage, filteredWorkouts.slice((newPage - 1)*itemsPerPage, newPage*itemsPerPage).length)).fill(false));
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading workout history...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="w-11/12 mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <h2 className="text-2xl font-bold text-yellow-400">Workout History</h2>
                
                {allWorkouts.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                        <div className="flex items-center gap-2">
                            <label htmlFor="month-filter" className="text-sm text-gray-300">Month:</label>
                            <select 
                                id="month-filter"
                                className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
                                value={filterMonth !== null ? filterMonth : ''}
                                onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">All</option>
                                {availableMonths.map(month => (
                                    <option key={`month-${month}`} value={month}>{getMonthName(month)}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label htmlFor="year-filter" className="text-sm text-gray-300">Year:</label>
                            <select 
                                id="year-filter"
                                className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
                                value={filterYear !== null ? filterYear : ''}
                                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">All</option>
                                {availableYears.map(year => (
                                    <option key={`year-${year}`} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        {(filterMonth !== null || filterYear !== null) && (
                            <button 
                                onClick={clearFilters}
                                className="text-teal-300 hover:text-teal-200 text-sm flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {filteredWorkouts.length > 0 ? (
                <>
                    <div className="flex flex-col gap-4">
                        {displayWorkouts.map((workout, index) => (
                            <div className="w-full bg-gray-800 bg-opacity-80 rounded-lg p-5 relative" key={index}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex-grow">
                                        {editingWorkoutIndex === index ? (
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={workoutName}
                                                    onChange={(e) => setWorkoutName(e.target.value)}
                                                    className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-lg font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
                                                    autoFocus
                                                    onBlur={() => handleUpdateWorkoutName(index)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateWorkoutName(index)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                <h3 
                                                    className="text-yellow-400 text-lg font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200 flex items-center"
                                                    onClick={() => startEditingWorkoutName(index)}
                                                >
                                                    {workout.WorkoutName}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-60 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </h3>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-sm text-gray-300">
                                                        <span className="text-teal-300">Date:</span> {formatDate(workout.Date)}
                                                    </span>
                                                    <span className="text-sm text-gray-300">
                                                        <span className="text-teal-300">Duration:</span> {formatSeconds(workout.Duration)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => toggleOpenWorkout(index)}
                                        className={`p-2 text-teal-300 transition-transform duration-300 ${listOpenWorkouts[index] ? 'transform rotate-180' : ''}`}
                                        aria-label={listOpenWorkouts[index] ? 'Hide workout details' : 'Show workout details'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {listOpenWorkouts[index] && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                                        {workout.Exercises && workout.Exercises.length > 0 ? (
                                            workout.Exercises.map((exercise, exerciseIndex) => (
                                                <UserExerciseCardComponent exercise={exercise} key={exerciseIndex}/>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-4 text-gray-400">
                                                No exercises recorded for this workout.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 my-6">
                            <button 
                                onClick={() => handlePageChange(1)} 
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                aria-label="First page"
                            >
                                <span className="sr-only">First</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                aria-label="Previous page"
                            >
                                <span className="sr-only">Previous</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            <div className="text-white px-4">
                                <span className="font-medium">{currentPage}</span> of <span>{totalPages}</span>
                            </div>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                aria-label="Next page"
                            >
                                <span className="sr-only">Next</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={() => handlePageChange(totalPages)} 
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                aria-label="Last page"
                            >
                                <span className="sr-only">Last</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L15.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    {allWorkouts.length > 0 ? (
                        <>
                            <p>No workouts match your current filters.</p>
                            <button 
                                onClick={clearFilters}
                                className="mt-4 text-teal-300 hover:text-teal-200 underline"
                            >
                                Clear filters to see all workouts
                            </button>
                        </>
                    ) : (
                        <>
                            No workouts recorded yet. Start a new workout?

                            <Link to="/workout" className="block mt-4">
                                <button className="py-4 px-8 text-xl font-bold text-gray-900 bg-teal-300 rounded-xl 
                                               transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                                               active:translate-y-0 active:shadow-inner">
                                    Start New Workout
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutHistoryComponent;