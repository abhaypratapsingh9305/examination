// Initialize data in localStorage if not exists
function initializeLocalStorage() {
    if (!localStorage.getItem('questions')) {
        const defaultQuestions = [
            {
                id: 1,
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                answer: 2
            },
            {
                id: 2,
                question: "Which language runs in a web browser?",
                options: ["Java", "C", "Python", "JavaScript"],
                answer: 3
            },
            {
                id: 3,
                question: "What does HTML stand for?",
                options: [
                    "Hypertext Markup Language",
                    "Hypertext Markdown Language",
                    "Hyperloop Machine Language",
                    "Helicopters Terminals Motorboats Lamborginis"
                ],
                answer: 0
            }
        ];
        localStorage.setItem('questions', JSON.stringify(defaultQuestions));
    }

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    if (!localStorage.getItem('admins')) {
        // Default admin credentials (username: admin, password: admin123)
        localStorage.setItem('admins', JSON.stringify([{
            username: 'admin',
            password: 'admin123',
            email: 'admin@example.com'
        }]));
    }

    if (!localStorage.getItem('examDuration')) {
        localStorage.setItem('examDuration', '30');
    }
}

// Current user tracking
let currentUser = null;
let isAdmin = false;
let currentQuestion = 0;
let userAnswers = {};
let timer;

// DOM Elements
const homePage = document.getElementById('home-page');
const authPage = document.getElementById('auth-page');
const adminPage = document.getElementById('admin-page');
const examPage = document.getElementById('exam-page');
const resultPage = document.getElementById('result-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');

// Buttons
const studentLoginBtn = document.getElementById('student-login-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const adminHomeBtn = document.getElementById('admin-home-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const updatePasswordBtn = document.getElementById('update-password-btn');
const cancelPasswordBtn = document.getElementById('cancel-password-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const examHomeBtn = document.getElementById('exam-home-btn');
const examLogoutBtn = document.getElementById('exam-logout-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const retakeExamBtn = document.getElementById('retake-exam-btn');
const resultHomeBtn = document.getElementById('result-home-btn');
const resultLogoutBtn = document.getElementById('result-logout-btn');

// Form elements
const questionForm = document.getElementById('question-form');

// Utility Functions
function getQuestions() {
    return JSON.parse(localStorage.getItem('questions')) || [];
}

function saveQuestions(questions) {
    localStorage.setItem('questions', JSON.stringify(questions));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getAdmins() {
    return JSON.parse(localStorage.getItem('admins')) || [];
}

function saveAdmins(admins) {
    localStorage.setItem('admins', JSON.stringify(admins));
}

function getExamDuration() {
    return parseInt(localStorage.getItem('examDuration')) || 30;
}

// Page Navigation Functions
function showHomePage() {
    homePage.style.display = 'block';
    authPage.style.display = 'none';
    adminPage.style.display = 'none';
    examPage.style.display = 'none';
    resultPage.style.display = 'none';
    document.getElementById('password-change').style.display = 'none';
}

function showAuthPage(type) {
    homePage.style.display = 'none';
    authPage.style.display = 'block';
    adminPage.style.display = 'none';
    examPage.style.display = 'none';
    resultPage.style.display = 'none';
    
    // Set the type (user or admin) in the form
    authPage.dataset.type = type;
    
    // Reset forms
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm-password').value = '';
    
    // Show login by default
    switchAuthTab('login');
}

function showAdminPage() {
    homePage.style.display = 'none';
    authPage.style.display = 'none';
    adminPage.style.display = 'block';
    examPage.style.display = 'none';
    resultPage.style.display = 'none';
    loadQuestions();
    document.getElementById('exam-duration').value = getExamDuration();
}

function showExamPage() {
    homePage.style.display = 'none';
    authPage.style.display = 'none';
    adminPage.style.display = 'none';
    examPage.style.display = 'block';
    resultPage.style.display = 'none';
    startExam();
}

function showResultPage() {
    homePage.style.display = 'none';
    authPage.style.display = 'none';
    adminPage.style.display = 'none';
    examPage.style.display = 'none';
    resultPage.style.display = 'block';
    showResults();
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

function showPasswordChange() {
    document.getElementById('password-change').style.display = 'block';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    document.getElementById('password-change-error').style.display = 'none';
    document.getElementById('password-change-success').style.display = 'none';
}

function hidePasswordChange() {
    document.getElementById('password-change').style.display = 'none';
}

function saveExamSettings() {
    const duration = document.getElementById('exam-duration').value;
    localStorage.setItem('examDuration', duration);
    document.getElementById('settings-message').textContent = 'Settings saved successfully!';
    setTimeout(() => {
        document.getElementById('settings-message').textContent = '';
    }, 3000);
}

// Authentication Functions
function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    const authType = authPage.dataset.type;
    
    if (!username || !password) {
        errorElement.textContent = 'Please enter both username and password';
        errorElement.style.display = 'block';
        return;
    }
    
    if (authType === 'admin') {
        const admins = getAdmins();
        const admin = admins.find(a => a.username === username && a.password === password);
        
        if (admin) {
            currentUser = admin;
            isAdmin = true;
            showAdminPage();
        } else {
            errorElement.textContent = 'Invalid admin credentials';
            errorElement.style.display = 'block';
        }
    } else {
        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            isAdmin = false;
            showExamPage();
        } else {
            errorElement.textContent = 'Invalid username or password';
            errorElement.style.display = 'block';
        }
    }
}

function registerUser() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorElement = document.getElementById('register-error');
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
        errorElement.textContent = 'All fields are required';
        errorElement.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        errorElement.style.display = 'block';
        return;
    }
    
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        errorElement.textContent = 'Username already exists';
        errorElement.style.display = 'block';
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        errorElement.textContent = 'Email already registered';
        errorElement.style.display = 'block';
        return;
    }
    
    // Add new user
    const newUser = {
        username,
        email,
        password
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto-login the new user
    currentUser = newUser;
    isAdmin = false;
    showExamPage();
}

function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const errorElement = document.getElementById('password-change-error');
    const successElement = document.getElementById('password-change-success');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        errorElement.textContent = 'All fields are required';
        errorElement.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        errorElement.textContent = 'New passwords do not match';
        errorElement.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        errorElement.style.display = 'block';
        return;
    }
    
    if (isAdmin) {
        const admins = getAdmins();
        const adminIndex = admins.findIndex(a => a.username === currentUser.username);
        
        if (admins[adminIndex].password !== currentPassword) {
            errorElement.textContent = 'Current password is incorrect';
            errorElement.style.display = 'block';
            return;
        }
        
        // Update password
        admins[adminIndex].password = newPassword;
        saveAdmins(admins);
        currentUser = admins[adminIndex];
    } else {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        
        if (users[userIndex].password !== currentPassword) {
            errorElement.textContent = 'Current password is incorrect';
            errorElement.style.display = 'block';
            return;
        }
        
        // Update password
        users[userIndex].password = newPassword;
        saveUsers(users);
        currentUser = users[userIndex];
    }
    
    // Show success message
    errorElement.style.display = 'none';
    successElement.textContent = 'Password changed successfully!';
    successElement.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
        hidePasswordChange();
    }, 3000);
}

function logout() {
    currentUser = null;
    isAdmin = false;
    showHomePage();
}

// Admin Panel Functions
function loadQuestions() {
    const questions = getQuestions();
    const questionsList = document.getElementById('questions-list');
    questionsList.innerHTML = '';
    
    if (questions.length === 0) {
        questionsList.innerHTML = '<p>No questions found. Add some questions to get started.</p>';
        return;
    }
    
    questions.forEach(q => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <h3>Q${q.id}: ${q.question}</h3>
            <div class="question-options">
                ${q.options.map((opt, i) => `
                    <p>${i+1}. ${opt} ${i === q.answer ? '(Correct)' : ''}</p>
                `).join('')}
            </div>
            <div class="question-actions">
                <button onclick="editQuestion(${q.id})" class="btn btn-primary">Edit</button>
                <button onclick="deleteQuestion(${q.id})" class="btn btn-danger">Delete</button>
            </div>
        `;
        questionsList.appendChild(questionItem);
    });
}

function editQuestion(id) {
    const questions = getQuestions();
    const question = questions.find(q => q.id === id);
    
    if (question) {
        document.getElementById('question').value = question.question;
        document.getElementById('option1').value = question.options[0];
        document.getElementById('option2').value = question.options[1];
        document.getElementById('option3').value = question.options[2];
        document.getElementById('option4').value = question.options[3];
        document.getElementById('correct-answer').value = question.answer + 1;
        
        // Remove the old question
        const updatedQuestions = questions.filter(q => q.id !== id);
        saveQuestions(updatedQuestions);
        
        // Scroll to form
        document.getElementById('question').focus();
    }
}

function deleteQuestion(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questions = getQuestions();
        const updatedQuestions = questions.filter(q => q.id !== id);
        saveQuestions(updatedQuestions);
        loadQuestions();
    }
}

// Exam Functions
function startExam() {
    currentQuestion = 0;
    userAnswers = {};
    const examDuration = getExamDuration() * 60; // Convert minutes to seconds
    
    // Display first question
    showExamQuestion();
    
    // Setup navigation buttons
    prevBtn.addEventListener('click', function() {
        if (currentQuestion > 0) {
            saveExamAnswer();
            currentQuestion--;
            showExamQuestion();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        saveExamAnswer();
        if (currentQuestion < getQuestions().length - 1) {
            currentQuestion++;
            showExamQuestion();
        }
    });
    
    submitBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to submit your exam?')) {
            saveExamAnswer();
            calculateResult();
            clearInterval(timer);
            showResultPage();
        }
    });
    
    // Start timer
    startExamTimer(examDuration);
}

function showExamQuestion() {
    const questions = getQuestions();
    const question = questions[currentQuestion];
    const questionContainer = document.getElementById('question-container');
    
    questionContainer.innerHTML = `
        <div class="question-box">
            <h3>Question ${currentQuestion + 1} of ${questions.length}</h3>
            <p>${question.question}</p>
            
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option">
                        <input type="radio" 
                               id="option-${index}" 
                               name="answer" 
                               value="${index}"
                               ${userAnswers[currentQuestion] === index ? 'checked' : ''}>
                        <label for="option-${index}">${option}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update navigation buttons
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = currentQuestion === questions.length - 1;
}

function saveExamAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestion] = parseInt(selectedOption.value);
    }
}

function startExamTimer(duration) {
    let timeLeft = duration;
    const timeDisplay = document.getElementById('time');
    
    // Initial display
    updateTimerDisplay(timeLeft, timeDisplay);
    
    timer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay(timeLeft, timeDisplay);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            calculateResult();
            alert('Time is up! Your exam has been submitted.');
            showResultPage();
        }
    }, 1000);
}

function updateTimerDisplay(timeLeft, element) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    element.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Change color when time is running low
    if (timeLeft <= 300) { // 5 minutes or less
        element.parentElement.style.backgroundColor = '#ff6b6b';
    }
}

function calculateResult() {
    let score = 0;
    const questions = getQuestions();
    
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].answer) {
            score++;
        }
    }
    
    // Save result to localStorage
    localStorage.setItem('examResult', JSON.stringify({
        score: score,
        total: questions.length,
        answers: userAnswers
    }));
}


      // Result Functions
      function showResults() {
        const result = JSON.parse(localStorage.getItem('examResult'));
        const questions = getQuestions();
        
        if (!result) {
            showHomePage();
            return;
        }
        
        // Display score
        document.getElementById('score').textContent = result.score;
        document.getElementById('total-questions').textContent = `out of ${result.total} questions`;
        
        // Calculate percentage
        const percentage = Math.round((result.score / result.total) * 100);
        document.getElementById('percentage').textContent = `${percentage}%`;
        
        // Display detailed answers
        const answersList = document.getElementById('answers-list');
        answersList.innerHTML = '';
        questions.forEach((q, i) => {
            const userAnswer = result.answers[i] !== undefined ? result.answers[i] : null;
            const isCorrect = userAnswer === q.answer;
            
            const answerItem = document.createElement('div');
            answerItem.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;
            answerItem.innerHTML = `
                <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
                <p><strong>Your answer:</strong> ${userAnswer !== null ? q.options[userAnswer] : 'Not answered'}</p>
                <p><strong>Correct answer:</strong> ${q.options[q.answer]}</p>
            `;
            
            answersList.appendChild(answerItem);
        });
    }

    // Initialize admin form
    document.getElementById('question-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const questionText = document.getElementById('question').value;
        const option1 = document.getElementById('option1').value;
        const option2 = document.getElementById('option2').value;
        const option3 = document.getElementById('option3').value;
        const option4 = document.getElementById('option4').value;
        const correctAnswer = parseInt(document.getElementById('correct-answer').value) - 1;
        
        const questions = getQuestions();
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        
        const newQuestion = {
            id: newId,
            question: questionText,
            options: [option1, option2, option3, option4],
            answer: correctAnswer
        };
        
        questions.push(newQuestion);
        saveQuestions(questions);
        
        // Clear form
        e.target.reset();
        
        // Reload questions
        loadQuestions();
        
        alert('Question added successfully!');
    });

    // Show home page by default
    showHomePage();