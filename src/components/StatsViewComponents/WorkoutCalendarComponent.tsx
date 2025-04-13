import ReactCalendarHeatmap from "react-calendar-heatmap";
import { Exercise, Workout, User } from "@/interfaces/interfaces";
import { workoutService } from "@/services/WorkoutService";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/UserService";
import UserExerciseCardComponent from "../ProfileViewComponents/UserExerciseCardComponent";
import "react-calendar-heatmap/dist/styles.css";
import { count } from "console";

interface HeatMapData{
    date: Date,
    count: number
}

interface TooltipState {
    visible: boolean;
    content: string;
    x: number;
    y: number;
}

function WorkoutCalendarComponent() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
    const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
    const [displayValues, setDisplayValues] = useState<HeatMapData[]>([]); 
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState<Date>(new Date(new Date().getFullYear(), 11, 31));
    const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        content: "",
        x: 0,
        y: 0
    });

    const navigate = useNavigate();
    const calendarRef = useRef<HTMLDivElement>(null);

    const formatDate = (workoutDate: Date): string => {
        const date = new Date(workoutDate);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

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
    

    useEffect(() => {
        const initializeData = async () => {
            const currentUser = localStorage.getItem('currentUser');

            try{
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
                            
                            const years = new Set<number>();

                            sortedWorkouts.forEach(workout => {
                                const date = new Date(workout.Date);
                                years.add(date.getFullYear());
                            })

                            const yearsArray = Array.from(years).sort((a, b) => b - a);
                            setAvailableYears(yearsArray);

                            const currentYear = new Date().getFullYear();
                            if (years.has(currentYear)) {
                                setFilterYear(currentYear);
                            } else if (yearsArray.length > 0) {
                                setFilterYear(yearsArray[0]);
                            }
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

        // If we have a filter year, use it
        if (filterYear != null) {
            filtered = filtered.filter(workout => {
                const date = new Date(workout.Date);
                return filterYear === date.getFullYear();
            });
        } else {
            const currentYear = new Date().getFullYear();
            filtered = filtered.filter(workout => {
                const date = new Date(workout.Date);
                return currentYear === date.getFullYear();
            });
        }

        // Probably a better way to do this but this is my way
        let datesArray: HeatMapData[] = new Array<HeatMapData>;
        let dateMap = new Map<Date, number>();

        for (var workout of filtered){
            if (dateMap.has(workout.Date)){
                let count = dateMap.get(workout.Date);
                if (count){
                    dateMap.set(workout.Date, count++);
                }
            } else {
                dateMap.set(workout.Date, 1);
            }
        }

        for (var mapEntry of dateMap){
            datesArray.push({
                date: mapEntry[0],
                count: mapEntry[1],
            })
        }

        setFilteredWorkouts(filtered);
        setDisplayValues(datesArray);

    }, [allWorkouts, filterYear]);

    useEffect(() => {
        try {
            if (filterYear) {
                setStartDate(new Date(filterYear, 0, 1));
                setEndDate(new Date(filterYear, 11, 31));
            } else {
                const currentYear = new Date().getFullYear();
                setStartDate(new Date(currentYear, 0, 1));
                setEndDate(new Date(currentYear, 11, 31));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error setting date range");
        }
    }, [filterYear]);

    function handleToggleYear(year: number){
        try{
            setLoading(true);
            setError(null);
            setFilterYear(year);
            setSelectedWorkouts([]);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Error setting filter year");
        } finally {
            setLoading(false);
        }
    }

    function handleMouseOver(event: React.MouseEvent, value: any){
        if (!value || !value.date) return;

        const date = new Date(value.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Now have list of workouts for a day if someone does more than one
        const workouts = filteredWorkouts.filter(workout => {
            const workoutDate = new Date(workout.Date);
            return workoutDate.toDateString() == date.toDateString();
        })

        let content = formattedDate;
        if (workouts){
            content += ` - ${workouts.length} workouts recorded. `;
        }

        if (workouts.length > 3){
            content += "It is not recommended to workout this many times in one day.";
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const calendarRect = calendarRef.current?.getBoundingClientRect() || {left: 0, top: 0};

        setTooltip({
            visible: true,
            content,
            x: rect.left - calendarRect.left + rect.width / 2,
            y: rect.top - calendarRect.top - 10
        });
    }

    function handleMouseLeave(){
        setTooltip(prev => ({...prev, visible: false}));
    }

    function handleWorkoutClick(value: any){
        if (!value || !value.date) return;

        const date = new Date(value.date);

        // Possible list of workouts for a specific day
        const workoutsFromDate = filteredWorkouts.filter(workout => {
            const workoutDate = new Date(workout.Date);
            return workoutDate.toDateString() == date.toDateString();
        })

        setSelectedWorkouts(workoutsFromDate || []);
    }

    if (loading) {
        return <div className="text-center py-8">Loading workout history...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="w-11/12 mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">Workout Calendar</h2>
                
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    {availableYears.map((year) => (
                        <button
                            key={`year-${year}`}
                            onClick={() => handleToggleYear(year)}
                            className={`px-4 py-1 rounded text-sm transition-colors ${
                                filterYear === year 
                                    ? 'bg-teal-500 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            <div 
                className="calendar-container bg-gray-800 rounded-lg p-4 relative" 
                ref={calendarRef}
            >
                {/* Tooltip */}
                {tooltip.visible && (
                    <div 
                        className="absolute z-10 bg-gray-900 text-white px-3 py-1 rounded text-sm"
                        style={{
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            transform: 'translate(-50%, -100%)'
                        }}
                    >
                        {tooltip.content}
                        <div className="tooltip-arrow" style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: '-4px',
                            marginLeft: '-4px',
                            borderWidth: '4px',
                            borderStyle: 'solid',
                            borderColor: 'rgb(17, 24, 39) transparent transparent transparent'
                        }}></div>
                    </div>
                )}

                {/* Calendar Heatmap */}
                <div className="react-calendar-heatmap-wrapper">
                <style jsx>{`
                    /* Custom styling for the heatmap */
                    :global(.react-calendar-heatmap) {
                        width: 100%;
                    }

                    :global(.react-calendar-heatmap .color-empty) {
                        fill: #374151;
                    }

                    /* Teal color scale for 1-3 workouts */
                    :global(.react-calendar-heatmap .color-1) {
                        fill: #14b8a6;  /* Light teal */
                    }

                    :global(.react-calendar-heatmap .color-2) {
                        fill: #0d9488;  /* Medium teal */
                    }

                    :global(.react-calendar-heatmap .color-3) {
                        fill: #0f766e;  /* Dark teal */
                    }

                    /* Danger color for 4+ workouts */
                    :global(.react-calendar-heatmap .color-danger) {
                        fill: #991b1b;  /* Dark red */
                    }

                    /* Hover states - slightly brighter versions */
                    :global(.react-calendar-heatmap .color-1:hover) {
                        fill: #2dd4c0;
                    }

                    :global(.react-calendar-heatmap .color-2:hover) {
                        fill: #14b8a6;
                    }

                    :global(.react-calendar-heatmap .color-3:hover) {
                        fill: #0f9188;
                    }

                    :global(.react-calendar-heatmap .color-danger:hover) {
                        fill: #dc2626;
                    }

                    :global(.react-calendar-heatmap-week) {
                        height: 25px;
                    }

                    :global(.react-calendar-heatmap-month-label, .react-calendar-heatmap-weekday-label) {
                        fill: #9ca3af;
                        font-size: 9px;
                    }
                `}</style>

                    <ReactCalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={displayValues}
                        showMonthLabels={true}
                        showWeekdayLabels={true}
                        monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                        weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                        onMouseOver={(e, value) => e && handleMouseOver(e as React.MouseEvent, value)}
                        onMouseLeave={handleMouseLeave}
                        onClick={(value) => handleWorkoutClick(value)}
                        classForValue={(value) => {
                            if (!value) return 'color-empty';
                            if (value.count == 1) return 'color-1';
                            if (value.count == 2) return 'color-2';
                            if (value.count == 3) return 'color-3';
                            return 'color-danger';
                        }}
                    />
                </div>
            </div>

            {/* Selected Workout Display */}
            {selectedWorkouts.map((selectedWorkout, idx) => (
                <div key={idx} className="w-full bg-gray-800 bg-opacity-80 rounded-lg p-5 mt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h3 className="text-yellow-400 text-lg font-bold">
                                {selectedWorkout.WorkoutName}
                            </h3>
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-gray-300">
                                    <span className="text-teal-300">Date:</span> {formatDate(selectedWorkout.Date)}
                                </span>
                                {selectedWorkout.Duration && (
                                    <span className="text-sm text-gray-300">
                                        <span className="text-teal-300">Duration:</span> {formatSeconds(selectedWorkout.Duration)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                        {selectedWorkout.Exercises && selectedWorkout.Exercises.length > 0 ? (
                            selectedWorkout.Exercises.map((exercise, exerciseIndex) => (
                                <UserExerciseCardComponent exercise={exercise} key={exerciseIndex}/>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-4 text-gray-400">
                                No exercises recorded for this workout.
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {/* {selectedWorkout && (
                <div className="w-full bg-gray-800 bg-opacity-80 rounded-lg p-5 mt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h3 className="text-yellow-400 text-lg font-bold">
                                {selectedWorkout.WorkoutName}
                            </h3>
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-gray-300">
                                    <span className="text-teal-300">Date:</span> {formatDate(selectedWorkout.Date)}
                                </span>
                                {selectedWorkout.Duration && (
                                    <span className="text-sm text-gray-300">
                                        <span className="text-teal-300">Duration:</span> {formatSeconds(selectedWorkout.Duration)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                        {selectedWorkout.Exercises && selectedWorkout.Exercises.length > 0 ? (
                            selectedWorkout.Exercises.map((exercise, exerciseIndex) => (
                                <UserExerciseCardComponent exercise={exercise} key={exerciseIndex}/>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-4 text-gray-400">
                                No exercises recorded for this workout.
                            </div>
                        )}
                    </div>
                </div>
            )} */}

            {/* No workout selected message */}
            {selectedWorkouts.length == 0 && displayValues.length > 0 && (
                <div className="text-center py-6 text-gray-400">
                    Click on a colored date to view workout details.
                </div>
            )}
            
            {/* No workouts available message */}
            {displayValues.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                    No workouts found for {filterYear || new Date().getFullYear()}.
                </div>
            )}
        </div>
    );
}

export default WorkoutCalendarComponent;