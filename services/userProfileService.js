export class UserProfileService {
  constructor() {
    this.userStats = null;
    this.lastUpdated = null;
  }

  async loadUserProfile(uid) {
    try {
      const response = await fetch(`/api/user/${uid}/profile`);
      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading user profile:', error);
      const savedProfile = localStorage.getItem(`userProfile_${uid}`);
      return savedProfile ? JSON.parse(savedProfile) : this.getDefaultProfile();
    }
  }

  getDefaultProfile() {
    return {
      displayName: '',
      bio: '',
      avatar: '',
      preferences: {
        units: 'metric',
        notifications: true,
        theme: 'light'
      }
    };
  }

  async saveUserProfile(uid, profile) {
    try {
      localStorage.setItem(`userProfile_${uid}`, JSON.stringify(profile));
      
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }
}