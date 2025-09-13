// Volunteers Management JavaScript

// Global variables
let currentVolunteers = [];
let medicalReminders = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadVolunteersFromBackend();
    loadMedicalReminders();
    setupEventListeners();
});

// Load volunteers from backend
async function loadVolunteersFromBackend() {
    try {
        const response = await fetch('/api/volunteers');
        const data = await response.json();
        
        if (data.success) {
            currentVolunteers = data.volunteers;
            updateVolunteersDisplay();
        } else {
            showNotification('Failed to load volunteers', 'error');
        }
    } catch (error) {
        console.error('Error loading volunteers:', error);
        showNotification('Failed to load volunteers from server', 'error');
    }
}

// Load medical reminders due today
async function loadMedicalReminders() {
    try {
        const response = await fetch('/api/medical-reminders/today');
        const data = await response.json();
        
        if (data.success) {
            medicalReminders = data.reminders;
            updateMedicalRemindersDisplay();
        } else {
            console.log('No medical reminders for today');
        }
    } catch (error) {
        console.error('Error loading medical reminders:', error);
    }
}

// Update volunteers display
function updateVolunteersDisplay() {
    const volunteersGrid = document.getElementById('volunteersGrid');
    if (!volunteersGrid) return;
    
    volunteersGrid.innerHTML = '';
    
    currentVolunteers.forEach(volunteer => {
        const volunteerCard = createVolunteerCard(volunteer);
        volunteersGrid.appendChild(volunteerCard);
    });
}

// Create volunteer card
function createVolunteerCard(volunteer) {
    const card = document.createElement('div');
    card.className = 'volunteer-card';
    
    card.innerHTML = `
        <div class="volunteer-info">
            <div class="volunteer-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="volunteer-details">
                <h3>${volunteer.name}</h3>
                <p class="volunteer-role">${getRoleDisplay(volunteer.role)}</p>
                <p class="volunteer-contact">
                    <i class="fas fa-envelope"></i> ${volunteer.email}<br>
                    <i class="fas fa-phone"></i> ${volunteer.phone}
                </p>
                <p class="volunteer-availability">
                    <i class="fas fa-clock"></i> Available: ${getAvailabilityDisplay(volunteer.availability)}
                </p>
            </div>
        </div>
        <div class="volunteer-actions">
            <button class="btn-primary btn-sm" onclick="assignTask('${volunteer._id}')">Assign Task</button>
            <button class="btn-secondary btn-sm" onclick="viewSchedule('${volunteer._id}')">View Schedule</button>
        </div>
    `;
    
    return card;
}

// Update medical reminders display
function updateMedicalRemindersDisplay() {
    const remindersContainer = document.getElementById('medicalReminders');
    if (!remindersContainer || medicalReminders.length === 0) return;
    
    // Create reminders section if it doesn't exist
    let remindersSection = document.querySelector('.medical-reminders-section');
    if (!remindersSection) {
        remindersSection = document.createElement('div');
        remindersSection.className = 'medical-reminders-section';
        remindersSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-bell"></i> Medical Reminders - Due Today</h2>
                <p>Vaccination and medical checkups scheduled for today</p>
            </div>
            <div class="reminders-grid" id="remindersGrid"></div>
        `;
        
        // Insert before volunteers section
        const volunteersSection = document.querySelector('.volunteers-section');
        if (volunteersSection) {
            volunteersSection.parentNode.insertBefore(remindersSection, volunteersSection);
        }
    }
    
    const remindersGrid = document.getElementById('remindersGrid');
    remindersGrid.innerHTML = '';
    
    medicalReminders.forEach(reminder => {
        const reminderCard = createReminderCard(reminder);
        remindersGrid.appendChild(reminderCard);
    });
    
    // Show notification about reminders
    if (medicalReminders.length > 0) {
        showNotification(`🔔 ${medicalReminders.length} medical reminder(s) due today!`, 'warning');
    }
}

// Create reminder card
function createReminderCard(reminder) {
    const card = document.createElement('div');
    card.className = 'reminder-card';
    
    card.innerHTML = `
        <div class="reminder-info">
            <div class="reminder-icon">
                <i class="fas fa-syringe"></i>
            </div>
            <div class="reminder-details">
                <h4>${reminder.animalName} (${reminder.animalId})</h4>
                <p class="reminder-type">
                    <strong>Vaccination Due:</strong> ${reminder.vaccinationType || 'General Vaccination'}
                </p>
                <p class="reminder-breed">Breed: ${reminder.breed}</p>
                <p class="reminder-status">Status: ${getHealthStatusDisplay(reminder.healthStatus)}</p>
            </div>
        </div>
        <div class="reminder-actions">
            <button class="btn-primary btn-sm" onclick="scheduleAppointment('${reminder._id}')">
                <i class="fas fa-calendar-plus"></i> Schedule
            </button>
            <button class="btn-secondary btn-sm" onclick="markCompleted('${reminder._id}')">
                <i class="fas fa-check"></i> Mark Done
            </button>
        </div>
    `;
    
    return card;
}

// Helper functions
function getRoleDisplay(role) {
    const roleMap = {
        'animal-care': 'Animal Care Specialist',
        'transport': 'Transport Volunteer',
        'medical': 'Medical Assistant',
        'admin': 'Administrative Support',
        'rescue': 'Rescue Operations'
    };
    return roleMap[role] || role;
}

function getAvailabilityDisplay(availability) {
    const availabilityMap = {
        'weekdays': 'Weekdays (Mon-Fri)',
        'weekends': 'Weekends (Sat-Sun)',
        'flexible': 'Flexible Schedule',
        'mornings': 'Morning Hours',
        'evenings': 'Evening Hours'
    };
    return availabilityMap[availability] || availability;
}

function getHealthStatusDisplay(status) {
    const statusMap = {
        'healthy': 'Healthy',
        'under-treatment': 'Under Treatment',
        'recovered': 'Recovered',
        'critical': 'Critical'
    };
    return statusMap[status] || status;
}

// Action functions
function assignTask(volunteerId) {
    showNotification('Opening task assignment for volunteer...', 'info');
    // TODO: Implement task assignment modal
}

function viewSchedule(volunteerId) {
    showNotification('Opening volunteer schedule...', 'info');
    // TODO: Implement schedule viewer
}

function scheduleAppointment(recordId) {
    showNotification('Scheduling medical appointment...', 'info');
    // TODO: Implement appointment scheduling
}

async function markCompleted(recordId) {
    try {
        // In a real implementation, this would update the medical record
        showNotification('Medical reminder marked as completed!', 'success');
        
        // Remove the reminder from display
        const reminderCard = document.querySelector(`[onclick="markCompleted('${recordId}')"]`).closest('.reminder-card');
        if (reminderCard) {
            reminderCard.remove();
        }
        
        // Update reminders count
        medicalReminders = medicalReminders.filter(r => r._id !== recordId);
        
        if (medicalReminders.length === 0) {
            const remindersSection = document.querySelector('.medical-reminders-section');
            if (remindersSection) {
                remindersSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error marking reminder as completed:', error);
        showNotification('Failed to mark reminder as completed', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchVolunteers');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filter functionality
    const roleFilter = document.getElementById('roleFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (roleFilter) {
        roleFilter.addEventListener('change', handleFilters);
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', handleFilters);
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchVolunteers').value.toLowerCase();
    const volunteerCards = document.querySelectorAll('.volunteer-card');
    
    volunteerCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter functionality
function handleFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    const volunteerCards = document.querySelectorAll('.volunteer-card');
    
    volunteerCards.forEach(card => {
        let showCard = true;
        
        if (roleFilter) {
            const roleText = card.querySelector('.volunteer-role').textContent;
            if (!roleText.toLowerCase().includes(roleFilter.toLowerCase())) {
                showCard = false;
            }
        }
        
        if (availabilityFilter) {
            const availabilityText = card.querySelector('.volunteer-availability').textContent;
            if (!availabilityText.toLowerCase().includes(availabilityFilter.toLowerCase())) {
                showCard = false;
            }
        }
        
        card.style.display = showCard ? '' : 'none';
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for reminders and notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .medical-reminders-section {
        margin-bottom: 2rem;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .medical-reminders-section .section-header h2 {
        color: #856404;
        margin-bottom: 0.5rem;
    }
    
    .medical-reminders-section .section-header p {
        color: #856404;
        margin-bottom: 1rem;
    }
    
    .reminders-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .reminder-card {
        background: white;
        border: 1px solid #ffc107;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .reminder-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }
    
    .reminder-icon {
        background: #ffc107;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .reminder-details h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }
    
    .reminder-details p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #666;
    }
    
    .reminder-actions {
        display: flex;
        gap: 0.5rem;
        flex-direction: column;
    }
    
    .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .btn-primary {
        background: #8B4513;
        color: white;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
    }
`;
document.head.appendChild(style);
