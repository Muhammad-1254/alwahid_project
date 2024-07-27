import { useAppSelector } from "./redux";

export const useUserRole = () =>  useAppSelector((state) => state.auth.data.role);