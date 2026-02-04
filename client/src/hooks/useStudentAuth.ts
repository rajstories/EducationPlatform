import { useQuery } from "@tanstack/react-query";

interface StudentUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  studentId?: string;
  profileCompleted?: boolean;
}

export function useStudentAuth() {
  const { data: student, isLoading, error } = useQuery<StudentUser>({
    queryKey: ["/api/student/profile"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    student,
    isLoading,
    isAuthenticated: !!student && !error,
    error
  };
}