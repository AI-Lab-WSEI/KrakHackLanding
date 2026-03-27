export interface Team {
  id: number;
  team_name: string;
  status: 'pending' | 'confirmed' | 'declined';
  confirm_token: string;
  members: string[];
  contact_email: string;
  confirmed_at: string | null;
  updated_at: string;
}

/**
 * Fetches all attendance records from the database.
 * Requires admin authorization.
 */
export async function getAttendanceData(token?: string): Promise<Team[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch('/api/attendance', { headers });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

/**
 * Fetches a single team by its unique confirmation token.
 * Used by the public confirmation page.
 */
export async function getTeamByToken(token: string): Promise<Team | null> {
  try {
    const response = await fetch(`/api/attendance/token/${token}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching team by token:', error);
    return null;
  }
}

/**
 * Updates a team's attendance status.
 * Publicly accessible via the valid confirmation token.
 */
export async function updateAttendance(token: string, status: 'confirmed' | 'declined'): Promise<boolean> {
  try {
    const response = await fetch('/api/attendance/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, status })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update attendance');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating attendance:', error);
    return false;
  }
}
