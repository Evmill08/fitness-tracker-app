export interface User{
    UserID: number;
    Username: string;
    Email: string;
    Password: string;
    Weight: number;
    Height: number;
    WorkoutHistory: Workout[];
    PersonalBests: PersonalBest[];
}

export interface Workout{
    WorkoutID: number;
    WorkoutName: string;
    Duration: number;
    Date: Date;
    Exercises: Exercise[],
    UserID: number;
}

export interface Exercise{
    ExerciseID: number;
    ExerciseName: string;
    ExerciseType: string;
    MuscleGroups: MuscleGroup[];
    Sets: ExSet[];
    RestTime: number;
    WorkoutID: number;
}

export interface ExSet{
    ExSetID: number;
    Weight: number;
    Reps: number;
    DateStarted: Date;
    RPE: number;
    ExerciseID: number;
}

export interface PersonalBest{
    ExerciseID: number;
    ExerciseName: string;
    Weight: number;
    Reps: number;
    DateSet: Date;
    UserID: number;
}

export interface MuscleGroup{
    MuscleGroupID: number;
    MuscleGroupName: string;
}

