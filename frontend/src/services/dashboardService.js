const dashboardService = {
  // getBadHubbitsStatus
  async getBadHubbitsStatus() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/day-goals/dashboard/bad-habits`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`API error status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch bad habits status:', error);
      return { badHabits: [], badHabits_tusus: [] };
    }
  },
};

export default dashboardService;