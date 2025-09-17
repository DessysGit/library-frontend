// Automatic API URL detection based on current environment
const API_BASE_URL = (() => {
  const currentHost = window.location.hostname;
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
  const isNetlify = currentHost.includes('netlify.app');
  
  if (isLocalhost) {
    // Local development
    console.log('🔧 Running in LOCAL development mode');
    return ''; // Same origin for local development
  } else if (isNetlify || window.location.protocol === 'https:') {
    // Production (Netlify or any HTTPS site)
    console.log('🌐 Running in PRODUCTION mode');
    return 'https://library-backend-j90e.onrender.com';
  } else {
    // Fallback
    console.log('⚠️ Unknown environment, using production backend');
    return 'https://library-backend-j90e.onrender.com';
  }
})();

console.log(`📡 API Base URL: ${API_BASE_URL || 'Same Origin'}`);

// Define the seed admin username
const seedAdminUsername = 'admin';

// Initialize user role
let userRole = "";

// Ensure the necessary elements are hidden on initial load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Starting initialization...');
    
    // Show loading state initially
    showLoadingState();
    
    try {
        // Get all UI elements
        const hamburgerButton = document.getElementById('hamburger-button');
        const searchBooksSection = document.getElementById('search-books');
        const manageUsersLink = document.getElementById('manage-users-link');
        const addBookLink = document.getElementById('add-book-link');
        const adminButton = document.getElementById('admin-button');
        const adminSection = document.getElementById('admin-section');
        const profileSection = document.getElementById('profile-section');
        const newsletterSection = document.getElementById('newsletter-section');
        const recommendationsSection = document.getElementById('recommendations-section');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const mainContent = document.getElementById('main-content');
        const footer = document.getElementById('footer');
        const chatIcon = document.getElementById('chat-icon');

        // Hide all sections initially
        const allSections = [
            hamburgerButton, searchBooksSection, manageUsersLink, addBookLink, 
            adminButton, adminSection, profileSection, newsletterSection, 
            recommendationsSection, loginForm, registerForm, mainContent, footer, chatIcon
        ];
        
        allSections.forEach(element => {
            if (element) element.style.display = 'none';
        });

        // Add timeout to prevent infinite loading
        const authCheckPromise = checkAuthStatus();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );

        let isAuthenticated = false;
        try {
            isAuthenticated = await Promise.race([authCheckPromise, timeoutPromise]);
            console.log('Auth check completed:', isAuthenticated);
        } catch (error) {
            console.error('Auth check failed or timed out:', error);
            // Default to showing login form on auth check failure
            isAuthenticated = false;
        }
        
        // Hide loading state
        hideLoadingState();
        
        if (isAuthenticated) {
            console.log('User is authenticated - showing main app');
            // User is authenticated - show main app
            if (hamburgerButton) hamburgerButton.style.display = 'block';
            if (searchBooksSection) searchBooksSection.style.display = 'block';
            if (newsletterSection) newsletterSection.style.display = 'block';
            if (recommendationsSection) recommendationsSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'block';
            if (footer) footer.style.display = 'block';
            if (chatIcon) chatIcon.style.display = 'block';
            
            // Admin-specific elements are handled in checkAuthStatus()
            
            // Only fetch data if we're on the main page with required elements
            const titleInput = document.getElementById('search-title');
            if (titleInput) {
                try {
                    await fetchBooks();
                    console.log('Books fetched successfully');
                } catch (error) {
                    console.error('Error fetching books:', error);
                }
            }
            
            // Only fetch recommendations if section exists
            if (recommendationsSection) {
                try {
                    await fetchRecommendations();
                    console.log('Recommendations fetched successfully');
                } catch (error) {
                    console.error('Error fetching recommendations:', error);
                }
            }
        } else {
            console.log('User is not authenticated - showing login form');
            // User is not authenticated - show login form
            if (loginForm) {
                loginForm.style.display = 'block';
            } else {
                console.error('Login form element not found!');
            }
            
            // Ensure other elements are hidden
            if (registerForm) registerForm.style.display = 'none';
            if (chatIcon) chatIcon.style.display = 'none';
        }
        
        console.log('Initialization completed successfully');
        
    } catch (error) {
        console.error('Critical error during initialization:', error);
        hideLoadingState();
        
        // Fallback: show login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.style.display = 'block';
            console.log('Showed fallback login form');
        }
    }

    // Set up the outside click listener for the sidebar (always do this)
    setupOutsideClickListener();
});

// Functions to show/hide loading state
function showLoadingState() {
    try {
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loader"></div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error showing loading state:', error);
    }
}

function hideLoadingState() {
    try {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    } catch (error) {
        console.error('Error hiding loading state:', error);
    }
}

// Function to check if the user is logged in
function isUserLoggedIn() {
    // Check if a token is present in localStorage
    return localStorage.getItem('authToken') !== null;
}

// Function to handle login
async function login() {
    const emailOrUsername = document.getElementById('login-email-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Clear previous messages
    document.getElementById('login-messages').innerHTML = '';

    if (!emailOrUsername || !password) {
        displayMessage('login-messages', 'Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                emailOrUsername: emailOrUsername,
                password: password 
            })
        });

        if (response.ok) {
            const user = await response.json();
            
            // Set user role
            userRole = user.role;
            
            // Hide login forms and show main app
            const hamburgerButton = document.getElementById('hamburger-button');
            const searchBooksSection = document.getElementById('search-books');
            const manageUsersLink = document.getElementById('manage-users-link');
            const addBookLink = document.getElementById('add-book-link');
            const adminButton = document.getElementById('admin-button');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const resendModal = document.getElementById('resend-verification-modal');
            const newsletterSection = document.getElementById('newsletter-section');
            const mainContent = document.getElementById('main-content');
            const recommendationsSection = document.getElementById('recommendations-section');
            const footer = document.getElementById('footer');

            // Hide forms and show main content
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (resendModal) resendModal.style.display = 'none';
            
            // Show authenticated UI
            if (hamburgerButton) hamburgerButton.style.display = 'block';
            if (searchBooksSection) searchBooksSection.style.display = 'block';
            if (newsletterSection) newsletterSection.style.display = 'block';
            if (recommendationsSection) recommendationsSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'block';
            if (footer) footer.style.display = 'block';

            if (userRole === 'admin') {
                if (manageUsersLink) manageUsersLink.style.display = 'block';
                if (addBookLink) addBookLink.style.display = 'block';
                if (adminButton) adminButton.style.display = 'block';
            }

            // Update sidebar with user info
            const burgerUsername = document.getElementById('burger-username');
            if (burgerUsername) burgerUsername.innerText = user.username;
            
            // Wait a moment for the session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Now make authenticated requests
            try {
                await refreshProfilePicture();
            } catch (error) {
                console.log('Profile picture refresh failed:', error.message);
            }

            // Fetch fresh data
            fetchBooks();
            
            // Fetch recommendations with error handling
            try {
                await fetchRecommendations();
            } catch (error) {
                console.log('Recommendations fetch failed:', error.message);
            }

            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) chatIcon.style.display = 'block';
            
            // Clear form
            document.getElementById('login-email-username').value = '';
            document.getElementById('login-password').value = '';
            
        } else {
            const data = await response.json();
            let errorMessage = data.error || data.message || 'Login failed';
            
            // Handle email verification error specifically
            if (data.error === 'Email not verified') {
                errorMessage = data.message + '<br><small><a href="#" onclick="showResendVerificationWithEmail(\'' + data.userEmail + '\')">Click here to resend verification email</a></small>';
            }
            
            displayMessage('login-messages', errorMessage, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        displayMessage('login-messages', 'Network error. Please try again.', 'error');
    }
}

// Show resend verification form
function showResendVerification() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resendModal = document.getElementById('resend-verification-modal');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (resendModal) resendModal.style.display = 'block';
    
    // Clear messages
    document.getElementById('resend-messages').innerHTML = '';
}

// Hide resend verification form
function hideResendVerification() {
    const resendModal = document.getElementById('resend-verification-modal');
    const loginForm = document.getElementById('login-form');
    
    if (resendModal) resendModal.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    
    // Clear form and messages
    document.getElementById('resend-email').value = '';
    document.getElementById('resend-messages').innerHTML = '';
}

// Resend verification email
async function resendVerification() {
    const email = document.getElementById('resend-email').value.trim();
    
    // Clear previous messages
    document.getElementById('resend-messages').innerHTML = '';

    if (!email) {
        displayMessage('resend-messages', 'Email is required', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        displayMessage('resend-messages', 'Please enter a valid email address', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage('resend-messages', data.message, 'success');
            document.getElementById('resend-email').value = '';
            
            // Additional helpful message
            setTimeout(() => {
                displayMessage('resend-messages', 
                    data.message + '<br><br><strong>Remember:</strong><br>• Check your spam folder<br>• The link expires in 24 hours<br>• Come back here to log in after verifying', 
                    'success'
                );
            }, 2000);
            
            // Automatically go back to login after 6 seconds
            setTimeout(() => {
                hideResendVerification();
                displayMessage('login-messages', 'Verification email sent! Please check your email and click the link.', 'info');
            }, 6000);
            
        } else {
            displayMessage('resend-messages', data.message || data.error || 'Failed to resend verification email', 'error');
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        displayMessage('resend-messages', 'Network error. Please try again.', 'error');
    }
}
// Check if we're on the email verification page
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is a verification page load
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && window.location.pathname.includes('verify-email')) {
        // This is handled by the server route /verify-email
        // No additional JavaScript needed
        return;
    }
    
    // Continue with normal page initialization
    checkAuthStatus();
    setupOutsideClickListener();
    fetchRecommendations();
});

// Function to handle logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        
        if (response.ok) {
            // Clear form inputs
            const loginUsername = document.getElementById('login-username');
            const loginPassword = document.getElementById('login-password');
            if (loginUsername) loginUsername.value = "";
            if (loginPassword) loginPassword.value = "";

            // Clear only auth-related localStorage items - DON'T use localStorage.clear()
            localStorage.removeItem('authState');
            localStorage.removeItem('userData');

            // Get all UI elements that need to be hidden/shown
            const hamburgerButton = document.getElementById('hamburger-button');
            const searchBooksSection = document.getElementById('search-books');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const manageUsersLink = document.getElementById('manage-users-link');
            const addBookLink = document.getElementById('add-book-link');
            const adminButton = document.getElementById('admin-button');
            const adminSection = document.getElementById('admin-section');
            const profileSection = document.getElementById('profile-section');
            const addBookSection = document.getElementById('add-book-section');
            const bookList = document.getElementById('book-list');
            const pagination = document.getElementById('pagination');
            const newsletterSection = document.getElementById('newsletter-section');
            const recommendationsSection = document.getElementById('recommendations-section');
            const mainContent = document.getElementById('main-content');
            const footer = document.getElementById('footer');
            const sidebar = document.getElementById('sidebar');
            const chatIcon = document.getElementById('chat-icon');

            // Hide authenticated user sections
            if (hamburgerButton) hamburgerButton.style.display = 'none';
            if (searchBooksSection) searchBooksSection.style.display = 'none';
            if (manageUsersLink) manageUsersLink.style.display = 'none';
            if (addBookLink) addBookLink.style.display = 'none';
            if (adminButton) adminButton.style.display = 'none';
            if (adminSection) adminSection.style.display = 'none';
            if (profileSection) profileSection.style.display = 'none';
            if (addBookSection) addBookSection.style.display = 'none';
            if (newsletterSection) newsletterSection.style.display = 'none';
            if (recommendationsSection) recommendationsSection.style.display = 'none';
            if (mainContent) mainContent.style.display = 'none';
            if (footer) footer.style.display = 'none';
            if (chatIcon) chatIcon.style.display = 'none';

            // Show login form
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';

            // Clear dynamic content
            if (bookList) bookList.innerHTML = "";
            if (pagination) pagination.innerHTML = "";

            // Clear recommendations carousel
            const recommendationsCarousel = document.querySelector('#recommendations-carousel .carousel-inner');
            if (recommendationsCarousel) recommendationsCarousel.innerHTML = "";

            // Close sidebar if open
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }

            // Clear profile picture elements - NO localStorage clearing
            const profilePicture = document.getElementById('profile-picture');
            const burgerProfilePicture = document.getElementById('burger-profile-picture');
            if (profilePicture) profilePicture.src = '';
            if (burgerProfilePicture) burgerProfilePicture.src = '';

            // Reset global variables
            userRole = "";

            // Redirect to ensure clean state
            window.location.href = "index.html";
        } else {
            alert('Failed to log out');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out');
    }
}

// Function to close the sidebar when clicking outside of it
function closeMenuOnClickOutside(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburgerButton = document.getElementById('hamburger-button');
    if (!sidebar.contains(event.target) && !hamburgerButton.contains(event.target)) {
        sidebar.classList.remove('active');
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}

// Function to set up the outside click listener
function setupOutsideClickListener() {
    document.addEventListener('click', (event) => {
        const sidebar = document.getElementById('sidebar');
        const hamburgerButton = document.getElementById('hamburger-button');

        if (sidebar.classList.contains('active')) {
            const isClickInsideMenu = sidebar.contains(event.target);
            const isClickInsideButton = hamburgerButton.contains(event.target);

            if (!isClickInsideMenu && !isClickInsideButton) {
                sidebar.classList.remove('active');
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        }
    });
}

// Function to handle newsletter subscription
async function subscribeNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('subscription-email').value;
    const response = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });
    if (response.ok) {
        alert('Subscribed successfully');
        document.getElementById('subscription-email').value = ""; // Clear the input field
    } else {
        const errorMessage = await response.text();
        alert('Failed to subscribe: ' + errorMessage);
    }
}

// Function to toggle the sidebar menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        document.addEventListener('click', closeMenuOnClickOutside);
    } else {
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}

// Function to show specific sections
async function showSection(sectionId) {
    const sections = document.querySelectorAll('#register-form, #login-form, #search-books, #profile-section, #admin-section, #add-book-section, #recommendations-section, .newsletter-section');
    sections.forEach(section => {
        if (section) section.style.display = section.id === sectionId ? 'block' : 'none';
    });

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset the search inputs and recommendations when switching sections
    const searchTitle = document.getElementById('search-title');
    const searchAuthor = document.getElementById('search-author');
    const searchGenre = document.getElementById('search-genre');
    const bookList = document.getElementById('book-list');
    const pagination = document.getElementById('pagination');
    const recommendationsCarousel = document.querySelector('#recommendations-carousel .carousel-inner');

    if (sectionId === 'search-books') {
        fetchBooks();
    } else {
        if (searchTitle) searchTitle.value = "";
        if (searchAuthor) searchAuthor.value = "";
        if (searchGenre) searchGenre.value = "";
        if (bookList) bookList.innerHTML = "";
        if (pagination) pagination.innerHTML = "";
        if (recommendationsCarousel) recommendationsCarousel.innerHTML = "";
    }

    // Hide newsletter, footer, and recommendations sections for non-main sections
    const footer = document.getElementById('footer');
    const newsletterSection = document.getElementById('newsletter-section');
    const recommendationsSection = document.getElementById('recommendations-section');
    if (sectionId === 'search-books') {
        if (footer) footer.style.display = 'block';
        if (newsletterSection) newsletterSection.style.display = 'block';
        if (recommendationsSection) recommendationsSection.style.display = 'block';
    } else {
        if (footer) footer.style.display = 'none';
        if (newsletterSection) newsletterSection.style.display = 'none';
        if (recommendationsSection) recommendationsSection.style.display = 'none';
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active'); // Ensure sidebar is closed after selecting a section
    }

    // Fetch users when the "Manage Users" section is shown
    if (sectionId === 'admin-section') {
        fetchUsers();
    }

    // Fetch recommendations when the "Recommendations" section is shown
    if (sectionId === 'recommendations-section') {
        fetchRecommendations();
    }

    // Refresh profile picture when showing profile section
    if (sectionId === 'profile-section') {
        fetchProfile();
        await refreshProfilePicture();
        disableProfileEditing();
    }

    // Hide Add Book section if user is not admin
    if (sectionId === 'add-book-section' && userRole !== 'admin') {
        alert('You do not have access to this section.');
        showSection('search-books');
    }
}

// Add a reusable function to handle fetch errors
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred: ' + error.message);
        throw error;
    }
}

// Using fetchWithErrorHandling in fetchBooks
async function fetchBooks(query = "", page = 1) {
    console.log('fetchBooks called with query:', query, 'page:', page);
    
    const titleInput = document.getElementById('search-title');
    const authorInput = document.getElementById('search-author');
    const genreInput = document.getElementById('search-genre');

    // Check if we're on the correct page with search inputs
    if (!titleInput || !authorInput || !genreInput) {
        console.log("fetchBooks: Not on main search page, skipping fetch.");
        return;
    }

    const title = titleInput ? titleInput.value : query;
    const author = authorInput ? authorInput.value : "";
    const genre = genreInput ? genreInput.value : "";

    const limit = 10;
    const searchQuery = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&genre=${encodeURIComponent(genre)}&page=${page}&limit=${limit}`;

    // Show the searching message
    const searchingMsg = document.getElementById('searching-msg');
    if (searchingMsg) searchingMsg.style.display = 'block';

    try {
        console.log('Fetching books with query:', searchQuery);
        showLoadingSpinner();
        
        const response = await fetch(`${API_BASE_URL}/books?${searchQuery}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Books data received:', data.books?.length || 0, 'books');
        
        const books = data.books || [];
        const totalBooks = data.total || 0;
        const totalPages = Math.ceil(totalBooks / limit);
        const bookList = document.getElementById('book-list');
        const pagination = document.getElementById('pagination');
        const noResultsMessage = document.getElementById('no-results-message');

        // Display message if no books are found
        if (books.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
        } else {
            if (noResultsMessage) noResultsMessage.style.display = 'none';
        }

        // Update the book list
        if (bookList) {
            bookList.innerHTML = "";
            books.forEach(book => {
                // Fix: prepend API_BASE_URL if cover is a relative path
                let coverUrl = book.cover || '';
                if (coverUrl && coverUrl.startsWith('/uploads/')) {
                    coverUrl = API_BASE_URL + coverUrl;
                }
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item');
                bookItem.id = `book-${book.id}`;
                bookItem.innerHTML = `
                    ${userRole === 'admin' ? `
                        <div class="delete-action">
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteBook(${book.id}, '${(book.title || '').replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    ` : ''}
                    <img src="${coverUrl || '/default-book-cover.png'}" alt="Cover Image" onerror="this.src='/default-book-cover.png'">
                    <div class="details">
                        <div class="details-content">
                            <div class="main-info">
                                <h5>${book.title || 'No Title'}</h5>
                                <p><strong>Author: </strong> ${book.author || 'Unknown'}</p>
                                <p class="description-text">${book.description || 'No description available'}</p>
                            </div>
                        </div>
                        <div class="like-dislike-ratings">
                            <div class="like-dislike-buttons">
                                <button class="like-button" onclick="handleLikeDislike(${book.id}, 'like')">👍 ${book.likes || 0}</button>
                                <button class="dislike-button" onclick="handleLikeDislike(${book.id}, 'dislike')">👎 ${book.dislikes || 0}</button>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="showBookDetails(${book.id})">Download</button>
                            <div class="ratings">
                                <span>
                                    <i class="fas fa-star text-warning"></i> 
                                    ${book.averageRating ? book.averageRating.toFixed(1) : 'N/A'} (${book.totalRatings || 0} ratings)
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                bookList.appendChild(bookItem);

                // Highlight the like/dislike buttons based on user action
                const userAction = getUserAction(book.id);
                updateLikeDislikeUI(book.id, book.likes || 0, book.dislikes || 0, userAction);
            });
        }

        // Clear and update the pagination
        if (pagination) {
            pagination.innerHTML = "";
            for (let i = 1; i <= totalPages; i++) {
                const pageItem = document.createElement('li');
                pageItem.classList.add('page-item');
                if (i === page) {
                    pageItem.classList.add('active');
                }
                pageItem.innerHTML = `<button class="page-link" onclick="fetchBooks('${title}', ${i})">${i}</button>`;
                pagination.appendChild(pageItem);
            }
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        const bookList = document.getElementById('book-list');
        if (bookList) {
            bookList.innerHTML = '<p class="text-center text-danger">Error loading books. Please try again.</p>';
        }
    } finally {
        hideLoadingSpinner();
        // Hide the searching message
        if (searchingMsg) searchingMsg.style.display = 'none';
    }

    // Force the page to scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateLikeDislikeUI(bookId, likes, dislikes, action) {
    const likeButton = document.querySelector(`#book-${bookId} .like-button`);
    const dislikeButton = document.querySelector(`#book-${bookId} .dislike-button`);

    if (likeButton) {
        likeButton.innerHTML = `👍 ${likes}`;
        likeButton.classList.toggle('active', action === 'like'); // Highlight if liked
    }
    if (dislikeButton) {
        dislikeButton.innerHTML = `👎 ${dislikes}`;
        dislikeButton.classList.toggle('active', action === 'dislike'); // Highlight if disliked
    }
}

function getUserAction(bookId) {
    return localStorage.getItem(`book-${bookId}-reaction`);
}

// Function to clear search fields
function clearSearchFields() {
    const searchTitle = document.getElementById('search-title');
    const searchAuthor = document.getElementById('search-author');
    const searchGenre = document.getElementById('search-genre');

    if (searchTitle) searchTitle.value = "";
    if (searchAuthor) searchAuthor.value = "";
    if (searchGenre) searchGenre.value = "";
}

function toggleAdvancedFilters() {
    const filters = document.getElementById('advanced-filters');
    filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
  }
  

// Add loading spinner functions
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'block';
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

// Function to fetch users and update the user list
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
        if (response.ok) {
            const users = await response.json();
            const userList = document.getElementById('user-list');
            if (userList) {
                userList.innerHTML = ""; // Clear the list before rendering
                users.forEach(user => {
                    const userItem = document.createElement('tr');
                    userItem.innerHTML = `
  <tr>
    <td>${user.username}</td>
    <td>${user.role}</td>
    <td class="text-center">
      ${user.username !== seedAdminUsername ? `
        ${user.role !== 'admin' ? `
          <button class="btn btn-success btn-sm mb-1" onclick="grantAdmin(${user.id})">Grant Admin</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${user.id}, '${user.username}')">Delete</button>
        ` : `
          <button class="btn btn-revoke btn-sm" onclick="revokeAdmin(${user.id})">Revoke Admin</button>
        `}
      ` : '<span class="text-muted">Protected</span>'}
    </td>
  </tr>
`;
                    userList.appendChild(userItem);
                });
            }
        } else {
            console.error('Failed to fetch users:', await response.text());
            alert('Failed to fetch users.');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('An error occurred while fetching users.');
    }
}

// Function to grant admin role to a user
async function grantAdmin(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/grant-admin`, { method: 'POST', credentials: 'include' });
    if (response.ok) {
        fetchUsers(); // Refresh user list after granting admin role
    } else {
        const errorMessage = await response.text();
        alert('Failed to grant admin role: ' + errorMessage);
    }
}

// Function to revoke admin role from a user
async function revokeAdmin(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/revoke-admin`, { method: 'POST', credentials: 'include' });
    if (response.ok) {
        fetchUsers(); // Refresh user list after revoking admin role
    } else {
        const errorMessage = await response.text();
        alert('Failed to revoke admin role: ' + errorMessage);
    }
}

// Function to delete a user
async function deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { 
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok) {
        fetchUsers(); // Refresh user list after deleting user
    } else {
        const errorMessage = await response.text();
        alert('Failed to delete user: ' + errorMessage);
    }
}

function confirmDeleteUser(userId, username) {
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        deleteUser(userId);
    }
}

// Function to add a book
async function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const description = document.getElementById('description').value;
    const genres = document.getElementById('genres').value.split(",").map(genre => genre.trim());
    const bookCover = document.getElementById('book-cover').files[0];
    const bookFile = document.getElementById('book-file').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('genres', JSON.stringify(genres));

    if (bookCover) formData.append('cover', bookCover); 
    if (bookFile) formData.append('bookFile', bookFile);

    try {
        const response = await fetch(`${API_BASE_URL}/addBook`, { 
            method: 'POST', 
            body: formData, 
            credentials: 'include' 
        });
        if (response.ok) {
            alert('Book added successfully');
            clearAddBookFields(); // Clear fields after successful addition
            showSection('search-books');
        } else {
            const errorMessage = await response.text();
            alert('Failed to add book: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book: ' + error.message);
    }
}


// Function to clear add book fields
function clearAddBookFields() {
    document.getElementById('title').value = "";
    document.getElementById('author').value = "";
    document.getElementById('description').value = "";
    document.getElementById('genres').value = "";
    document.getElementById('book-cover').value = "";
    document.getElementById('book-file').value = "";
}

// Function to edit a book
async function editBook(bookId) {
    const title = prompt('Enter new title:');
    const author = prompt('Enter new author:');
    const description = prompt('Enter new description:');
    if (title && author && description) {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, description })
        });
        if (response.ok) {
            fetchBooks();
        } else {
            const errorMessage = await response.text();
            alert('Failed to edit book: ' + errorMessage);
        }
    }
}

// Function to delete a book
async function deleteBook(bookId) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, { method: 'DELETE', credentials: 'include' });
    if (response.ok) {
        fetchBooks();
    } else {
        const errorMessage = await response.text();
        alert('Failed to delete book: ' + errorMessage);
    }
}
function confirmDeleteBook(bookId, bookTitle) {
    if (confirm(`Are you sure you want to delete the book "${bookTitle}"?`)) {
        deleteBook(bookId);
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Username validation function
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username) && username.length >= 3;
}

function showResendVerificationWithEmail(email) {
    showResendVerification();
    if (email) {
        document.getElementById('resend-email').value = email;
    }
}

// Display message function
function displayMessage(elementId, message, type = 'error') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        let alertClass = 'alert-danger'; // default
        if (type === 'success') alertClass = 'alert-success';
        if (type === 'info') alertClass = 'alert-info';
        
        messageElement.innerHTML = `<div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="this.parentElement.style.display='none'"></button>
        </div>`;
        
        // Auto-hide success messages after 8 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.innerHTML.includes('alert-success')) {
                    messageElement.innerHTML = '';
                }
            }, 8000);
        }
        
        // Auto-hide info messages after 10 seconds
        if (type === 'info') {
            setTimeout(() => {
                if (messageElement.innerHTML.includes('alert-info')) {
                    messageElement.innerHTML = '';
                }
            }, 10000);
        }
    }
}

// Function to register a new user
async function register() {
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Clear previous messages
    document.getElementById('register-messages').innerHTML = '';

    // Client-side validation
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    if (!username) {
        errors.push('Username is required');
    } else if (!isValidUsername(username)) {
        errors.push('Username must be at least 3 characters and contain only letters, numbers, and underscores');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!confirmPassword) {
        errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        displayMessage('register-messages', errors.join('<br>'), 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage('register-messages', data.message, 'success');
            
            // Clear form
            document.getElementById('register-email').value = '';
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-confirm-password').value = '';
            
            // Show additional message about checking email
            setTimeout(() => {
                displayMessage('register-messages', 
                    data.message + '<br><br><strong>Next steps:</strong><br>1. Check your email inbox (and spam folder)<br>2. Click the verification link<br>3. Return here to log in', 
                    'success'
                );
            }, 1000);
            
            // Automatically show login form after 5 seconds
            setTimeout(() => {
                showLoginForm();
                displayMessage('login-messages', 'Please check your email and click the verification link, then log in here.', 'info');
            }, 5000);
            
        } else {
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(error => error.msg).join('<br>');
                displayMessage('register-messages', errorMessages, 'error');
            } else {
                displayMessage('register-messages', data.error || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        displayMessage('register-messages', 'Network error. Please try again.', 'error');
    }
}

// Function to show the login form
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resendModal = document.getElementById('resend-verification-modal');
    const mainContent = document.getElementById('main-content');
    const newsletterSection = document.getElementById('newsletter-section');
    const recommendationsSection = document.getElementById('recommendations-section');
    const hamburgerButton = document.getElementById('hamburger-button');
    const searchBooksSection = document.getElementById('search-books');
    const footer = document.getElementById('footer');
    const adminButton = document.getElementById('admin-button');
    const profileSection = document.getElementById('profile-section');
    const manageUsersLink = document.getElementById('manage-users-link');

    // Show login form and hide others
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (resendModal) resendModal.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (newsletterSection) newsletterSection.style.display = 'none';
    if (recommendationsSection) recommendationsSection.style.display = 'none';
    if (hamburgerButton) hamburgerButton.style.display = 'none';
    if (searchBooksSection) searchBooksSection.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (adminButton) adminButton.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
    if (manageUsersLink) manageUsersLink.style.display = 'none';
    
    // Clear messages
    document.getElementById('login-messages').innerHTML = '';
}

// Function to show the registration form
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resendModal = document.getElementById('resend-verification-modal');

    // Show registration form and hide others
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (resendModal) resendModal.style.display = 'none';
    
    // Clear messages
    document.getElementById('register-messages').innerHTML = '';
}

// Add enter key support for forms
document.addEventListener('DOMContentLoaded', () => {
    // Login form enter key
    const loginEmailUsername = document.getElementById('login-email-username');
    const loginPassword = document.getElementById('login-password');
    
    if (loginEmailUsername) {
        loginEmailUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    // Register form enter key
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') register();
        });
    }
    
    // Resend verification form enter key
    const resendEmail = document.getElementById('resend-email');
    if (resendEmail) {
        resendEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') resendVerification();
        });
    }
});

// Function to enable profile editing
function enableProfileEditing() {
    document.getElementById('profile-email').disabled = false;
    document.getElementById('profile-genres').disabled = false;
    document.getElementById('profile-authors').disabled = false;
    document.getElementById('profile-books').disabled = false;
    document.getElementById('edit-profile-button').style.display = 'none';
    document.getElementById('save-profile-button').style.display = 'block';
}

// Function to disable profile editing
function disableProfileEditing() {
    document.getElementById('profile-email').disabled = true;
    document.getElementById('profile-genres').disabled = true;
    document.getElementById('profile-authors').disabled = true;
    document.getElementById('profile-books').disabled = true;
    document.getElementById('edit-profile-button').style.display = 'block';
    document.getElementById('save-profile-button').style.display = 'none';
}

// Function to update user profile
async function updateProfile() {
    const email = document.getElementById('profile-email').value;
    const password = document.getElementById('profile-password').value;
    const favoriteGenres = document.getElementById('profile-genres').value;
    const favoriteAuthors = document.getElementById('profile-authors').value;
    const favoriteBooks = document.getElementById('profile-books').value;

    const response = await fetch(`${API_BASE_URL}/updateProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, favoriteGenres, favoriteAuthors, favoriteBooks })
    });

    if (response.ok) {
        alert('Profile updated successfully');
        fetchProfile();
        disableProfileEditing();
    } else {
        const errorMessage = await response.text();
        alert('Failed to update profile: ' + errorMessage);
    }
}

// Function to upload profile picture
async function uploadProfilePicture() {
    const fileInput = document.getElementById('profile-picture-input');
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('profilePicture', fileInput.files[0]);
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload-profile-picture`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                let profilePictureUrl = data.profilePicture;
                
                // Only modify local URLs, not Cloudinary URLs
                if (profilePictureUrl && profilePictureUrl.startsWith('/uploads/')) {
                    profilePictureUrl = API_BASE_URL + profilePictureUrl;
                }
                
                // Add timestamp cache-busting
                const timestamp = '?timestamp=' + new Date().getTime();
                document.getElementById('profile-picture').src = profilePictureUrl + timestamp;
                document.getElementById('burger-profile-picture').src = profilePictureUrl + timestamp;
                
                alert('Profile picture uploaded successfully.');
            } else {
                const errorMessage = await response.text();
                alert('Failed to upload profile picture: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload profile picture: ' + error.message);
        }
    } else {
        alert('Please select a profile picture to upload.');
    }
}

// Add event listener to profile picture input for automatic upload
const profilePictureInput = document.getElementById('profile-picture-input');
if (profilePictureInput) {
    profilePictureInput.addEventListener('change', uploadProfilePicture);
}

// function to refresh profile picture from database
async function refreshProfilePicture() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            if (user.profilePicture) {
                const timestamp = '?timestamp=' + new Date().getTime();
                const profilePic = document.getElementById('profile-picture');
                const burgerProfilePic = document.getElementById('burger-profile-picture');
                
                if (profilePic) profilePic.src = user.profilePicture + timestamp;
                if (burgerProfilePic) burgerProfilePic.src = user.profilePicture + timestamp;
            }
        }
    } catch (error) {
        console.error('Error refreshing profile picture:', error);
    }
}

// Function to fetch user profile and display it
async function fetchProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            
            // Update form fields
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-genres').value = user.favoriteGenres || '';
            document.getElementById('profile-authors').value = user.favoriteAuthors || '';
            document.getElementById('profile-books').value = user.favoriteBooks || '';
            
            // RESTORE: Handle profile picture with timestamp like the old working code
            if (user.profilePicture) {
                let profilePictureUrl = user.profilePicture;
                if (profilePictureUrl && profilePictureUrl.startsWith('/uploads/')) {
                    profilePictureUrl = API_BASE_URL + profilePictureUrl;
                }
                const timestamp = '?timestamp=' + new Date().getTime();
                document.getElementById('profile-picture').src = profilePictureUrl + timestamp;
                document.getElementById('burger-profile-picture').src = profilePictureUrl + timestamp;
            }
        } else {
            alert('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to fetch profile');
    }
}

// Function to show the user profile section
function showProfileSection() {
    document.getElementById('profile-section').style.display = 'block';
    fetchProfile();
    disableProfileEditing();
}

// Function to check initial auth status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/current-user`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            userRole = user.role;

            // Show authenticated UI elements
            const loginForm = document.getElementById('login-form');
            const mainContent = document.getElementById('main-content');
            const newsletterSection = document.getElementById('newsletter-section');
            const addBookLink = document.getElementById('add-book-link');
            const hamburgerButton = document.getElementById('hamburger-button');
            const searchBooksSection = document.getElementById('search-books');
            const recommendationsSection = document.getElementById('recommendations-section');
            const footer = document.getElementById('footer');
            const adminButton = document.getElementById('admin-button');
            const profileSection = document.getElementById('profile-section');
            const manageUsersLink = document.getElementById('manage-users-link');
            const addBookSection = document.getElementById('add-book-section');
            const burgerUsername = document.getElementById('burger-username');

            // Update UI elements
            if (loginForm) loginForm.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (newsletterSection) newsletterSection.style.display = 'block';
            if (recommendationsSection) recommendationsSection.style.display = 'block';
            if (hamburgerButton) hamburgerButton.style.display = 'block';
            if (searchBooksSection) searchBooksSection.style.display = 'block';
            if (footer) footer.style.display = 'block';

            // Hide other sections by default
            if (addBookSection) addBookSection.style.display = 'none';
            if (profileSection) profileSection.style.display = 'none';
            if (manageUsersLink) manageUsersLink.style.display = 'none';

            // Update sidebar with user info
            if (burgerUsername) burgerUsername.innerText = user.username;
            
            // Always refresh profile picture from database instead of relying on session
            await refreshProfilePicture();

            // Handle admin-specific UI elements
            if (userRole === 'admin') {
                if (addBookLink) addBookLink.style.display = 'block';
                if (manageUsersLink) manageUsersLink.style.display = 'block';
                if (adminButton) adminButton.style.display = 'block';
            } else {
                if (addBookLink) addBookLink.style.display = 'none';
            }

            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) chatIcon.style.display = 'block';
            
            return true;
        } else {
            showLoginForm();
            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) chatIcon.style.display = 'none';
            return false;
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLoginForm();
        const chatIcon = document.getElementById('chat-icon');
        if (chatIcon) chatIcon.style.display = 'none';
        return false;
    }
}

// Store authentication state in localStorage for faster initial load
function setAuthState(isAuthenticated, userData = null) {
    if (isAuthenticated && userData) {
        localStorage.setItem('authState', 'authenticated');
        localStorage.setItem('userData', JSON.stringify({
            username: userData.username,
            role: userData.role,
            profilePicture: userData.profilePicture
        }));
    } else {
        localStorage.removeItem('authState');
        localStorage.removeItem('userData');
    }
}

function getStoredAuthState() {
    return {
        isAuthenticated: localStorage.getItem('authState') === 'authenticated',
        userData: JSON.parse(localStorage.getItem('userData') || 'null')
    };
}

// Function to handle like and dislike actions
async function handleLikeDislike(bookId, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/${action}`, { method: 'POST', credentials: 'include' });
        if (response.ok) {
            const { likes, dislikes } = await response.json();

            // Update the like/dislike counts on the book-details page
            if (document.getElementById('like-count') && document.getElementById('dislike-count')) {
                document.getElementById('like-count').innerText = likes;
                document.getElementById('dislike-count').innerText = dislikes;
            }

            // Update the like/dislike UI on the main page dynamically
            syncLikeDislikeAcrossPages(bookId, likes, dislikes, action);
        } else {
            const errorMessage = await response.text();
            console.error('Failed to update like/dislike:', errorMessage);
            alert('Failed to update like/dislike: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update like/dislike. Please check your server connection.');
    }
}

function syncLikeDislikeAcrossPages(bookId, likes, dislikes, action) {
    const likeButton = document.querySelector(`#book-${bookId} .like-button`);
    const dislikeButton = document.querySelector(`#book-${bookId} .dislike-button`);

    if (likeButton) {
        likeButton.innerHTML = `👍 ${likes}`;
        likeButton.classList.toggle('active', action === 'like'); // Highlight if liked
    }
    if (dislikeButton) {
        dislikeButton.innerHTML = `👎 ${dislikes}`;
        dislikeButton.classList.toggle('active', action === 'dislike'); // Highlight if disliked
    }
}

// Function to fetch and display detailed information about a selected book
function showBookDetails(bookId) {
  if (!bookId || bookId === "undefined" || isNaN(Number(bookId))) {
    alert('Book ID is missing or invalid!');
    return;
  }
  window.location.href = `book-details.html?bookId=${bookId}`;
}

async function saveBookDetails() {
    const adminEditFields = document.getElementById('admin-edit-fields');
    const bookId = adminEditFields.getAttribute('data-book-id');
    if (!bookId) {
        alert('Book ID is missing!');
        return;
    }

    const updatedDetails = {
        title: document.getElementById('edit-title').value,
        author: document.getElementById('edit-author').value,
        genres: document.getElementById('edit-genres').value,
        summary: document.getElementById('edit-summary').value,
        description: document.getElementById('edit-description').value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedDetails),
        });

        if (response.ok) {
            alert('Book details updated successfully.');
            const updatedBook = await response.json();

            // Update the book details on the main page dynamically
            const bookItem = document.getElementById(`book-${bookId}`);
            if (bookItem) {
                bookItem.querySelector('.details h5').innerText = updatedBook.title;
                bookItem.querySelector('.details p:nth-child(2)').innerHTML = `<strong>Author: </strong> ${updatedBook.author}`;
                bookItem.querySelector('.details p:nth-child(3)').innerText = updatedBook.description;
            }

            // Update the book details on the current page
            document.getElementById('book-details-title').innerText = updatedBook.title;
            document.getElementById('book-details-author').innerText = updatedBook.author;
            document.getElementById('book-details-genres').innerText = updatedBook.genres;
            document.getElementById('book-details-summary').innerText = updatedBook.summary;
        } else {
            alert('Failed to update book details.');
        }
    } catch (error) {
        console.error('Error updating book details:', error);
        alert('An error occurred while updating book details.');
    }
}

// Function to edit book details (admin only)
function editBookDetails() {
    const bookId = document.getElementById('admin-actions').getAttribute('data-book-id');
    const newTitle = prompt('Enter new title:');
    const newAuthor = prompt('Enter new author:');
    const newSummary = prompt('Enter new summary:');
    const newDescription = prompt('Enter new description:');
    if (newTitle && newAuthor && newSummary && newDescription) {
        fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, author: newAuthor, summary: newSummary, description: newDescription })
        })
            .then(response => {
                if (response.ok) {
                    alert('Book details updated successfully.');
                    showBookDetails(bookId);
                } else {
                    alert('Failed to update book details.');
                }
            })
            .catch(error => {
                console.error('Error updating book details:', error);
                alert('An error occurred while updating book details.');
            });
    }
}

// Function to delete book details (admin only)
function deleteBookDetails() {
    const bookId = document.getElementById('admin-actions').getAttribute('data-book-id');
    if (confirm('Are you sure you want to delete this book?')) {
        fetch(`${API_BASE_URL}/books/${bookId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Book deleted successfully.');
                    showSection('search-books');
                    fetchBooks();
                } else {
                    alert('Failed to delete book.');
                }
            })
            .catch(error => {
                console.error('Error deleting book:', error);
                alert('An error occurred while deleting the book.');
            });
    }
}

// Function to fetch and display recommendations
async function fetchRecommendations() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/recommendations`, { 
            credentials: 'include' 
        }, 5000);
        
        if (response.ok) {
            const data = await response.json();
            const recommendations = data.recommendations || []; // safer extraction
            const recommendationsCarousel = document.querySelector('#recommendations-carousel .carousel-inner');

            if (recommendationsCarousel) {
                recommendationsCarousel.innerHTML = ""; // Clear existing recommendations
                recommendations.forEach((recommendation, index) => {
                    const item = document.createElement('div');
                    item.classList.add('carousel-item');
                    if (index === 0) item.classList.add('active'); // Set the first item as active

                    // Fix: prepend API_BASE_URL if cover is a relative path
                    let coverUrl = recommendation.cover;
                    if (coverUrl && coverUrl.startsWith('/uploads/')) {
                        coverUrl = API_BASE_URL + coverUrl;
                    }

                    item.innerHTML = `
                        <div class="card">
                            <img src="${coverUrl}" alt="${recommendation.title}">
                            <div class="card-body">
                                <h5 class="card-title">${recommendation.title}</h5>
                                <p class="card-text">${recommendation.description}</p>
                                <a href="book-details.html?bookId=${recommendation.id}" class="btn btn-success w-100 mt-2">
                                    <i class="fas fa-info-circle"></i> View
                                </a>
                            </div>
                        </div>
                    `;
                    recommendationsCarousel.appendChild(item);
                });
            }
        } else {
            console.log('Recommendations fetch failed - user may not be authenticated');
        }
    } catch (error) {
        console.log('Error fetching recommendations (non-critical):', error.message);
        // Don't throw error - recommendations are not critical for app functionality
    }
}

// Call the necessary functions on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check initial auth status and handle burger menu
    checkAuthStatus();
    setupOutsideClickListener();
    fetchRecommendations();
});