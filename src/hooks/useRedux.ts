import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

// Typed useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for auth state
export const useAuthState = () => {
  return useAppSelector((state: RootState) => state.auth);
};
