import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Workout, Exercise, MuscleGroup } from "@/interfaces/interfaces";
import { userService } from "@/services/UserService";
import { exerciseService } from "@/services/ExerciseService";
import WorkoutTimerComponent from "@/components/WorkoutViewComponents/WorkoutTimerComponent";
import WorkoutStats from "@/components/WorkoutViewComponents/WorkoutStats";


export const HomeView = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userWorkouts, setUserWorkouts] = useState<Workout[] | null>(null);
    const [userWorkoutCount, setuserWorkoutCount] = useState<number>(0);
    const [userWorkoutTime, setUserWorkoutTime] = useState<string>("0");
    const [userTotalWeight, setUserTotalWeight] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isWorkingOut, setIsWorkingOut] = useState<boolean>(false);
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
    const [workoutData, setWorkoutData] = useState({
        WorkoutName: '',
        Duration: '',
        Date: '',
    })
    const [workoutExercises, setWorkoutExercises] = useState<Exercise[] | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try{
                const storedUser = localStorage.getItem('currentUser');
                //console.log(`Stored user: ${storedUser}`)

                const currentWorkout = localStorage.getItem('currentWorkout');
                const currentWorkoutTimestamp = localStorage.getItem('currentWorkoutTimestamp');
                const now = Date.now();
                if (storedUser){
                    const parsedUser = JSON.parse(storedUser);
                    //console.log("Parsed user in home: ", parsedUser);

                    if (parsedUser && parsedUser.UserID){
                        await fetchUserWorkouts(parsedUser);
                        setUser(parsedUser);
                    } else {
                        navigate('/');
                    }

                    if (currentWorkout && (now - Number(currentWorkoutTimestamp) < 5*60*1000)){
                        const parsedWorkout = JSON.parse(currentWorkout) as Workout;

                        if (parsedUser.UserID == parsedWorkout.UserID){
                            setCurrentWorkout(parsedWorkout);
                            //console.log("user workouts: ", JSON.stringify(userWorkouts));
                            setIsWorkingOut(true);
                        } else {
                            setIsWorkingOut(false);
                            setCurrentWorkout(null);
                        }

                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error initializing data");
            }
        };
        fetchInitialData();
        //testAdd();
        
    }, [navigate]);

    useEffect(() => {
        if (currentWorkout){
            fetchCurrentWorkout();
        }
    }, [currentWorkout]);

    useEffect(() => {
        if (userWorkouts && userWorkouts.length > 0){
            fetchUserWorkoutTime();
            fetchUserTotalWeight();
        }
    }, [userWorkouts]);

    async function fetchUserWorkouts(currentUser: User){
        try{
            setLoading(true);
            setError(null);
            //console.log("User in fetch workouts: ", JSON.stringify(currentUser));
            
            if (!currentUser || !currentUser.UserID){
                throw new Error("User not found");
            }

            const fetchedUserWorkouts = await userService.getMonthlyUserWorkouts(currentUser.UserID);
            //console.log("FetchUserWorkouts");
            //console.log(`UserID: ${currentUser.UserID}, workouts: ${JSON.stringify(fetchedUserWorkouts)}`)
            setuserWorkoutCount(fetchedUserWorkouts.length);
            setUserWorkouts(fetchedUserWorkouts);
            //console.log("Fetched Workouts from function: ", JSON.stringify(userWorkouts));
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching workouts. Please try again.");
        } finally {
            setLoading(false)
        }
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

    async function fetchUserWorkoutTime(){
        try{
            setLoading(true);
            setError(null);

            let totalDuration = 0;
            if (userWorkouts){
                userWorkouts?.forEach((workout: Workout) => {
                    totalDuration += workout.Duration || 0;
                    //console.log(`Workout with ID ${workout.WorkoutID} has duration ${workout.Duration}`);
                });
            }
            
            setUserWorkoutTime(formatSeconds(totalDuration));
            
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching workout times. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    async function fetchUserTotalWeight() {
        try{
            setLoading(true);
            setError(null);

            let totalWeight = 0;

            if (userWorkouts){
                for (const workout of userWorkouts){
                    //console.log(`Processing workout with workoutID: ${workout.WorkoutID}`);
                    //console.log(`Workout: ${JSON.stringify(workout)}`);
                    if (!workout.WorkoutID){
                        console.error("WorkoutID is undefined", workout);
                        continue;
                    }
                    const exercises = await exerciseService.getExercisesByWorkoutID(workout.WorkoutID);
                    //console.log(`Workout with ID ${workout.WorkoutID} has exercises ${JSON.stringify(exercises)}`);

                    for (const exercise of exercises){
                        if (!exercise.ExerciseID){
                            console.error("ExerciseID is undefined", exercise);
                            continue;
                        }
                        //console.log(`Exericse: ${JSON.stringify(exercise)}`);
                        const exerciseWeight = await exerciseService.getTotalExerciseWeight(exercise.ExerciseID);
                        totalWeight += exerciseWeight || 0;
                    }
                }
            }

            setUserTotalWeight(totalWeight.toLocaleString());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error fetching total weight. Please try again.");

        } finally {
            setLoading(false);
        };
    }

    async function fetchCurrentWorkout() {
        try{
            setLoading(true);
            setError(null);

            const workoutJSON = localStorage.getItem("currentWorkout");
            let workout = null;
            if (workoutJSON){
                workout = JSON.parse(workoutJSON) as Workout;
            } else{
                setCurrentWorkout(null);
                setIsWorkingOut(false);
            }

            if (!workout || !workout.WorkoutID){
                throw new Error("Invalid workout data");
            }

            const exercises = await exerciseService.getExercisesByWorkoutID(workout.WorkoutID);
            setWorkoutExercises(exercises);
            setWorkoutData({
                WorkoutName: workout.WorkoutName,
                Date: (workout.Date).toString(),
                Duration: (workout.Duration).toString(),
            });

        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetcing current workout. PLease try again");
        } finally {
            setLoading(false);
        }
    }

    const stats = [
        { statName: "Workouts", stat: userWorkoutCount },
        { statName: "Total Time", stat: userWorkoutTime },
        { statName: "Total Weight", stat: `${userTotalWeight} lbs` }
    ];

    const bgColor = "rgba(18, 41, 43, .95)"

    return (
        <div className="min-h-screen bg-gray-900 p-4 pb-20">
            {loading && <p className="text-white text-center">Loading...</p>}
            {error && <p className="text-red-400 text-center">{error}</p>}

            {/*Fix profile to have correct background color */}
            <Link to="/profile">
                <div className={`w-auto inline-block rounded-xl transition-all duration-300 hover:bg-opacity-20 hover:bg-slate-400 px-6 py-3 active:translate-y-1 active:shadow-inner bg-${bgColor}`}>
                    <h1 className="text-white text-lg font-medium m-0">My Profile</h1>
                </div>
            </Link>
        
            <div className="mx-auto max-w-4xl my-12">
                <div className="month-track mx-auto mb-16 w-full bg-opacity-95 rounded-3xl p-12" 
                    style={{ backgroundColor: bgColor }}>
                    <h1 className="month-title text-white text-4xl font-bold text-center mb-8">This Month</h1>
                    <Link to="/profile" className="workout-stats-link block no-underline text-inherit">
                        <div className="workout-stats w-full p-4 rounded-2xl transition-all duration-300 hover:bg-opacity-10 hover:bg-white hover:shadow-lg hover:scale-105">
                            <ul className="list-none p-0 m-0 flex justify-center gap-4 w-full ">
                                {stats.map((stat, index) => (
                                    <li key={index} className="flex-1 min-w-40">
                                        <div className="stat-container bg-white bg-opacity-10 rounded-xl p-4 text-center">
                                            <h2 className="stat-name text-teal-300 text-lg font-semibold m-0 mb-2">{stat.statName}</h2>
                                            <p className="stat-value text-yellow-400 text-2xl font-bold m-0">{stat.stat}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Current Workout Section with improved styling */}
            <div className="mx-auto max-w-2xl my-16 bg-opacity-95 rounded-3xl p-8 mb-20" 
                style={{ backgroundColor: bgColor }}>
                <h1 className="text-white text-3xl font-bold text-center mb-6">Current Workout: </h1>
                
                {!isWorkingOut ? (
                    <div className="flex justify-center mt-8">
                        <Link to="/workout" className="inline-block">
                            <button className="py-4 px-8 text-xl font-bold text-gray-900 bg-teal-300 rounded-xl 
                                           transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                                           active:translate-y-0 active:shadow-inner">
                                Start New Workout
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-white">
                        <div className="current-workout bg-white bg-opacity-10 rounded-xl p-6 mb-6">
                            {/* Centered workout title and name */}
                            <div className="text-center mb-6">
                                <h2 className="text-teal-300 text-2xl font-bold mb-2">Workout</h2>
                                <p className="text-white text-xl">{workoutData.WorkoutName}</p>
                            </div>

                            <WorkoutTimerComponent/>
                            
                            {/* Workout stats taking 90% width and centered */}
                            <div className="flex justify-center w-full mt-1"> 
                                {currentWorkout && ( 
                                    <div className="w-[90%]">
                                        <WorkoutStats workout={currentWorkout}/>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center mt-8">
                                <Link to="/workout" className="inline-block">
                                    <button className="py-3 px-6 text-lg font-bold text-gray-900 bg-teal-300 rounded-xl 
                                                transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                                                active:translate-y-0 active:shadow-inner">
                                        Go to Workout
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeView;