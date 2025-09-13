// Dashboard JavaScript for StrayCare NGO

// Global variables
let currentCases = [];
let volunteers = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    setupEventListeners();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load rescue cases
        const casesResponse = await fetch('/api/rescue-cases');
        const casesData = await casesResponse.json();
        
        if (casesData.success) {
            currentCases = casesData.cases;
            updateRecentCasesDisplay();
        } else {
            console.log('No cases found, creating sample data');
            currentCases = [];
            updateRecentCasesDisplay();
        }
        
        // Load volunteers
        const volunteersResponse = await fetch('/api/volunteers');
        const volunteersData = await volunteersResponse.json();
        
        if (volunteersData.success) {
            volunteers = volunteersData.volunteers;
            console.log('Loaded volunteers:', volunteers.length);
        } else {
            console.log('No volunteers found');
            volunteers = [];
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        // Create fallback data for testing
        createFallbackData();
    }
}

// Create fallback data for testing when backend is not available
function createFallbackData() {
    currentCases = [
        {
            _id: 'test1',
            title: 'Injured Dog - Bandra West',
            status: 'pending',
            priority: 'high',
            location: 'Bandra West, Mumbai',
            reportedBy: 'Priya Sharma',
            phone: '+91-9876543210',
            description: 'Dog with injured leg, limping',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'test2',
            title: 'Sick Cat - Andheri East',
            status: 'in-progress',
            priority: 'medium',
            location: 'Andheri East, Mumbai',
            reportedBy: 'Amit Patel',
            phone: '+91-9876543211',
            description: 'Cat with respiratory infection',
            assignedVolunteer: 'Dr. Meera',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];
    
    volunteers = [
        {
            _id: 'vol1',
            name: 'Dr. Priya Singh',
            email: 'priya@example.com',
            phone: '+91-9876543210',
            role: 'animal-care',
            availability: 'weekdays'
        },
        {
            _id: 'vol2',
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '+91-9876543211',
            role: 'transport',
            availability: 'flexible'
        }
    ];
    
    updateRecentCasesDisplay();
}

// Update recent cases display
function updateRecentCasesDisplay() {
    const casesContainer = document.querySelector('.cases-grid');
    if (!casesContainer) return;
    
    casesContainer.innerHTML = '';
    
    if (currentCases.length === 0) {
        casesContainer.innerHTML = '<div class="loading-message"><p>No recent cases found</p></div>';
        return;
    }
    
    // Show only the 2 most recent cases
    const recentCases = currentCases.slice(0, 2);
    
    recentCases.forEach(case_ => {
        const caseCard = createDashboardCaseCard(case_);
        casesContainer.appendChild(caseCard);
    });
}

// Create dashboard case card
function createDashboardCaseCard(case_) {
    const card = document.createElement('div');
    card.className = 'case-card';
    
    const statusClass = case_.status.replace('-', '');
    const timeAgo = formatTimeAgo(case_.createdAt);
    
    card.innerHTML = `
        <div class="case-image">
            <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop" alt="${case_.title}">
            <span class="status-badge ${statusClass}">${getStatusDisplay(case_.status)}</span>
        </div>
        <div class="case-info">
            <h3>${case_.title}</h3>
            <p>Reported by: ${case_.reportedBy}</p>
            <p>Location: ${case_.location}</p>
            ${case_.assignedVolunteer ? `<p>Assigned to: ${case_.assignedVolunteer}</p>` : ''}
            <p>Reported: ${timeAgo}</p>
            <div class="case-actions">
                ${getDashboardActionButtons(case_)}
            </div>
        </div>
    `;
    
    return card;
}

// Get dashboard action buttons
function getDashboardActionButtons(case_) {
    if (case_.status === 'pending') {
        return `
            <button class="btn-primary" onclick="openVolunteerSelection('${case_._id}')">Assign Volunteer</button>
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    } else if (case_.status === 'in-progress') {
        return `
            <button class="btn-primary" onclick="openStatusUpdate('${case_._id}')">Update Status</button>
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    } else {
        return `
            <button class="btn-secondary" onclick="viewCaseDetails('${case_._id}')">View Details</button>
        `;
    }
}

// Open volunteer selection modal
function openVolunteerSelection(caseId) {
    if (volunteers.length === 0) {
        showNotification('No volunteers available for assignment', 'error');
        return;
    }
    
    const modal = createVolunteerSelectionModal(caseId, volunteers);
    document.body.appendChild(modal);
}

// Create volunteer selection modal
function createVolunteerSelectionModal(caseId, volunteerList) {
    const modal = document.createElement('div');
    modal.className = 'modal volunteer-selection-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> Assign Volunteer to Case</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="volunteer-selection-grid">
                    ${volunteerList.map(volunteer => `
                        <div class="volunteer-option" onclick="selectVolunteer('${caseId}', '${volunteer.name}', '${volunteer._id}')">
                            <div class="volunteer-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="volunteer-info">
                                <h4>${volunteer.name}</h4>
                                <p class="volunteer-role">${getRoleDisplay(volunteer.role)}</p>
                                <p class="volunteer-availability">
                                    <i class="fas fa-clock"></i> ${getAvailabilityDisplay(volunteer.availability)}
                                </p>
                                <p class="volunteer-contact">
                                    <i class="fas fa-phone"></i> ${volunteer.phone}
                                </p>
                            </div>
                            <div class="select-btn">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Select volunteer for assignment
async function selectVolunteer(caseId, volunteerName, volunteerId) {
    try {
        const response = await fetch(`/api/rescue-cases/${caseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assignedVolunteer: volunteerName,
                status: 'in-progress'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.querySelector('.volunteer-selection-modal').remove();
            
            // Reload dashboard data
            await loadDashboardData();
            
            showNotification(`✅ Volunteer ${volunteerName} assigned successfully!`, 'success');
        } else {
            showNotification('Failed to assign volunteer', 'error');
        }
    } catch (error) {
        console.error('Error assigning volunteer:', error);
        showNotification('Failed to assign volunteer', 'error');
    }
}

// Open status update modal
function openStatusUpdate(caseId) {
    const modal = createStatusUpdateModal(caseId);
    document.body.appendChild(modal);
}

// Create status update modal
function createStatusUpdateModal(caseId) {
    const modal = document.createElement('div');
    modal.className = 'modal status-update-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Update Case Status</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="statusUpdateForm">
                    <div class="form-group">
                        <label for="newStatus">Select New Status:</label>
                        <select id="newStatus" required>
                            <option value="">Choose status...</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="statusNotes">Update Notes (Optional):</label>
                        <textarea id="statusNotes" rows="3" placeholder="Add any notes about the status update..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Update Status</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#statusUpdateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateCaseStatus(caseId);
    });
    
    return modal;
}

// Update case status
async function updateCaseStatus(caseId) {
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!newStatus) {
        showNotification('Please select a status', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/rescue-cases/${caseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                notes: notes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            document.querySelector('.status-update-modal').remove();
            
            // Reload dashboard data
            await loadDashboardData();
            
            showNotification(`✅ Case status updated to ${getStatusDisplay(newStatus)}!`, 'success');
        } else {
            showNotification('Failed to update case status', 'error');
        }
    } catch (error) {
        console.error('Error updating case status:', error);
        showNotification('Failed to update case status', 'error');
    }
}

// View case details
function viewCaseDetails(caseId) {
    // Redirect to rescue cases page with case details
    window.location.href = `rescue-cases.html?case=${caseId}`;
}

// Helper functions
function getStatusDisplay(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

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
        'weekdays': 'Weekdays',
        'weekends': 'Weekends',
        'flexible': 'Flexible',
        'mornings': 'Mornings',
        'evenings': 'Evenings'
    };
    return availabilityMap[availability] || availability;
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}

// Setup event listeners
function setupEventListeners() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.remove();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.remove());
        }
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

// Add CSS styles for modals and volunteer selection
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
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #8B4513;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .close {
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    
    .close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .volunteer-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .volunteer-option {
        border: 2px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .volunteer-option:hover {
        border-color: #8B4513;
        background: #f8f9fa;
    }
    
    .volunteer-avatar {
        font-size: 2rem;
        color: #8B4513;
    }
    
    .volunteer-info {
        flex: 1;
    }
    
    .volunteer-info h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
    }
    
    .volunteer-info p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #666;
    }
    
    .volunteer-role {
        font-weight: 500;
        color: #8B4513 !important;
    }
    
    .select-btn {
        font-size: 1.5rem;
        color: #28a745;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
    }
    
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }
    
    .btn-primary, .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .btn-primary {
        background: #8B4513;
        color: white;
    }
    
    .btn-primary:hover {
        background: #6d3410;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #545b62;
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
