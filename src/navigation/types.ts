/**
 * Navigation Types
 * Визначення типів для React Navigation
 */

import { AnalysisResult } from '../types/analysis';

// Root Navigator (перемикання між Auth і Main)
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// Auth Stack (Welcome, Login, Register)
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator (нижні таби)
export type MainTabParamList = {
  HomeTab: undefined;
  GalleryTab: undefined;
  PaletteTab: undefined;
  ProfileTab: undefined;
};

// Home Stack (всередині Home Tab)
export type HomeStackParamList = {
  Home: undefined;
  StartAnalysis: undefined;
  PhotoUpload: undefined;
  AnalysisLoading: { analysisId: string };
  AnalysisResults: { analysisResult: AnalysisResult };
  CelebrityDetails: { celebrities: any[] };
};

// Gallery Stack (всередині Gallery Tab)
export type GalleryStackParamList = {
  Gallery: undefined;
  OutfitDetails: { outfitId: string };
  GenerateOutfit: undefined;
};

// Palette Stack (всередині Palette Tab)
export type PaletteStackParamList = {
  Palette: undefined;
  ColorDetails: { color: string };
  DownloadPalette: undefined;
};

// Profile Stack (всередині Profile Tab)
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MyAnalysis: undefined;
  Settings: undefined;
  Subscription: undefined;
  About: undefined;
  Privacy: undefined;
  Terms: undefined;
};

// Типи для navigation prop
export type NavigationProps = {
  navigation: any;
  route: any;
};
