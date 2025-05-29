// Initialize Supabase
const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

async function loadDashboard() {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    window.location.href = '../login/login.html';
    return;
  }

  const user = session.user;
  document.getElementById('username').textContent = user.user_metadata.full_name || user.email;

  // Fetch projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);

  if (projectsError) {
    console.error('Error loading projects:', projectsError.message);
    return;
  }

  document.getElementById('project-count').textContent = projects.length;
  const projectsList = document.getElementById('projects-list');

  if (projects.length === 0) {
    projectsList.innerHTML = '<p>No projects found. Start a new one!</p>';
    return;
  }

  // Render project cards
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <input type="text" value="${project.title}" id="title-${project.id}" />
      <p>${project.description || 'No description'}</p>
      <button onclick="saveProjectTitle('${project.id}')">Save</button>
      <button onclick="viewProject('${project.id}')">Open</button>
    `;
    projectsList.appendChild(card);
  });
}

function startNewProject() {
  window.location.href = '../summarize/summarize.html';
}

function logout() {
  supabase.auth.signOut().then(() => {
    window.location.href = '../index.html';
  });
}
async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, username, bio, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error loading profile:', error.message);
    return;
  }

  // Populate form fields
  document.getElementById('full-name').value = data.full_name || '';
  document.getElementById('username-field').value = data.username || '';
  document.getElementById('bio').value = data.bio || '';

  const avatarPreview = document.getElementById('avatar-preview');
  const avatarFallback = document.getElementById('avatar-fallback');

  if (data.avatar_url) {
    avatarPreview.src = data.avatar_url;
    avatarPreview.style.display = 'block';
    avatarFallback.style.display = 'none';
  } else {
    avatarPreview.style.display = 'none';

    const seed = data.username || 'user';
    const avatarSvg = window.Dicebear.createAvatar(
      window.Dicebear.Collection.lorelei,
      { seed }
    );

    avatarFallback.innerHTML = '';
    avatarFallback.appendChild(avatarSvg);
    avatarFallback.style.display = 'block';
  }
}


async function saveProjectTitle(projectId) {
  const newTitle = document.getElementById(`title-${projectId}`).value;

  const { error } = await supabase
    .from('projects')
    .update({ title: newTitle })
    .eq('id', projectId);

  if (error) {
    alert('Error saving project title.');
  } else {
    alert('Project title updated.');
  }
}
function updateAvatarPreview() {
    const seed = (document.getElementById("username").value.trim() || document.getElementById("fullName").value.trim() || "user");
    const avatar = window.Dicebear.createAvatar(
      window.Dicebear.Collection.lorelei,
      { seed }
    );
    document.getElementById("avatar-preview").innerHTML = avatar;
  }
  
  document.getElementById("username").addEventListener("input", updateAvatarPreview);
  document.getElementById("fullName").addEventListener("input", updateAvatarPreview);
  
  // Call once on load
  updateAvatarPreview();
  

// Load dashboard and profile
loadDashboard();
const {
  data: { session }
} = await supabase.auth.getSession();
if (session) {
  await loadProfile(session.user.id);
}

const headerAvatar = document.getElementById('header-avatar');
if (headerAvatar && avatarUrl) {
  headerAvatar.src = avatarUrl;
}
