// Rescue Cases Management JavaScript

// Global variables
let currentCases = [];
let filteredCases = [];
let currentPage = 1;
const casesPerPage = 8;

// DOM Elements
const searchInput = document.getElementById('searchCases');
const statusFilter = document.getElementById('statusFilter');
const locationFilter = document.getElementById('locationFilter');
const priorityFilter = document.getElementById('priorityFilter');
const casesGrid = document.getElementById('casesGrid');
const newCaseModal = document.getElementById('newCaseModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCasesFromBackend();
    setupEventListeners();
});

// Load cases from backend
async function loadCasesFromBackend() {
    try {
        const response = await fetch('/api/rescue-cases');
        const data = await response.json();
        
        if (data.success) {
            currentCases = data.cases.map(case_ => ({
                id: case_._id,
                title: case_.title,
                status: case_.status,
                priority: case_.priority,
                location: case_.location.toLowerCase().split(' ')[0],
                reportedBy: case_.reportedBy,
                locationFull: case_.location,
                reportedTime: formatTimeAgo(case_.createdAt),
                animalType: case_.description.split(',')[0] || 'Animal',
                condition: case_.description,
                assignedVolunteer: case_.assignedVolunteer,
                phone: case_.phone,
                image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
            }));
        } else {
            currentCases = [];
        }
        
        filteredCases = [...currentCases];
        updateCasesDisplay();
        updateStats();
    } catch (error) {
        console.error('Error loading cases:', error);
        showNotification('Failed to load cases from server', 'error');
        currentCases = [];
        filteredCases = [];
        updateCasesDisplay();
    }
}

// Format time ago helper
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
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filter functionality
    statusFilter.addEventListener('change', handleFilters);
    locationFilter.addEventListener('change', handleFilters);
    priorityFilter.addEventListener('change', handleFilters);
    
    // Modal close on outside click
    window.addEventListener('click', function(event) {
        if (event.target === newCaseModal) {
            closeNewCaseModal();
        }
    });
    
    // Form submission
    const caseForm = document.querySelector('.case-form');
    if (caseForm) {
        caseForm.addEventListener('submit', handleNewCaseSubmit);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredCases = [...currentCases];
    } else {
        filteredCases = currentCases.filter(case_ => 
            case_.title.toLowerCase().includes(searchTerm) ||
            case_.reportedBy.toLowerCase().includes(searchTerm) ||
            case_.locationFull.toLowerCase().includes(searchTerm) ||
            case_.animalType.toLowerCase().includes(searchTerm) ||
            case_.condition.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
}

// Handle filter changes
function handleFilters() {
    const statusValue = statusFilter.value;
    const locationValue = locationFilter.value;
    const priorityValue = priorityFilter.value;
    
    filteredCases = currentCases.filter(case_ => {
        const statusMatch = !statusValue || case_.status === statusValue;
        const locationMatch = !locationValue || case_.location === locationValue;
        const priorityMatch = !priorityValue || case_.priority === priorityValue;
        
        return statusMatch && locationMatch && priorityMatch;
    });
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
}

// Update cases display
function updateCasesDisplay() {
    const startIndex = (currentPage - 1) * casesPerPage;
    const endIndex = startIndex + casesPerPage;
    const casesToShow = filteredCases.slice(startIndex, endIndex);
    
    casesGrid.innerHTML = '';
    
    if (casesToShow.length === 0) {
        casesGrid.innerHTML = `
            <div class="no-cases">
                <h3>No cases found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    casesToShow.forEach(case_ => {
        const caseCard = createCaseCard(case_);
        casesGrid.appendChild(caseCard);
    });
    
    updatePagination();
}

// Create case card element
function createCaseCard(case_) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.setAttribute('data-status', case_.status);
    card.setAttribute('data-location', case_.location);
    card.setAttribute('data-priority', case_.priority);
    
    const statusClass = case_.status.replace('-', '');
    const priorityClass = case_.priority;
    
    card.innerHTML = `
        <div class="case-image">
            <img src="${case_.image}" alt="${case_.title}">
            <span class="status-badge ${statusClass}">${getStatusDisplay(case_.status)}</span>
            <span class="priority-badge ${priorityClass}">${getPriorityDisplay(case_.priority)}</span>
        </div>
        <div class="case-info">
            <h3>${case_.title}</h3>
            <div class="case-details">
                <p><strong>Reported by:</strong> ${case_.reportedBy}</p>
                <p><strong>Location:</strong> ${case_.locationFull}</p>
                <p><strong>Reported:</strong> ${case_.reportedTime || 'Recently'}</p>
                ${case_.assignedTo ? `<p><strong>Assigned to:</strong> ${case_.assignedTo}</p>` : ''}
                ${case_.rescuedBy ? `<p><strong>Rescued by:</strong> ${case_.rescuedBy}</p>` : ''}
                ${case_.treatedBy ? `<p><strong>Treated by:</strong> ${case_.treatedBy}</p>` : ''}
                <p><strong>Animal Type:</strong> ${case_.animalType}</p>
                <p><strong>Condition:</strong> ${case_.condition}</p>
            </div>
            <div class="case-actions">
                ${getActionButtons(case_)}
            </div>
        </div>
    `;
    
    return card;
}

// Get status display text
function getStatusDisplay(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'rescued': 'Rescued',
        'treated': 'Treated',
        'adopted': 'Adopted'
    };
    return statusMap[status] || status;
}

// Get priority display text
function getPriorityDisplay(priority) {
    const priorityMap = {
        'high': 'High Priority',
        'medium': 'Medium Priority',
        'low': 'Low Priority'
    };
    return priorityMap[priority] || priority;
}

// Get action buttons based on case status
function getActionButtons(case_) {
    switch (case_.status) {
        case 'pending':
            return `
                <button class="btn-primary" onclick="assignVolunteer('${case_.id}')">Assign Volunteer</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="updateStatus('${case_.id}')">Update Status</button>
            `;
        case 'in-progress':
            return `
                <button class="btn-primary" onclick="updateStatus('${case_.id}')">Update Status</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="addMedicalRecord('${case_.id}')">Medical Record</button>
            `;
        case 'rescued':
            return `
                <button class="btn-primary" onclick="scheduleVaccination('${case_.id}')">Schedule Vaccination</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="prepareAdoption('${case_.id}')">Prepare for Adoption</button>
            `;
        case 'treated':
            return `
                <button class="btn-primary" onclick="scheduleFollowUp('${case_.id}')">Schedule Follow-up</button>
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
                <button class="btn-secondary" onclick="prepareAdoption('${case_.id}')">Prepare for Adoption</button>
            `;
        default:
            return `
                <button class="btn-secondary" onclick="viewCaseDetails('${case_.id}')">View Details</button>
            `;
    }
}

// Update statistics
function updateStats() {
    const total = filteredCases.length;
    const pending = filteredCases.filter(c => c.status === 'pending').length;
    const inProgress = filteredCases.filter(c => c.status === 'in-progress').length;
    const rescued = filteredCases.filter(c => c.status === 'rescued').length;
    
    const statsContainer = document.querySelector('.cases-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <span class="stat">Total: ${total}</span>
            <span class="stat pending">Pending: ${pending}</span>
            <span class="stat in-progress">In Progress: ${inProgress}</span>
            <span class="stat rescued">Rescued: ${rescued}</span>
        `;
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;
    
    let paginationHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
        `;
    }
    
    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateCasesDisplay();
    }
}

// Modal functions
function openNewCaseModal() {
    newCaseModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeNewCaseModal() {
    newCaseModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset form
    const form = document.querySelector('.case-form');
    if (form) form.reset();
}

// Handle new case form submission
async function handleNewCaseSubmit(event) {
    event.preventDefault();
    
    const newCaseData = {
        title: document.getElementById('caseTitle').value,
        description: document.getElementById('condition').value,
        location: document.getElementById('location').value,
        reportedBy: document.getElementById('reporterName').value,
        phone: document.getElementById('reporterPhone').value,
        priority: document.getElementById('priority').value
    };
    
    try {
        const response = await fetch('/api/rescue-cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCaseData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload cases from backend to get updated list
            await loadCasesFromBackend();
            
            // Close modal
            closeNewCaseModal();
            
            // Show success message
            showNotification('New case created successfully!', 'success');
        } else {
            showNotification('Failed to create case: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error creating case:', error);
        showNotification('Failed to create case. Please try again.', 'error');
    }
}

// Action functions
async function assignVolunteer(caseId) {
    try {
        // Fetch available volunteers
        const response = await fetch('/api/volunteers');
        const data = await response.json();
        
        if (data.success && data.volunteers.length > 0) {
            // Create volunteer selection modal
            const modal = createVolunteerAssignmentModal(caseId, data.volunteers);
            document.body.appendChild(modal);
        } else {
            showNotification('No volunteers available for assignment', 'error');
        }
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        showNotification('Failed to load volunteers', 'error');
    }
}

// Create volunteer assignment modal
function createVolunteerAssignmentModal(caseId, volunteers) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assign Volunteer</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="assignVolunteerForm">
                    <div class="form-group">
                        <label for="volunteerSelect">Select Volunteer:</label>
                        <select id="volunteerSelect" required>
                            <option value="">Choose a volunteer...</option>
                            ${volunteers.map(v => `<option value="${v.name}">${v.name} - ${v.role} (${v.availability})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Assign Volunteer</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#assignVolunteerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const volunteerName = document.getElementById('volunteerSelect').value;
        
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
                modal.remove();
                await loadCasesFromBackend();
                showNotification(`Volunteer ${volunteerName} assigned successfully!`, 'success');
            } else {
                showNotification('Failed to assign volunteer', 'error');
            }
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            showNotification('Failed to assign volunteer', 'error');
        }
    });
    
    return modal;
}

function viewCaseDetails(caseId) {
    showNotification('Opening case details...', 'info');
    // TODO: Implement case details modal
}

function updateStatus(caseId) {
    showNotification('Opening status update...', 'info');
    // TODO: Implement status update modal
}

function addMedicalRecord(caseId) {
    showNotification('Opening medical record form...', 'info');
    // TODO: Implement medical record modal
}

function scheduleVaccination(caseId) {
    showNotification('Opening vaccination scheduler...', 'info');
    // TODO: Implement vaccination scheduling
}

function prepareAdoption(caseId) {
    showNotification('Preparing for adoption...', 'info');
    // TODO: Implement adoption preparation
}

function scheduleFollowUp(caseId) {
    showNotification('Opening follow-up scheduler...', 'info');
    // TODO: Implement follow-up scheduling
}

function exportCases() {
    showNotification('Exporting cases data...', 'info');
    // TODO: Implement data export functionality
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
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Add CSS animation for notifications
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
        margin: 0;
    }
    
    .no-cases {
        text-align: center;
        padding: 3rem;
        color: #666;
    }
    
    .no-cases h3 {
        margin-bottom: 1rem;
        color: #8B4513;
    }
`;
document.head.appendChild(style);
