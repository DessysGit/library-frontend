/**
 * Admin Dashboard JavaScript
 * Handles data fetching and chart rendering
 */

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://library-backend-j90e.onrender.com';

let genreChart = null;
let userActivityChart = null;

// Check if user is admin
async function checkAdminAccess() {
    try {
        const response = await fetch(`${API_BASE_URL}/current-user`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = 'index.html';
            return false;
        }
        
        const user = await response.json();
        
        if (user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = 'index.html';
        return false;
    }
}

// Fetch and display overall statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const stats = await response.json();
        
        // Update stat cards with animation
        animateValue('total-users', 0, stats.totalUsers, 1000);
        animateValue('total-books', 0, stats.totalBooks, 1000);
        animateValue('total-reviews', 0, stats.totalReviews, 1000);
        animateValue('total-downloads', 0, stats.totalDownloads, 1000);
        
        // Update small text
        document.getElementById('recent-users').textContent = 
            `+${stats.recentUsers} this month`;
        document.getElementById('recent-books').textContent = 
            `+${stats.recentBooks} this month`;
        document.getElementById('avg-rating').textContent = 
            `Avg: ${stats.averageRating.toFixed(1)} ⭐`;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Failed to load statistics');
    }
}

// Animate number counting
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Load and render genre distribution chart
async function loadGenreChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/genre-stats`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch genre stats');
        
        const genres = await response.json();
        
        const ctx = document.getElementById('genreChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (genreChart) {
            genreChart.destroy();
        }
        
        genreChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: genres.map(g => g.genre),
                datasets: [{
                    data: genres.map(g => g.count),
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#11998e', '#38ef7d',
                        '#ffc107', '#17a2b8'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading genre chart:', error);
        document.getElementById('genreChart').parentElement.innerHTML = 
            '<p class="text-center text-muted">Failed to load chart</p>';
    }
}

// Load and render user activity chart
async function loadUserActivityChart() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/user-activity`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch user activity');
        
        const activity = await response.json();
        
        const ctx = document.getElementById('userActivityChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (userActivityChart) {
            userActivityChart.destroy();
        }
        
        // Handle empty data
        if (activity.length === 0) {
            document.getElementById('userActivityChart').parentElement.innerHTML = 
                '<p class="text-center text-muted">No recent user registration data available</p>';
            return;
        }
        
        userActivityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: activity.map(a => new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'New Users',
                    data: activity.map(a => a.count),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#28a745',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading user activity chart:', error);
        document.getElementById('userActivityChart').parentElement.innerHTML = 
            '<p class="text-center text-muted">Failed to load chart</p>';
    }
}

// Load popular books
async function loadPopularBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/popular-books`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch popular books');
        
        const books = await response.json();
        
        const container = document.getElementById('popular-books');
        
        if (books.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No books found</p>';
            return;
        }
        
        container.innerHTML = books.map((book, index) => `
            <div class="book-card">
                <img src="${book.cover || 'https://via.placeholder.com/60x90?text=No+Cover'}" 
                     alt="${book.title}" 
                     onerror="this.src='https://via.placeholder.com/60x90?text=No+Cover'">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${index + 1}. ${book.title}</h6>
                    <p class="mb-1 text-muted small">by ${book.author}</p>
                    <div class="d-flex align-items-center">
                        <span class="badge badge-success mr-2">
                            ${book.reviewCount} reviews
                        </span>
                        <span class="badge badge-warning">
                            ⭐ ${book.avgRating.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading popular books:', error);
        document.getElementById('popular-books').innerHTML = 
            '<p class="text-center text-danger">Failed to load popular books</p>';
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/recent-activity`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch recent activity');
        
        const activities = await response.json();
        
        const container = document.getElementById('recent-activity');
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No recent activity</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => {
            const date = new Date(activity.createdAt);
            const timeAgo = getTimeAgo(date);
            
            let content = '';
            let iconClass = '';
            
            if (activity.type === 'review') {
                content = `
                    <strong>${activity.username}</strong> reviewed 
                    <em>${activity.book_title}</em>
                    <div class="mt-1">
                        <span class="badge badge-warning">⭐ ${activity.rating}/5</span>
                    </div>
                `;
                iconClass = 'review';
            } else if (activity.type === 'user') {
                content = `New user <strong>${activity.username}</strong> joined`;
                iconClass = 'user';
            } else if (activity.type === 'book') {
                content = `New book added: <em>${activity.title}</em> by ${activity.author}`;
                iconClass = 'book';
            }
            
            return `
                <div class="activity-item">
                    <div class="d-flex align-items-center">
                        <div class="activity-icon ${iconClass}">
                            <i class="fas fa-${iconClass === 'review' ? 'star' : iconClass === 'user' ? 'user-plus' : 'book'}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div>${content}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recent-activity').innerHTML = 
            '<p class="text-center text-danger">Failed to load activity</p>';
    }
}

// Load top reviewers
async function loadTopReviewers() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/top-reviewers`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch top reviewers');
        
        const reviewers = await response.json();
        
        const container = document.getElementById('top-reviewers');
        
        if (reviewers.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No reviewers yet</p>';
            return;
        }
        
        container.innerHTML = reviewers.map((reviewer, index) => `
            <div class="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
                <div class="d-flex align-items-center">
                    <div class="mr-3">
                        <span class="badge badge-primary" style="font-size: 1.2rem;">
                            #${index + 1}
                        </span>
                    </div>
                    <div>
                        <h6 class="mb-0">${reviewer.username}</h6>
                        <small class="text-muted">${reviewer.email}</small>
                    </div>
                </div>
                <div class="text-right">
                    <div><strong>${reviewer.reviewCount}</strong> reviews</div>
                    <small class="text-muted">Avg: ${reviewer.avgRating} ⭐</small>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading top reviewers:', error);
        document.getElementById('top-reviewers').innerHTML = 
            '<p class="text-center text-danger">Failed to load top reviewers</p>';
    }
}

// Load books without reviews
async function loadBooksWithoutReviews() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/books-without-reviews`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch books without reviews');
        
        const books = await response.json();
        
        const container = document.getElementById('books-without-reviews');
        
        if (books.length === 0) {
            container.innerHTML = '<p class="text-center text-success">All books have reviews! 🎉</p>';
            return;
        }
        
        container.innerHTML = books.map(book => {
            return `
            <div class="book-card">
                <img src="${book.cover || 'https://via.placeholder.com/60x90?text=No+Cover'}" 
                     alt="${book.title}"
                     onerror="this.src='https://via.placeholder.com/60x90?text=No+Cover'">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${book.title}</h6>
                    <p class="mb-0 text-muted small">by ${book.author}</p>
                </div>
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading books without reviews:', error);
        document.getElementById('books-without-reviews').innerHTML = 
            '<p class="text-center text-danger">Failed to load books</p>';
    }
}

// Utility function to calculate time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
    
    return 'just now';
}

// Show error message
function showError(message) {
    console.error(message);
}

// Initialize dashboard
async function initDashboard() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) return;
    
    // Load all data
    await Promise.all([
        loadStats(),
        loadGenreChart(),
        loadUserActivityChart(),
        loadPopularBooks(),
        loadRecentActivity(),
        loadTopReviewers(),
        loadBooksWithoutReviews()
    ]);
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', initDashboard);

// Refresh data every 5 minutes
setInterval(initDashboard, 5 * 60 * 1000);
