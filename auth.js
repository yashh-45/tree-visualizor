// ═══════════════════════════════════════════════════════════════════
// DS2 Platform — Auth Logic (Login / Signup)
// localStorage-based authentication for static site demo
// ═══════════════════════════════════════════════════════════════════

const AUTH_KEY = 'ds2_users';
const SESSION_KEY = 'ds2_session';

// ── Helpers ──────────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    loggedInAt: Date.now()
  }));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// ── Toast ────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  // Remove existing
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ── Password Strength ────────────────────────────────────────────

function calcPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-5
}

function updateStrengthMeter(password) {
  const bar = document.getElementById('strengthBarFill');
  const label = document.getElementById('strengthLabel');
  if (!bar || !label) return;

  const score = calcPasswordStrength(password);
  const levels = [
    { width: '0%', color: 'transparent', text: '' },
    { width: '20%', color: '#ef4444', text: 'Very weak' },
    { width: '40%', color: '#f97316', text: 'Weak' },
    { width: '60%', color: '#eab308', text: 'Fair' },
    { width: '80%', color: '#22c55e', text: 'Strong' },
    { width: '100%', color: '#06b6d4', text: 'Very strong' }
  ];
  const l = levels[score];
  bar.style.width = l.width;
  bar.style.background = l.color;
  label.textContent = l.text;
  label.style.color = l.color;
}

// ── Form Validation ──────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + 'Error');
  if (input) { input.classList.add('error'); input.classList.remove('success'); }
  if (error) { error.textContent = message; error.classList.add('visible'); }
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + 'Error');
  if (input) { input.classList.remove('error'); }
  if (error) { error.classList.remove('visible'); }
}

function showFieldSuccess(inputId) {
  const input = document.getElementById(inputId);
  if (input) { input.classList.remove('error'); input.classList.add('success'); }
  clearFieldError(inputId);
}

// ── Login ────────────────────────────────────────────────────────

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  let valid = true;

  clearFieldError('loginEmail');
  clearFieldError('loginPassword');

  if (!email) {
    showFieldError('loginEmail', 'Email is required');
    valid = false;
  } else if (!validateEmail(email)) {
    showFieldError('loginEmail', 'Enter a valid email address');
    valid = false;
  }

  if (!password) {
    showFieldError('loginPassword', 'Password is required');
    valid = false;
  }

  if (!valid) return;

  const btn = e.target.querySelector('.auth-submit');
  btn.classList.add('loading');
  btn.textContent = 'Signing in…';

  // Simulate network delay
  setTimeout(() => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setSession(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      setTimeout(() => {
        window.location.href = 'ds2-platform.html';
      }, 800);
    } else {
      btn.classList.remove('loading');
      btn.textContent = 'Sign In';
      showFieldError('loginPassword', 'Invalid email or password');
      showToast('Invalid credentials', 'error');
    }
  }, 800);
}

// ── Signup ───────────────────────────────────────────────────────

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const terms = document.getElementById('signupTerms')?.checked;
  let valid = true;

  clearFieldError('signupName');
  clearFieldError('signupEmail');
  clearFieldError('signupPassword');
  clearFieldError('signupConfirm');

  if (!name) {
    showFieldError('signupName', 'Name is required');
    valid = false;
  } else if (name.length < 2) {
    showFieldError('signupName', 'Name must be at least 2 characters');
    valid = false;
  }

  if (!email) {
    showFieldError('signupEmail', 'Email is required');
    valid = false;
  } else if (!validateEmail(email)) {
    showFieldError('signupEmail', 'Enter a valid email address');
    valid = false;
  }

  if (!password) {
    showFieldError('signupPassword', 'Password is required');
    valid = false;
  } else if (password.length < 6) {
    showFieldError('signupPassword', 'Password must be at least 6 characters');
    valid = false;
  }

  if (password !== confirm) {
    showFieldError('signupConfirm', 'Passwords do not match');
    valid = false;
  }

  if (!terms) {
    showToast('Please accept the terms & conditions', 'error');
    valid = false;
  }

  if (!valid) return;

  const btn = e.target.querySelector('.auth-submit');
  btn.classList.add('loading');
  btn.textContent = 'Creating account…';

  setTimeout(() => {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      btn.classList.remove('loading');
      btn.textContent = 'Create Account';
      showFieldError('signupEmail', 'An account with this email already exists');
      showToast('Email already registered', 'error');
      return;
    }

    users.push({ name, email, password });
    saveUsers(users);

    showToast('Account created! Redirecting to login…', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  }, 800);
}

// ── Toggle Password Visibility ──────────────────────────────────

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const btn = input.parentElement.querySelector('.toggle-password');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ── Init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in and on login/signup page, redirect to platform
  const session = getSession();
  const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('signup');

  if (session && isAuthPage) {
    window.location.href = 'ds2-platform.html';
    return;
  }

  // Bind login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Bind signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', handleSignup);

  // Password strength meter
  const signupPw = document.getElementById('signupPassword');
  if (signupPw) {
    signupPw.addEventListener('input', (e) => updateStrengthMeter(e.target.value));
  }

  // Real-time validation feedback
  document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        if (input.type === 'email' && !validateEmail(input.value)) {
          showFieldError(input.id, 'Enter a valid email');
        } else {
          showFieldSuccess(input.id);
        }
      }
    });
    input.addEventListener('input', () => {
      clearFieldError(input.id);
    });
  });
});
