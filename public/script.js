// Change this to your hosted backend URL when deployed
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? '' // Local: same origin
  : 'https://library-backend-j90e.onrender.com';

// Define the seed admin username
const seedAdminUsername = 'admin';

// Initialize user role
let userRole = "";

// Ensure the necessary elements are hidden on initial load
document.addEventListener('DOMContentLoaded', async () => {
    // Remove light mode initialization
    // if (localStorage.getItem('lightMode') === 'enabled') {
    //     document.body.classList.add('light-mode');
    // }

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
    const mainContent = document.getElementById('main-content');
    const footer = document.getElementById('footer');

    if (hamburgerButton) hamburgerButton.style.display = 'none';
    if (searchBooksSection) searchBooksSection.style.display = 'none';
    if (manageUsersLink) manageUsersLink.style.display = 'none';
    if (addBookLink) addBookLink.style.display = 'none';
    if (adminButton) adminButton.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
    if (newsletterSection) newsletterSection.style.display = 'block'; // Show initially
    if (recommendationsSection) recommendationsSection.style.display = 'none'; // Hide initially
    if (loginForm) loginForm.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (footer) footer.style.display = 'block'; // Show initially

    // Check authentication status and adjust UI elements
    const isLoggedIn = await checkAuthStatus();

    // Fetch books only if the user is logged in and the search section exists
    if (isLoggedIn && searchBooksSection) {
        fetchBooks();
    }

    // Set up the outside click listener for the sidebar
    setupOutsideClickListener();
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    // Check if a token is present in localStorage
    return localStorage.getItem('authToken') !== null;
}

// Function to handle login
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    });
    if (response.ok) {
        const user = await response.json();
        const hamburgerButton = document.getElementById('hamburger-button');
        const searchBooksSection = document.getElementById('search-books');
        const manageUsersLink = document.getElementById('manage-users-link');
        const addBookLink = document.getElementById('add-book-link');
        const adminButton = document.getElementById('admin-button');
        const loginForm = document.getElementById('login-form');
        const newsletterSection = document.getElementById('newsletter-section');
        const mainContent = document.getElementById('main-content');
        const recommendationsSection = document.getElementById('recommendations-section');
        const addBookForm = document.getElementById('add-book-form');
        const footer = document.getElementById('footer');

        userRole = user.role; // Store user role
        if (hamburgerButton) hamburgerButton.style.display = 'block';
        if (searchBooksSection) searchBooksSection.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
        if (newsletterSection) newsletterSection.style.display = 'block';
        if (recommendationsSection) recommendationsSection.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (userRole === 'admin') {
            if (manageUsersLink) manageUsersLink.style.display = 'block';
            if (addBookLink) addBookLink.style.display = 'block';
            if (adminButton) adminButton.style.display = 'block';
        } else {
            if (addBookLink) addBookLink.style.display = 'none';
        }

        // Update sidebar with user info
        document.getElementById('burger-username').innerText = user.username;
        if (user.profilePicture) {
            document.getElementById('burger-profile-picture').src = user.profilePicture + '?timestamp=' + new Date().getTime();
        }

        // Clear add-book fields
        if (addBookForm) {
            document.getElementById('title').value = "";
            document.getElementById('author').value = "";
            document.getElementById('description').value = "";
            document.getElementById('genres').value = "";
            document.getElementById('book-cover').value = "";
            document.getElementById('book-file').value = "";
        }

        // Fetch fresh books and reset search/recommendations
        fetchBooks(); // Fetch books after login
        fetchRecommendations(); // Fetch recommendations after login

        const chatIcon = document.getElementById('chat-icon');
        if (chatIcon) chatIcon.style.display = 'block'; // Show chatbot icon after login
    } else {
        const errorMessage = await response.text();
        alert('Failed to login: ' + errorMessage);
    }
}

// Function to handle logout
async function logout() {
    const response = await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
    if (response.ok) {
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        if (loginUsername) loginUsername.value = ""; // Check if element exists before setting value
        if (loginPassword) loginPassword.value = ""; // Check if element exists before setting value

        const hamburgerButton = document.getElementById('hamburger-button');
        const searchBooksSection = document.getElementById('search-books');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const manageUsersLink = document.getElementById('manage-users-link');
        const addBookForm = document.getElementById('add-book-form');
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

        if (hamburgerButton) hamburgerButton.style.display = 'none';
        if (searchBooksSection) searchBooksSection.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (manageUsersLink) manageUsersLink.style.display = 'none';
        if (addBookForm) addBookForm.style.display = 'none';
        if (adminButton) adminButton.style.display = 'none';
        if (adminSection) adminSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        if (addBookSection) addBookSection.style.display = 'none';
        if (newsletterSection) newsletterSection.style.display = 'none';
        if (recommendationsSection) recommendationsSection.style.display = 'none'; // Hide initially
        if (mainContent) mainContent.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (bookList) bookList.innerHTML = ""; // Clear book list if it exists
        if (pagination) pagination.innerHTML = ""; // Clear pagination if it exists

        // Clear the recommendations carousel if it exists
        const recommendationsCarousel = document.querySelector('#recommendations-carousel .carousel-inner');
        if (recommendationsCarousel) recommendationsCarousel.innerHTML = "";

        // Close the sidebar if it is active
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }

        const chatIcon = document.getElementById('chat-icon');
        if (chatIcon) chatIcon.style.display = 'none'; // Hide chatbot icon after logout

        // Redirect to login page after logout
        window.location.href = "index.html";
    } else {
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
function showSection(sectionId) {
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

// Example: Use fetchWithErrorHandling in fetchBooks
async function fetchBooks(query = "", page = 1) {
    const titleInput = document.getElementById('search-title');
    const authorInput = document.getElementById('search-author');
    const genreInput = document.getElementById('search-genre');

    // Ensure the required elements exist before proceeding
    if (!titleInput || !authorInput || !genreInput) {
        console.warn("fetchBooks called on a page without search inputs.");
        return;
    }

    const title = titleInput ? titleInput.value : query;
    const author = authorInput ? authorInput.value : "";
    const genre = genreInput ? genreInput.value : "";

    const limit = 10; // Number of books per page
    const searchQuery = `title=${title}&author=${author}&genre=${genre}&page=${page}&limit=${limit}`;

    // Show the searching message
    document.getElementById('searching-msg').style.display = 'block';

    try {
        showLoadingSpinner();
        const data = await fetchWithErrorHandling(`/books?${searchQuery}`);
        const books = data.books;
        const totalBooks = data.total;
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
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item');
                bookItem.id = `book-${book.id}`;
                bookItem.innerHTML = `
                    ${userRole === 'admin' ? `
                        <div class="delete-action">
                            <button class="btn btn-danger btn-sm" onclick="confirmDeleteBook(${book.id}, '${book.title.replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    ` : ''}
                    <img src="/uploads/${book.cover}" alt="Cover Image">
                    <div class="details">
                        <div class="details-content">
                            <div class="main-info">
                                <h5>${book.title}</h5>
                                <p><strong>Author: </strong> ${book.author}</p>
                                <p class="description-text">${book.description}</p>
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
                updateLikeDislikeUI(book.id, book.likes, book.dislikes, userAction);
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
    } finally {
        hideLoadingSpinner();
        // Hide the searching message
        document.getElementById('searching-msg').style.display = 'none';
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
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
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
    if (bookCover) formData.append('bookCover', bookCover);
    if (bookFile) formData.append('bookFile', bookFile);

    try {
        const response = await fetch(`${API_BASE_URL}/addBook`, { method: 'POST', body: formData, credentials: 'include' });
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

// Function to register a new user
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Registration successful. Please log in.');
        document.getElementById('register-username').value = "";
        document.getElementById('register-password').value = "";
        showLoginForm();
    } else {
        const errorMessage = await response.text();
        alert('Failed to register: ' + errorMessage);
    }
}

// Function to show the login form
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const mainContent = document.getElementById('main-content');
    const newsletterSection = document.getElementById('newsletter-section');
    const recommendationsSection = document.getElementById('recommendations-section');
    const hamburgerButton = document.getElementById('hamburger-button');
    const searchBooksSection = document.getElementById('search-books');
    const footer = document.getElementById('footer');
    const adminButton = document.getElementById('admin-button');
    const profileSection = document.getElementById('profile-section');
    const manageUsersLink = document.getElementById('manage-users-link');

    // Show the login form and hide others
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (newsletterSection) newsletterSection.style.display = 'none';
    if (recommendationsSection) recommendationsSection.style.display = 'none';
    if (hamburgerButton) hamburgerButton.style.display = 'none';
    if (searchBooksSection) searchBooksSection.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (adminButton) adminButton.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
    if (manageUsersLink) manageUsersLink.style.display = 'none';
}

// Function to show the registration form
function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Show the registration form and hide the login form
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

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

// Function to fetch user profile and display it
async function fetchProfile() {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (response.ok) {
        const user = await response.json();
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-genres').value = user.favoriteGenres;
        document.getElementById('profile-authors').value = user.favoriteAuthors;
        document.getElementById('profile-books').value = user.favoriteBooks;
        if (user.profilePicture) {
            document.getElementById('profile-picture').src = user.profilePicture + '?timestamp=' + new Date().getTime();
            document.getElementById('burger-profile-picture').src = user.profilePicture + '?timestamp=' + new Date().getTime();
        }
    } else {
        alert('Failed to fetch profile');
    }
}

// Function to upload profile picture
async function uploadProfilePicture() {
    const fileInput = document.getElementById('profile-picture-input');
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('profilePicture', fileInput.files[0]);
        try {
            const response = await fetch(`${API_BASE_URL}/upload-profile-picture`, { method: 'POST', body: formData });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('profile-picture').src = data.profilePictureUrl + '?timestamp=' + new Date().getTime();
                document.getElementById('burger-profile-picture').src = data.profilePictureUrl + '?timestamp=' + new Date().getTime();
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

// Function to show the user profile section
function showProfileSection() {
    document.getElementById('profile-section').style.display = 'block';
    fetchProfile();
    disableProfileEditing();
}

// Function to check initial auth status and handle burger menu
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/current-user`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            userRole = user.role; // Update the global userRole variable

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
            const profilePicture = document.getElementById('profile-picture');
            const burgerProfilePicture = document.getElementById('burger-profile-picture');

            // Update UI elements based on authentication status
            if (loginForm) loginForm.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (newsletterSection) newsletterSection.style.display = 'block';
            if (recommendationsSection) recommendationsSection.style.display = 'block';
            if (hamburgerButton) hamburgerButton.style.display = 'block';
            if (searchBooksSection) searchBooksSection.style.display = 'block'; // Ensure "Search Books" is shown
            if (footer) footer.style.display = 'block';

            // Hide other sections by default
            if (addBookSection) addBookSection.style.display = 'none';
            if (profileSection) profileSection.style.display = 'none';
            if (manageUsersLink) manageUsersLink.style.display = 'none';

            // Update sidebar and profile section with user info
            if (burgerUsername) burgerUsername.innerText = user.username;
            if (profilePicture && user.profilePicture) {
                profilePicture.src = user.profilePicture + '?timestamp=' + new Date().getTime();
            }
            if (burgerProfilePicture && user.profilePicture) {
                burgerProfilePicture.src = user.profilePicture + '?timestamp=' + new Date().getTime();
            }

            // Update admin links and buttons based on user role
            if (userRole === 'admin') {
                if (addBookLink) addBookLink.style.display = 'block';
                if (manageUsersLink) manageUsersLink.style.display = 'block';
                if (adminButton) adminButton.style.display = 'block';
            } else {
                if (addBookLink) addBookLink.style.display = 'none';
            }

            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) chatIcon.style.display = 'block'; // Show chatbot icon if user is authenticated
            return true; // User is authenticated
        } else {
            showLoginForm();
            const chatIcon = document.getElementById('chat-icon');
            if (chatIcon) chatIcon.style.display = 'none'; // Hide chatbot icon if user is not authenticated
            return false; // User is not authenticated
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLoginForm();
        const chatIcon = document.getElementById('chat-icon');
        if (chatIcon) chatIcon.style.display = 'none'; // Hide chatbot icon on error
        return false; // User is not authenticated
    }
}

// Function to handle like and dislike actions
async function handleLikeDislike(bookId, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/${action}`, { method: 'POST' });
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

// Add this helper if not present
function confirmDeleteBook(bookId, bookTitle) {
    if (confirm(`Are you sure you want to delete the book "${bookTitle}"?`)) {
        deleteBook(bookId);
    }
}

// Function to fetch and display recommendations
async function fetchRecommendations() {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations`, { credentials: 'include' });
        if (response.ok) {
            const recommendations = await response.json();
            const recommendationsCarousel = document.querySelector('#recommendations-carousel .carousel-inner');
            if (recommendationsCarousel) {
                recommendationsCarousel.innerHTML = ""; // Clear existing recommendations
                recommendations.forEach((recommendation, index) => {
                    const item = document.createElement('div');
                    item.classList.add('carousel-item');
                    if (index === 0) item.classList.add('active'); // Set the first item as active
                    item.innerHTML = `
                        <div class="card">
                            <img src="/uploads/${recommendation.cover}" alt="${recommendation.title}">
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
            console.error('Failed to fetch recommendations:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// Call the necessary functions on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check initial auth status and handle burger menu
    checkAuthStatus();
    setupOutsideClickListener();
    fetchRecommendations();
});

// Call the necessary functions on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check initial auth status and handle burger menu
    checkAuthStatus();
    setupOutsideClickListener();
    fetchRecommendations();
});
