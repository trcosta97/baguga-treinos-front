import BASE_URL from '../../config';


export async function fetchUserWorkouts(token: string, userId: string) {
  try {
    const response = await fetch(`${BASE_URL}workout/getAll/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user workouts');
    }

    const workoutsData = await response.json();
    return workoutsData;
  } catch (error) {
    console.error(error);
    return null;
  }
}