import { useState, useEffect } from 'react';
import ASCIIText from './components/ASCIIText.jsx';
import Dither from './components/Dither.jsx';
import AnimatedList from './components/AnimatedList.jsx';

const API_BASE = 'http://localhost:5050';

function SplashScreen({ onEnter, onLoginClick, onLogoutClick, isLoggedIn }) {
  return (
    <div className="fullscreen splash-root" onClick={onEnter}>
      <div className="splash-login">
        <button
          type="button"
          className="splash-login-button"
          onClick={e => {
            e.stopPropagation();
            if (isLoggedIn) {
              if (onLogoutClick) {
                onLogoutClick();
              }
            } else if (onLoginClick) {
              onLoginClick();
            }
          }}
        >
          <span className="splash-login-icon">⎆</span>
          <span className="splash-login-text">{isLoggedIn ? 'LOGOUT' : 'LOGIN'}</span>
        </button>
      </div>
      <ASCIIText text="Tasker" enableWaves asciiFontSize={8} textFontSize={200} />
      <div className="centered-overlay">
        <div className="splash-hint">click anywhere to enter</div>
      </div>
    </div>
  );
}

function AuthScreen({ onBack, onLoginSuccess }) {
  return (
    <div className="app-shell interior">
      <div
        className="mini-logo"
        onClick={() => {
          if (onBack) {
            onBack();
          }
        }}
      >
        <ASCIIText text="Tasker" enableWaves asciiFontSize={4} textFontSize={230} planeBaseHeight={7} />
      </div>
      <div className="dither-bg">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Dither
            waveColor={[0.5, 0.5, 0.5]}
            disableAnimation={false}
            enableMouseInteraction={false}
            colorNum={4}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
          />
        </div>
      </div>
      <div className="interior-overlay auth-overlay">
        <div className="auth-card">
          <header className="auth-header">
            <span className="auth-eyebrow">Tasker</span>
            <h1 className="auth-title">Sign in to continue</h1>
          </header>
          <div className="auth-grid">
            <section className="auth-column">
              <h2 className="auth-column-title">Login</h2>
              <form
                className="auth-form"
                onSubmit={async e => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const username = (data.get('login-username') || '').toString().trim();
                  const password = (data.get('login-password') || '').toString();
                  if (!username || !password) {
                    // eslint-disable-next-line no-alert
                    alert('Please enter username and password.');
                    return;
                  }
                  try {
                    const res = await fetch(`${API_BASE}/login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ username, password })
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => null);
                      // eslint-disable-next-line no-alert
                      alert(err && err.error ? err.error : 'Login failed');
                      return;
                    }
                    if (onLoginSuccess) {
                      onLoginSuccess();
                    }
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Login error', err);
                    // eslint-disable-next-line no-alert
                    alert('Network error while logging in.');
                  }
                }}
              >
                <div className="field">
                  <label htmlFor="login-username">Username</label>
                  <input id="login-username" name="login-username" type="text" autoComplete="username" />
                </div>
                <div className="field password-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="login-password"
                      name="login-password"
                      type="password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      id="login-password-toggle"
                      onClick={() => {
                        const input = document.getElementById('login-password');
                        if (!input) return;
                        const nextType = input.type === 'password' ? 'text' : 'password';
                        input.type = nextType;
                        const btn = document.getElementById('login-password-toggle');
                        if (btn) {
                          btn.setAttribute('data-open', nextType === 'text' ? 'true' : 'false');
                        }
                      }}
                      aria-label="Toggle password visibility"
                    >
                      <span className="password-toggle-eye" />
                    </button>
                  </div>
                </div>
                <div className="auth-actions">
                  <button type="submit" className="btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </section>

            <section className="auth-column">
              <h2 className="auth-column-title">New here?</h2>
              <form
                className="auth-form"
                onSubmit={async e => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  const username = (data.get('signup-username') || '').toString().trim();
                  const password = (data.get('signup-password') || '').toString();
                  if (!username || !password) {
                    // eslint-disable-next-line no-alert
                    alert('Please enter username and password.');
                    return;
                  }
                  try {
                    const res = await fetch(`${API_BASE}/register`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username, password })
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => null);
                      // eslint-disable-next-line no-alert
                      alert(err && err.error ? err.error : 'Sign up failed');
                      return;
                    }
                    // eslint-disable-next-line no-console
                    console.log('Account created. You can now log in.');
                    form.reset();
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Signup error', err);
                    // eslint-disable-next-line no-alert
                    alert('Network error while signing up.');
                  }
                }}
              >
                <div className="field">
                  <label htmlFor="signup-username">Username</label>
                  <input id="signup-username" name="signup-username" type="text" autoComplete="username" />
                </div>
                <div className="field password-field">
                  <label htmlFor="signup-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      id="signup-password-toggle"
                      onClick={() => {
                        const input = document.getElementById('signup-password');
                        if (!input) return;
                        const nextType = input.type === 'password' ? 'text' : 'password';
                        input.type = nextType;
                        const btn = document.getElementById('signup-password-toggle');
                        if (btn) {
                          btn.setAttribute('data-open', nextType === 'text' ? 'true' : 'false');
                        }
                      }}
                      aria-label="Toggle password visibility"
                    >
                      <span className="password-toggle-eye" />
                    </button>
                  </div>
                </div>
                <div className="auth-actions">
                  <button type="submit" className="btn-ghost">
                    Sign up
                  </button>
                </div>
              </form>
            </section>
          </div>

          <button
            type="button"
            className="auth-back"
            onClick={() => {
              if (onBack) {
                onBack();
              }
            }}
          >
            ← Back to Tasker
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [celebratingTaskId, setCelebratingTaskId] = useState(null);

  const handleStartTransition = () => {
    if (isTransitioning || entered) return;
    if (showAuth) {
      setShowAuth(false);
    }
    setIsTransitioning(true);
    // switch to interior while fully dark to avoid visible jump
    setTimeout(() => {
      setEntered(true);
    }, 900);
  };
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogoClick = () => {
    if (isTransitioning || !entered) return;
    setIsTransitioning(true);
    // switch back to splash while fully dark
    setTimeout(() => {
      setEntered(false);
    }, 900);
  };

  const [tasks, setTasks] = useState([]);

  const handleAddTaskClick = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskStart('');
    setNewTaskEnd('');
    setIsCreatingTask(true);
  };

  const handleCreateTaskSubmit = async e => {
    e.preventDefault();
    const title = newTaskTitle.trim();
    const description = newTaskDescription.trim();
    const start = newTaskStart.trim();
    const end = newTaskEnd.trim();
    if (!title) return;

    const taskText = title;

    if (!isLoggedIn) {
      setTasks(prev => [
        ...prev,
        {
          id: Date.now(),
          task: taskText,
          created_at: new Date().toISOString(),
          completed: false,
          description,
          start,
          end
        }
      ]);
      setIsCreatingTask(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStart('');
      setNewTaskEnd('');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          task: taskText,
          description,
          start_date: start,
          end_date: end
        })
      });
      if (!res.ok) {
        // eslint-disable-next-line no-alert
        alert('Failed to create task');
        return;
      }
      const created = await res.json();
      setTasks(prev => [...prev, created]);
      setIsCreatingTask(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStart('');
      setNewTaskEnd('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating task', err);
    }
  };

  const handleEditTaskSubmit = async e => {
    e.preventDefault();
    if (!editingTask) return;
    const title = editTitle.trim();
    const description = editDescription.trim();
    const start = editStart.trim();
    const end = editEnd.trim();
    if (!title) return;

    if (!isLoggedIn) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingTask.id
            ? { ...task, task: title, description, start_date: start, end_date: end, start, end }
            : task
        )
      );
      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
      setEditStart('');
      setEditEnd('');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          task: title,
          description,
          start_date: start,
          end_date: end
        })
      });
      if (!res.ok) {
        // eslint-disable-next-line no-alert
        alert('Failed to update task');
        return;
      }
      const updated = await res.json();
      setTasks(prev => prev.map(task => (task.id === updated.id ? updated : task)));
      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
      setEditStart('');
      setEditEnd('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating task', err);
    }
  };

  const handleDeleteConfirm = () => {
    const item = taskToDelete;
    if (!item) return;
    setTaskToDelete(null);

    if (!isLoggedIn) {
      setTasks(prev => prev.filter(task => task.id !== item.id));
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/tasks/${item.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!res.ok) {
          // eslint-disable-next-line no-alert
          alert('Failed to delete task');
          return;
        }
        setTasks(prev => prev.filter(task => task.id !== item.id));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error deleting task', err);
      }
    })();
  };

  const filteredTasks = tasks.filter(t => t.task.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (!entered || !isLoggedIn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          credentials: 'include'
        });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error('Failed to load tasks', await res.text());
          return;
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading tasks', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entered, isLoggedIn]);

  return (
    <>
      {!entered ? (
        showAuth ? (
          <AuthScreen
            onBack={() => setShowAuth(false)}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setShowAuth(false);
            }}
          />
        ) : (
          <SplashScreen
            onEnter={handleStartTransition}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => {
              setShowAuth(true);
            }}
            onLogoutClick={() => {
              (async () => {
                try {
                  const res = await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                  });
                  if (!res.ok) {
                    // eslint-disable-next-line no-alert
                    alert('Logout failed');
                  }
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error('Logout error', err);
                } finally {
                  setIsLoggedIn(false);
                  setShowAuth(false);
                }
              })();
            }}
          />
        )
      ) : (
        <div className="app-shell interior">
          <div className="mini-logo">
            <span className="mini-logo-hitbox" onClick={handleLogoClick} aria-hidden />
            <ASCIIText text="Tasker" enableWaves asciiFontSize={4} textFontSize={230} planeBaseHeight={7} />
          </div>
          <div className="dither-bg">
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Dither
                waveColor={[0.5, 0.5, 0.5]}
                disableAnimation={false}
                enableMouseInteraction={false}
                colorNum={4}
                waveAmplitude={0.3}
                waveFrequency={3}
                waveSpeed={0.05}
              />
            </div>
          </div>
          <div className="interior-overlay">
            <div className="task-search-bar">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="task-add-button"
                aria-label="Add task"
                onClick={handleAddTaskClick}
              >
                +
              </button>
            </div>
            <AnimatedList
              items={filteredTasks}
              selectedTaskId={selectedTaskId}
              onItemSelect={(item) => {
                if (!item || item.id == null) return;
                setSelectedTaskId(prev => (prev === item.id ? null : item.id));
              }}
              onEdit={(item) => {
                if (!item) return;
                setEditingTask(item);
                setEditTitle(item.task || '');
                setEditDescription(item.description || item.desc || '');
                setEditStart(item.start_date || item.start || '');
                setEditEnd(item.end_date || item.end || '');
              }}
              onComplete={(item) => {
                if (!item) return;

                if (!isLoggedIn) {
                  setTasks(prev =>
                    prev.map(task =>
                      task.id === item.id ? { ...task, completed: !task.completed } : task
                    )
                  );
                  setCelebratingTaskId(item.id);
                  setTimeout(() => setCelebratingTaskId(null), 1500);
                  return;
                }

                (async () => {
                  try {
                    const res = await fetch(`${API_BASE}/tasks/${item.id}/complete`, {
                      method: 'PATCH',
                      credentials: 'include'
                    });
                    if (!res.ok) {
                      // eslint-disable-next-line no-alert
                      alert('Failed to complete task');
                      return;
                    }
                    const updated = await res.json();
                    setTasks(prev =>
                      prev.map(task => (task.id === updated.id ? updated : task))
                    );
                    setCelebratingTaskId(item.id);
                    setTimeout(() => setCelebratingTaskId(null), 1500);
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error completing task', err);
                  }
                })();
              }}
              onDelete={(item) => {
                if (!item) return;
                setTaskToDelete(item);
              }}
              celebratingTaskId={celebratingTaskId}
              showGradients={false}
              enableArrowNavigation
              displayScrollbar
            />
            {isCreatingTask && (
              <div className="task-modal-backdrop">
                <div className="task-modal" onClick={e => e.stopPropagation()}>
                  <h2 className="task-modal-title">New task</h2>
                  <form className="task-modal-form" onSubmit={handleCreateTaskSubmit}>
                    <div className="field">
                      <label htmlFor="new-task-title">Task title</label>
                      <input
                        id="new-task-title"
                        type="text"
                        autoFocus
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="new-task-description">Description</label>
                      <textarea
                        id="new-task-description"
                        rows={3}
                        value={newTaskDescription}
                        onChange={e => setNewTaskDescription(e.target.value)}
                      />
                    </div>
                    <div className="task-modal-grid">
                      <div className="field">
                        <label htmlFor="new-task-start">Start</label>
                        <input
                          id="new-task-start"
                          type="date"
                          value={newTaskStart}
                          onChange={e => setNewTaskStart(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="new-task-end">End</label>
                        <input
                          id="new-task-end"
                          type="date"
                          value={newTaskEnd}
                          onChange={e => setNewTaskEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="task-modal-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setIsCreatingTask(false);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setNewTaskStart('');
                          setNewTaskEnd('');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save task
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {editingTask && (
              <div className="task-modal-backdrop">
                <div className="task-modal" onClick={e => e.stopPropagation()}>
                  <h2 className="task-modal-title">Edit task</h2>
                  <form className="task-modal-form" onSubmit={handleEditTaskSubmit}>
                    <div className="field">
                      <label htmlFor="edit-task-title">Task title</label>
                      <input
                        id="edit-task-title"
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="edit-task-description">Description</label>
                      <textarea
                        id="edit-task-description"
                        rows={3}
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="task-modal-grid">
                      <div className="field">
                        <label htmlFor="edit-task-start">Start</label>
                        <input
                          id="edit-task-start"
                          type="date"
                          value={editStart}
                          onChange={e => setEditStart(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="edit-task-end">End</label>
                        <input
                          id="edit-task-end"
                          type="date"
                          value={editEnd}
                          onChange={e => setEditEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="task-modal-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setEditingTask(null);
                          setEditTitle('');
                          setEditDescription('');
                          setEditStart('');
                          setEditEnd('');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {taskToDelete && (
              <div className="delete-modal-backdrop">
                <div className="delete-modal" onClick={e => e.stopPropagation()}>
                  <p className="delete-modal-message">
                    Do you want to delete <strong>{taskToDelete.task}</strong>?
                  </p>
                  <div className="delete-modal-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setTaskToDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleDeleteConfirm}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {isTransitioning && (
        <div
          className="screen-transition"
          onAnimationEnd={() => {
            setIsTransitioning(false);
          }}
        />
      )}
    </>
  );
}

