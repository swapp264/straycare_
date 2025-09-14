// Rescue Cases Management JavaScript

// Global variables
let currentCases = [];
let filteredCases = [];
let currentPage = 1;
const casesPerPage = 2; // Reduced to show multiple pages
let searchHistory = [];
const MAX_HISTORY_ITEMS = 10;

// DOM Elements
const searchInput = document.getElementById('searchCases');
const statusFilter = document.getElementById('statusFilter');
const locationFilter = document.getElementById('locationFilter');
const priorityFilter = document.getElementById('priorityFilter');
const casesGrid = document.getElementById('casesGrid');
const newCaseModal = document.getElementById('newCaseModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing rescue cases page...');
    
    // Ensure interface elements are visible
    ensureInterfaceVisibility();
    
    loadSearchHistory();
    loadCasesFromBackend();
    setupEventListeners();
    createSampleDataIfNeeded();
    
    // Fallback: ensure data is loaded after 2 seconds
    setTimeout(() => {
        if (currentCases.length === 0) {
            console.log('Timeout reached, creating fallback data...');
            createFallbackData();
        }
    }, 2000);
});

// Ensure interface elements are visible
function ensureInterfaceVisibility() {
    console.log('Ensuring interface visibility...');
    
    // Make sure filters section is visible
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        filtersSection.style.display = 'block';
        filtersSection.style.visibility = 'visible';
        console.log('Filters section found and made visible');
    } else {
        console.error('Filters section not found!');
    }
    
    // Make sure search box is visible
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.style.display = 'flex';
        searchBox.style.visibility = 'visible';
        console.log('Search box found and made visible');
    } else {
        console.error('Search box not found!');
    }
    
    // Make sure cases grid is visible
    const casesGrid = document.getElementById('casesGrid');
    if (casesGrid) {
        casesGrid.style.display = 'grid';
        casesGrid.style.visibility = 'visible';
        console.log('Cases grid found and made visible');
    } else {
        console.error('Cases grid not found!');
    }
    
    // Make sure pagination is visible
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = 'flex';
        pagination.style.visibility = 'visible';
        pagination.style.justifyContent = 'center';
        pagination.style.alignItems = 'center';
        pagination.style.gap = '8px';
        pagination.style.marginTop = '20px';
        pagination.style.padding = '10px';
        console.log('Pagination found and made visible');
    } else {
        console.error('Pagination not found!');
    }
}

// Load cases from backend
async function loadCasesFromBackend() {
    try {
        console.log('Loading cases from backend...');
        const response = await fetch('/api/rescue-cases');
        const data = await response.json();
        
        if (data.success && data.cases.length > 0) {
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
            console.log('Loaded cases:', currentCases.length);
        } else {
            console.log('No cases found in backend');
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

// Create sample data if no cases exist
async function createSampleDataIfNeeded() {
    if (currentCases.length === 0) {
        console.log('No cases found, creating sample data...');
        try {
            const response = await fetch('/api/rescue-cases/sample', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Sample data created successfully');
                // Reload cases after creating sample data
                setTimeout(() => {
                    loadCasesFromBackend();
                }, 1000);
            } else {
                console.log('Failed to create sample data, using fallback data');
                createFallbackData();
            }
        } catch (error) {
            console.error('Error creating sample data:', error);
            console.log('Using fallback data instead');
            createFallbackData();
        }
    }
}

// Create fallback data when server is not available
function createFallbackData() {
    console.log('Creating fallback data...');
    currentCases = [
        {
            id: 'fallback1',
            title: 'Injured Dog - Bandra West',
            status: 'pending',
            priority: 'high',
            location: 'bandra',
            reportedBy: 'Priya Sharma',
            locationFull: 'Bandra West, Mumbai',
            reportedTime: '2 hours ago',
            animalType: 'Dog',
            condition: 'Dog with injured leg, limping and unable to walk properly',
            assignedVolunteer: null,
            phone: '+91-9876543210',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback2',
            title: 'Sick Cat - Andheri East',
            status: 'in-progress',
            priority: 'medium',
            location: 'andheri',
            reportedBy: 'Amit Patel',
            locationFull: 'Andheri East, Mumbai',
            reportedTime: '1 day ago',
            animalType: 'Cat',
            condition: 'Cat with respiratory infection, sneezing and difficulty breathing',
            assignedVolunteer: 'Dr. Meera Singh',
            phone: '+91-9876543211',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback3',
            title: 'Abandoned Puppies - Powai',
            status: 'pending',
            priority: 'high',
            location: 'powai',
            reportedBy: 'Rajesh Kumar',
            locationFull: 'Powai, Mumbai',
            reportedTime: '3 hours ago',
            animalType: 'Puppies',
            condition: 'Three puppies found abandoned near Powai Lake. Appear to be 6-8 weeks old',
            assignedVolunteer: null,
            phone: '+91-9876543212',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback4',
            title: 'Elderly Dog - Juhu Beach',
            status: 'in-progress',
            priority: 'medium',
            location: 'juhu',
            reportedBy: 'Sunita Mehta',
            locationFull: 'Juhu Beach, Mumbai',
            reportedTime: '5 hours ago',
            animalType: 'Dog',
            condition: 'Old dog found near Juhu Beach, appears malnourished and weak',
            assignedVolunteer: 'Dr. Priya Singh',
            phone: '+91-9876543213',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback5',
            title: 'Cat Stuck in Tree - Versova',
            status: 'pending',
            priority: 'urgent',
            location: 'versova',
            reportedBy: 'Neha Gupta',
            locationFull: 'Versova, Mumbai',
            reportedTime: '1 hour ago',
            animalType: 'Cat',
            condition: 'Cat has been stuck in a tree for 2 days. Fire department unable to help',
            assignedVolunteer: null,
            phone: '+91-9876543214',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback6',
            title: 'Lost Puppy - Malad',
            status: 'rescued',
            priority: 'medium',
            location: 'malad',
            reportedBy: 'Vikram Singh',
            locationFull: 'Malad, Mumbai',
            reportedTime: '4 hours ago',
            animalType: 'Puppy',
            condition: 'Small puppy found wandering near Malad station, appears lost',
            assignedVolunteer: 'Dr. Priya Singh',
            phone: '+91-9876543215',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback7',
            title: 'Injured Bird - Goregaon',
            status: 'treated',
            priority: 'low',
            location: 'goregaon',
            reportedBy: 'Anita Desai',
            locationFull: 'Goregaon, Mumbai',
            reportedTime: '6 hours ago',
            animalType: 'Bird',
            condition: 'Small bird with injured wing found in park',
            assignedVolunteer: 'Dr. Meera Singh',
            phone: '+91-9876543216',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        },
        {
            id: 'fallback8',
            title: 'Stray Dog - Borivali',
            status: 'adopted',
            priority: 'low',
            location: 'borivali',
            reportedBy: 'Rajesh Patel',
            locationFull: 'Borivali, Mumbai',
            reportedTime: '2 days ago',
            animalType: 'Dog',
            condition: 'Friendly stray dog looking for a home',
            assignedVolunteer: 'Dr. Priya Singh',
            phone: '+91-9876543217',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
        }
    ];
    
    filteredCases = [...currentCases];
    updateCasesDisplay();
    updateStats();
    console.log('Fallback data created:', currentCases.length, 'cases');
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
    console.log('Setting up event listeners...');
    
    // Check if elements exist
    if (!searchInput) {
        console.error('Search input element not found!');
        return;
    }
    
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('focus', showSearchHistory);
    searchInput.addEventListener('blur', hideSearchHistory);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    console.log('Search event listeners added');
    
    // Filter functionality
    if (statusFilter) statusFilter.addEventListener('change', handleFilters);
    if (locationFilter) locationFilter.addEventListener('change', handleFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', handleFilters);
    
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
    console.log('Searching for:', searchTerm);
    console.log('Current cases count:', currentCases.length);
    
    // Save to search history if term is not empty and not already in history
    if (searchTerm !== '' && !searchHistory.includes(searchTerm)) {
        addToSearchHistory(searchTerm);
    }
    
    if (searchTerm === '') {
        filteredCases = [...currentCases];
        console.log('Clearing search, showing all cases');
        showNotification('Showing all rescue cases', 'info');
    } else {
        filteredCases = currentCases.filter(case_ => 
            case_.title.toLowerCase().includes(searchTerm) ||
            case_.reportedBy.toLowerCase().includes(searchTerm) ||
            case_.locationFull.toLowerCase().includes(searchTerm) ||
            case_.animalType.toLowerCase().includes(searchTerm) ||
            case_.condition.toLowerCase().includes(searchTerm)
        );
        console.log('Filtered cases count:', filteredCases.length);
        
        // Show search results notification
        if (filteredCases.length > 0) {
            showNotification(`Found ${filteredCases.length} case(s) matching "${searchTerm}"`, 'success');
        } else {
            showNotification(`No cases found matching "${searchTerm}"`, 'warning');
        }
    }
    
    currentPage = 1;
    updateCasesDisplay();
    updateStats();
    updateSearchResultsDisplay();
}

// Update search results display
function updateSearchResultsDisplay() {
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    // Create or update search results header
    let searchResultsHeader = document.getElementById('searchResultsHeader');
    if (!searchResultsHeader) {
        searchResultsHeader = document.createElement('div');
        searchResultsHeader.id = 'searchResultsHeader';
        searchResultsHeader.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
        `;
        
        // Insert after the cases header
        const casesHeader = document.querySelector('.cases-header');
        if (casesHeader) {
            casesHeader.parentNode.insertBefore(searchResultsHeader, casesHeader.nextSibling);
        }
    }
    
    if (searchTerm && filteredCases.length > 0) {
        searchResultsHeader.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: #333; font-size: 18px;">
                        🔍 Search Results for "${searchTerm}"
                    </h3>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                        Found ${filteredCases.length} case(s) matching your search
                    </p>
                </div>
                <button onclick="clearSearch()" style="
                    padding: 8px 16px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Clear Search</button>
            </div>
        `;
        searchResultsHeader.style.display = 'block';
    } else if (searchTerm && filteredCases.length === 0) {
        searchResultsHeader.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: #e74c3c; font-size: 18px;">
                        🔍 No Results Found for "${searchTerm}"
                    </h3>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                        Try different keywords or check your spelling
                    </p>
                </div>
                <button onclick="clearSearch()" style="
                    padding: 8px 16px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Clear Search</button>
            </div>
        `;
        searchResultsHeader.style.display = 'block';
    } else {
        searchResultsHeader.style.display = 'none';
    }
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
    console.log('Updating cases display...');
    console.log('Total cases:', currentCases.length);
    console.log('Filtered cases:', filteredCases.length);
    
    const startIndex = (currentPage - 1) * casesPerPage;
    const endIndex = startIndex + casesPerPage;
    const casesToShow = filteredCases.slice(startIndex, endIndex);
    
    casesGrid.innerHTML = '';
    
    if (casesToShow.length === 0) {
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        if (searchTerm) {
            casesGrid.innerHTML = `
                <div class="no-cases" style="
                    text-align: center;
                    padding: 40px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #ddd;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3 style="color: #e74c3c; margin-bottom: 10px;">No cases found for "${searchTerm}"</h3>
                    <p style="color: #666; margin-bottom: 20px;">Try searching for different keywords or check your spelling</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="clearSearch()" style="
                            padding: 10px 20px;
                            background: #ff6b35;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Clear Search</button>
                        <button onclick="showSearchSuggestions()" style="
                            padding: 10px 20px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Search Suggestions</button>
                    </div>
                </div>
            `;
        } else {
            casesGrid.innerHTML = `
                <div class="no-cases" style="
                    text-align: center;
                    padding: 40px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #ddd;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                    <h3 style="color: #333; margin-bottom: 10px;">No cases available</h3>
                    <p style="color: #666; margin-bottom: 20px;">Create a new case or check back later</p>
                </div>
            `;
        }
        return;
    }
    
    casesToShow.forEach(case_ => {
        const caseCard = createCaseCard(case_);
        casesGrid.appendChild(caseCard);
    });
    
    console.log('Displayed cases:', casesToShow.length);
    updatePagination();
}

// Clear search function
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        handleSearch();
    }
}

// Show search suggestions
function showSearchSuggestions() {
    const suggestions = [
        'dog', 'cat', 'injured', 'sick', 'abandoned', 'lost', 'stray', 
        'bandra', 'andheri', 'juhu', 'powai', 'versova', 'malad',
        'pending', 'in-progress', 'rescued', 'treated', 'adopted',
        'high', 'medium', 'low', 'urgent'
    ];
    
    const suggestionsHTML = suggestions.map(suggestion => 
        `<span onclick="searchSuggestion('${suggestion}')" style="
            display: inline-block;
            padding: 5px 10px;
            margin: 2px;
            background: #e9ecef;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            color: #495057;
        ">${suggestion}</span>`
    ).join('');
    
    showNotification(`
        <div style="text-align: left;">
            <strong>Search Suggestions:</strong><br>
            <div style="margin-top: 10px;">${suggestionsHTML}</div>
        </div>
    `, 'info', 8000);
}

// Search suggestion click handler
function searchSuggestion(suggestion) {
    if (searchInput) {
        searchInput.value = suggestion;
        handleSearch();
    }
}

// Search History Functions
function loadSearchHistory() {
    try {
        const saved = localStorage.getItem('rescueCasesSearchHistory');
        if (saved) {
            searchHistory = JSON.parse(saved);
            console.log('Loaded search history:', searchHistory);
        }
    } catch (error) {
        console.error('Error loading search history:', error);
        searchHistory = [];
    }
}

function saveSearchHistory() {
    try {
        localStorage.setItem('rescueCasesSearchHistory', JSON.stringify(searchHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

function addToSearchHistory(searchTerm) {
    // Remove if already exists to avoid duplicates
    searchHistory = searchHistory.filter(term => term !== searchTerm);
    
    // Add to beginning
    searchHistory.unshift(searchTerm);
    
    // Keep only the most recent searches
    if (searchHistory.length > MAX_HISTORY_ITEMS) {
        searchHistory = searchHistory.slice(0, MAX_HISTORY_ITEMS);
    }
    
    saveSearchHistory();
    console.log('Added to search history:', searchTerm);
}

function clearSearchHistory() {
    searchHistory = [];
    saveSearchHistory();
    hideSearchHistory();
    console.log('Search history cleared');
}

function showSearchHistory() {
    if (searchHistory.length === 0) return;
    
    // Create or update history dropdown
    let historyDropdown = document.getElementById('searchHistoryDropdown');
    if (!historyDropdown) {
        historyDropdown = document.createElement('div');
        historyDropdown.id = 'searchHistoryDropdown';
        historyDropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        // Position relative to search input
        const searchBox = searchInput.parentElement;
        searchBox.style.position = 'relative';
        searchBox.appendChild(historyDropdown);
    }
    
    // Clear previous content
    historyDropdown.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 8px 12px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        font-size: 12px;
        color: #666;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    header.innerHTML = `
        <span>Recent Searches</span>
        <button onclick="clearSearchHistory()" style="background: none; border: none; color: #ff6b35; cursor: pointer; font-size: 12px;">Clear All</button>
    `;
    historyDropdown.appendChild(header);
    
    // Add history items
    searchHistory.forEach(term => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        item.innerHTML = `
            <span style="color: #666;">🔍</span>
            <span>${term}</span>
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
        });
        
        item.addEventListener('click', () => {
            searchInput.value = term;
            handleSearch();
            hideSearchHistory();
        });
        
        historyDropdown.appendChild(item);
    });
    
    historyDropdown.style.display = 'block';
}

function hideSearchHistory() {
    const historyDropdown = document.getElementById('searchHistoryDropdown');
    if (historyDropdown) {
        // Delay hiding to allow clicks on dropdown items
        setTimeout(() => {
            historyDropdown.style.display = 'none';
        }, 200);
    }
}

function handleSearchKeydown(event) {
    const historyDropdown = document.getElementById('searchHistoryDropdown');
    if (historyDropdown && historyDropdown.style.display === 'block') {
        const items = historyDropdown.querySelectorAll('div[style*="cursor: pointer"]');
        let currentIndex = -1;
        
        // Find currently highlighted item
        items.forEach((item, index) => {
            if (item.style.background === 'rgb(248, 249, 250)') {
                currentIndex = index;
            }
        });
        
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            highlightHistoryItem(items, nextIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            highlightHistoryItem(items, prevIndex);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (currentIndex >= 0 && items[currentIndex]) {
                items[currentIndex].click();
            }
        } else if (event.key === 'Escape') {
            hideSearchHistory();
        }
    }
}

function highlightHistoryItem(items, index) {
    items.forEach((item, i) => {
        item.style.background = i === index ? '#f8f9fa' : 'white';
    });
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
    
    console.log('Updating pagination:', {
        totalPages,
        currentPage,
        filteredCasesLength: filteredCases.length,
        casesPerPage
    });
    
    if (!pagination) {
        console.error('Pagination element not found!');
        return;
    }
    
    let paginationHTML = '';
    
    // Add Previous button
    if (totalPages > 1) {
        paginationHTML += `
            <button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})" style="
                padding: 8px 16px;
                margin: 0 4px;
                border: 1px solid #ddd;
                background: ${currentPage === 1 ? '#f5f5f5' : 'white'};
                color: ${currentPage === 1 ? '#999' : '#333'};
                border-radius: 4px;
                cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};
            ">Previous</button>
        `;
    }
    
    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})" style="
                padding: 8px 12px;
                margin: 0 2px;
                border: 1px solid ${i === currentPage ? '#ff6b35' : '#ddd'};
                background: ${i === currentPage ? '#ff6b35' : 'white'};
                color: ${i === currentPage ? 'white' : '#333'};
                border-radius: 4px;
                cursor: pointer;
                font-weight: ${i === currentPage ? 'bold' : 'normal'};
            ">${i}</button>
        `;
    }
    
    // Add Next button
    if (totalPages > 1) {
        paginationHTML += `
            <button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})" style="
                padding: 8px 16px;
                margin: 0 4px;
                border: 1px solid #ddd;
                background: ${currentPage === totalPages ? '#f5f5f5' : 'white'};
                color: ${currentPage === totalPages ? '#999' : '#333'};
                border-radius: 4px;
                cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};
            ">Next</button>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
    console.log('Pagination HTML updated:', paginationHTML);
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

async function exportCases() {
    try {
        showNotification('Exporting cases data...', 'info');
        
        // Show export format selection modal
        const format = await showExportFormatModal();
        if (!format) return;
        
        // Fetch data from backend
        const response = await fetch(`/api/rescue-cases/export?format=${format}`);
        
        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `rescue_cases_${new Date().toISOString().split('T')[0]}.${format}`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification(`Cases data exported successfully as ${format.toUpperCase()}!`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data. Please try again.', 'error');
    }
}

function showExportFormatModal() {
    return new Promise((resolve) => {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">Export Format</h3>
            <p style="margin: 0 0 25px 0; color: #666; font-size: 16px;">Choose the format for your export:</p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 25px;">
                <button class="export-format-btn" data-format="json" style="
                    padding: 12px 24px;
                    border: 2px solid #ff6b35;
                    background: white;
                    color: #ff6b35;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">JSON</button>
                <button class="export-format-btn" data-format="csv" style="
                    padding: 12px 24px;
                    border: 2px solid #ff6b35;
                    background: white;
                    color: #ff6b35;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">CSV</button>
            </div>
            <button class="cancel-export-btn" style="
                padding: 10px 20px;
                border: 1px solid #ccc;
                background: #f5f5f5;
                color: #666;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add hover effects
        const formatButtons = modalContent.querySelectorAll('.export-format-btn');
        formatButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#ff6b35';
                btn.style.color = 'white';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'white';
                btn.style.color = '#ff6b35';
            });
        });
        
        // Handle format selection
        formatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                document.body.removeChild(modalOverlay);
                resolve(format);
            });
        });
        
        // Handle cancel
        const cancelBtn = modalContent.querySelector('.cancel-export-btn');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            resolve(null);
        });
        
        // Handle overlay click to close
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                resolve(null);
            }
        });
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
