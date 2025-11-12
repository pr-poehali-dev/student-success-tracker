import { GlobalData, Teacher, ClassRoom, Match } from "@/types";

const SYNC_API_URL = "https://functions.poehali.dev/5f412d00-6e28-4197-9c9d-c71b82e72629";

export const syncFromServer = async (): Promise<GlobalData> => {
  try {
    const response = await fetch(SYNC_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      teachers: data.teachers || [],
      classes: data.classes || [],
      matches: data.matches || []
    };
  } catch (error) {
    console.error("Error syncing from server:", error);
    throw error;
  }
};

export const syncToServer = async (data: {
  teacher?: Teacher;
  classes?: ClassRoom[];
  matches?: Match[];
}): Promise<void> => {
  try {
    console.log("Syncing to server:", {
      hasTeacher: !!data.teacher,
      classesCount: data.classes?.length ?? 0,
      matchesCount: data.matches?.length ?? 0
    });
    
    const response = await fetch(SYNC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Sync to server result:", result);
  } catch (error) {
    console.error("Error syncing to server:", error);
    throw error;
  }
};

export const deleteTeacherFromServer = async (teacherId: string): Promise<void> => {
  try {
    const response = await fetch(SYNC_API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teacherId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Delete teacher result:", result);
  } catch (error) {
    console.error("Error deleting teacher from server:", error);
    throw error;
  }
};