import BASE_URL from '../../config';


export async function fetchUserData(token: string, userId: string) {
    try {
      const response = await fetch(`${BASE_URL}user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  