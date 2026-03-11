/**
 * auth.js — Client-side auth system (LocalStorage-based)
 * For production: replace with Supabase / Firebase Auth
 */
const Auth = (() => {
  let currentUser = null;
  const SESSION_KEY = 'pixelmind_session';

  const getSession = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
  };
  const setSession = (user) => {
    const safe = { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    currentUser = safe;
  };
  const clearSession = () => { sessionStorage.removeItem(SESSION_KEY); currentUser = null; };

  const login = (email, password) => {
    const user = UserDB.findUser(email);
    if (!user || user.password !== password) return { ok: false, error: 'Invalid email or password' };
    setSession(user);
    return { ok: true, user: currentUser };
  };

  const register = (name, email, password) => {
    if (UserDB.findUser(email)) return { ok: false, error: 'Email already registered' };
    if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters' };
    const user = UserDB.addUser({ name, email, password });
    setSession(user);
    return { ok: true, user: currentUser };
  };

  const logout = () => clearSession();
  const getUser = () => currentUser || getSession();
  const isLoggedIn = () => !!getUser();

  const deductCredits = (amount) => {
    const user = getUser();
    if (!user) return false;
    if (user.credits < amount) return false;
    user.credits -= amount;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    UserDB.updateUser(user.id, { credits: user.credits });
    currentUser = user;
    return true;
  };

  // Auto-restore session
  const restored = getSession();
  if (restored) currentUser = restored;

  return { login, register, logout, getUser, isLoggedIn, deductCredits };
})();
