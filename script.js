// Prosty routing - pokazywanie/ukrywanie widoków (Sprint 1 Osoba C)
function showView(viewId) {
    // Ukryj wszystkie widoki
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Pokaż wybrany widok
    document.getElementById(viewId).classList.add('active');

    // Logika dostępu - dashboard i inne tylko po zalogowaniu
    if (viewId !== 'login' && !localStorage.getItem('userLoggedIn')) {
        alert('Najpierw zaloguj się!');
        showView('login');
        return;
    }

    // Symulacja stanu zalogowania dla demo
    if (viewId === 'login') {
        document.getElementById('auth-title').textContent = 'Logowanie';
        document.getElementById('auth-form').onsubmit = handleLogin;
    }
}

// Przełączanie logowanie/rejestracja
let isLogin = true;
function toggleAuth() {
    isLogin = !isLogin;
    const title = document.getElementById('auth-title');
    const submitBtn = document.querySelector('.btn-primary');

    if (isLogin) {
        title.textContent = 'Logowanie';
        submitBtn.textContent = 'Zaloguj się';
        document.getElementById('auth-form').onsubmit = handleLogin;
    } else {
        title.textContent = 'Rejestracja';
        submitBtn.textContent = 'Zarejestruj się';
        document.getElementById('auth-form').onsubmit = handleRegister;
    }
}

// Handler logowania
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        localStorage.setItem('userLoggedIn', 'true');
        alert('Zalogowano pomyślnie!');
        showView('dashboard');
    }
}

// Handler rejestracji
function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password.length >= 6) {
        localStorage.setItem('userLoggedIn', 'true');
        alert('Konto utworzone! Witaj w SwimPal.');
        showView('dashboard');
    } else {
        alert('Hasło musi mieć minimum 6 znaków.');
    }
}

// Wylogowanie
function logout() {
    localStorage.removeItem('userLoggedIn');
    showView('login');
}

// Obsługa typów treningów
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const type = this.dataset.type;
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(type + '-form').classList.add('active');
        });
    });
});
