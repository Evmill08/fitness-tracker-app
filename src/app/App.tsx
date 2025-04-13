'use client'

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPageComponent from '@/views/LoginPageComponent';
import HomeView from '@/views/HomeView';
import ProfileView from '@/views/ProfileView';
import WorkoutView from '@/views/WorkoutView';
import StatsView from '@/views/StatsView';
import AuthLayout from '@/components/AuthLayout';
import ExercisesView from '@/views/ExercisesView';
import { WorkoutProvider } from '@/contexts/WorkoutContext';

function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPageComponent />} />

          <Route element={<AuthLayout/>}>
            <Route path="/home" element={<HomeView />} />
            <Route path="/profile" element={<ProfileView/>} />
            <Route path="/workout" element={<WorkoutView/>} />
            <Route path="/stats" element={<StatsView/>} />
            <Route path="/exercises" element={<ExercisesView/>} />
          </Route>

          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </BrowserRouter>
    </WorkoutProvider>
  );
}

export default App;