// [file name]: views/profileView.js
import { auth } from '../auth/auth.js';
import { loadTrainingsFromDB } from '../services/database.js';
import { UserProfileService } from '../services/userProfileService.js';

export class ProfileView {
  constructor() {
    this.profileService = new UserProfileService();
    this.userStats = null;
    this.userProfile = null;
  }

  async loadProfile() {
    const user = auth.currentUser;
    if (!user) return;

    const profileContainer = document.getElementById("profile-content");
    if (!profileContainer) return;

    this.showLoading(profileContainer);

    try {
      // Pobierz wszystkie treningi
      const allTrainings = await loadTrainingsFromDB(user.uid, ["running", "swimming", "strength"]);
      
      // Oblicz proste statystyki
      this.userStats = this.calculateSimpleStats(allTrainings);
      
      // Pobierz profil użytkownika
      this.userProfile = await this.profileService.loadUserProfile(user.uid);
      
      this.renderProfile(profileContainer, allTrainings);
    } catch (error) {
      console.error("Error loading profile:", error);
      this.showError(profileContainer, "Błąd ładowania profilu: " + error.message);
    }
  }

  calculateSimpleStats(trainings) {
    const stats = {
      totalTrainings: trainings.length,
      byType: {
        running: trainings.filter(t => t.type === 'running').length,
        swimming: trainings.filter(t => t.type === 'swimming').length,
        strength: trainings.filter(t => t.type === 'strength').length
      },
      recentTrainings: trainings.slice(0, 10), // Pierwsze 10 najnowszych
      volumeStats: {}
    };

    // Oblicz objętość dla siłowni
    const strengthTrainings = trainings.filter(t => t.type === 'strength');
    let totalVolume = 0;
    strengthTrainings.forEach(training => {
      if (training.tasks) {
        training.tasks.forEach(task => {
          const sets = parseInt(task.sets) || 0;
          const reps = parseInt(task.reps) || 0;
          const weight = parseFloat(task.weight) || 0;
          totalVolume += sets * reps * weight;
        });
      }
    });
    stats.volumeStats.strength = Math.round(totalVolume);

    return stats;
  }

  showLoading(container) {
    container.innerHTML = `
      <div class="profile-loading">
        <div class="loading-spinner"></div>
        <p>Ładowanie profilu...</p>
      </div>
    `;
  }

  renderProfile(container, trainings) {
    const user = auth.currentUser;
    
    container.innerHTML = `
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-placeholder">
              ${user.email.charAt(0).toUpperCase()}
            </div>
            <div class="avatar-actions">
              <button class="avatar-btn" onclick="window.changeAvatar()">Zmień</button>
            </div>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">${user.email}</h2>
            ${this.userProfile.displayName ? 
              `<p class="profile-display-name">${this.userProfile.displayName}</p>` : ''}
            <p class="profile-email">${user.email}</p>
            ${this.userProfile.bio ? 
              `<p class="profile-bio">${this.userProfile.bio}</p>` : ''}
          </div>
        </div>

        <div class="profile-stats-section">
          <h3>Statystyki treningów</h3>
          <div class="stats-grid">
            <div class="stat-card large">
              <div class="stat-number">${this.userStats?.totalTrainings || 0}</div>
              <div class="stat-label">Wszystkich treningów</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏃</div>
              <div class="stat-content">
                <div class="stat-number">${this.userStats?.byType?.running || 0}</div>
                <div class="stat-label">Biegowych</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏊</div>
              <div class="stat-content">
                <div class="stat-number">${this.userStats?.byType?.swimming || 0}</div>
                <div class="stat-label">Pływackich</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏋️</div>
              <div class="stat-content">
                <div class="stat-number">${this.userStats?.byType?.strength || 0}</div>
                <div class="stat-label">Siłowych</div>
              </div>
            </div>
            ${this.userStats?.volumeStats?.strength ? `
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-number">${this.userStats.volumeStats.strength}kg</div>
                <div class="stat-label">Łączna objętość</div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="profile-actions">
          <h3>Ustawienia</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label>Wyświetlana nazwa:</label>
              <input type="text" id="display-name" 
                     value="${this.userProfile.displayName || ''}" 
                     placeholder="Twoja nazwa">
            </div>
            <div class="setting-item">
              <label>O mnie:</label>
              <textarea id="profile-bio" 
                        placeholder="Kilka słów o sobie...">${this.userProfile.bio || ''}</textarea>
            </div>
            <div class="setting-item">
              <label>Jednostki:</label>
              <select id="units-preference">
                <option value="metric" ${this.userProfile.preferences?.units === 'metric' ? 'selected' : ''}>Metryczne (km, kg)</option>
                <option value="imperial" ${this.userProfile.preferences?.units === 'imperial' ? 'selected' : ''}>Imperialne (mile, lbs)</option>
              </select>
            </div>
          </div>
          <button onclick="window.saveProfile()" class="save-profile-btn">Zapisz zmiany</button>
        </div>

        <div class="recent-trainings-section">
          <h3>Ostatnie treningi</h3>
          ${this.renderRecentTrainings(trainings)}
        </div>
      </div>
    `;
  }

  renderRecentTrainings(trainings) {
    // Weź 5 najnowszych treningów
    const recentTrainings = trainings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recentTrainings.length === 0) {
      return '<p class="no-recent">Brak ostatnich treningów</p>';
    }

    return `
      <div class="recent-trainings-list">
        ${recentTrainings.map(training => `
          <div class="recent-training-item">
            <div class="recent-type-icon">${this.getTypeIcon(training.type)}</div>
            <div class="recent-info">
              <div class="recent-name">${training.name}</div>
              <div class="recent-meta">
                <span class="recent-type">${this.getTypeName(training.type)}</span>
                <span class="recent-date">${new Date(training.createdAt).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
            <div class="recent-tasks">${training.tasks.length} zadań</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getTypeIcon(type) {
    const icons = { 'running': '🏃', 'swimming': '🏊', 'strength': '🏋️' };
    return icons[type] || '📝';
  }

  getTypeName(type) {
    const names = { 'running': 'Bieganie', 'swimming': 'Pływanie', 'strength': 'Siłownia' };
    return names[type] || type;
  }

  async saveProfile() {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = document.getElementById('display-name')?.value || '';
    const bio = document.getElementById('profile-bio')?.value || '';
    const units = document.getElementById('units-preference')?.value || 'metric';

    const updatedProfile = {
      ...this.userProfile,
      displayName,
      bio,
      preferences: {
        ...(this.userProfile?.preferences || {}),
        units
      }
    };

    try {
      await this.profileService.saveUserProfile(user.uid, updatedProfile);
      this.userProfile = updatedProfile;
      this.showNotification('Profil zaktualizowany pomyślnie');
    } catch (error) {
      console.error("Error saving profile:", error);
      this.showError('Błąd podczas zapisywania profilu: ' + error.message);
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(container, message) {
    container.innerHTML = `
      <div class="error-message">
        <h3>Błąd</h3>
        <p>${message}</p>
        <button onclick="window.location.reload()">Odśwież</button>
      </div>
    `;
  }
}