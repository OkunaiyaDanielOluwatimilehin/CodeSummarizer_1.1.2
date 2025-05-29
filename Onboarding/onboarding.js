window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    "https://dkixivngylkrisvcocvm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc"
  );

  const steps = document.querySelectorAll(".onboarding-step");
  let currentStep = 0;

  const fieldMap = {
    0: () => document.getElementById("fullName"),
    1: () => document.getElementById("role"),
    2: () => document.getElementById("language"),
    3: () => document.getElementById("useCase"),
    4: () => document.getElementById("username"),
    6: () => document.getElementById("bio"),
    7: () => document.getElementById("location"),
    8: () => document.getElementById("tags"),
    10: () => document.getElementById("project-name"),
  };

  // Restore saved draft from localStorage
  Object.entries(fieldMap).forEach(([_, getField]) => {
    const field = getField();
    const saved = localStorage.getItem(field.id);
    if (saved) field.value = saved;
  });

  // Save draft on input
  Object.values(fieldMap).forEach((getField) => {
    const field = getField();
    field.addEventListener("input", () => {
      localStorage.setItem(field.id, field.value);
    });
  });

  document.querySelectorAll(".next-btn").forEach((btn) =>
    btn.addEventListener("click", nextStep)
  );

  document.querySelectorAll(".skip-btn").forEach((btn) =>
    btn.addEventListener("click", skipStep)
  );

  document.querySelectorAll(".back-btn").forEach((btn) =>
    btn.addEventListener("click", prevStep)
  );

  document.querySelector(".submit-btn")?.addEventListener("click", async () => {
    if (currentStep === steps.length - 1) {
      await submitOnboarding();
    }
  });

  document.getElementById("clear-draft")?.addEventListener("click", () => {
    Object.values(fieldMap).forEach((getField) => {
      const field = getField();
      field.value = "";
      localStorage.removeItem(field.id);
    });
    alert("Draft cleared.");
  });

  function nextStep() {
    const fieldGetter = fieldMap[currentStep];
    if (fieldGetter) {
      const field = fieldGetter();
      if (field) {
        if (field.type === "file") {
          // Optionally skip validation or check files.length
        } else if (field.value.trim() === "") {
          alert("Please complete this step or press Skip.");
          return;
        }
      }
    }
    goToStep(currentStep + 1);
  }

  function skipStep() {
    goToStep(currentStep + 1);
  }

  function prevStep() {
    goToStep(currentStep - 1);
  }

  function goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      steps[currentStep].classList.remove("active");
      currentStep = stepIndex;
      steps[currentStep].classList.add("active");
      updateProgress();
    }
  }

  function updateProgress() {
    const percentage = ((currentStep + 1) / steps.length) * 100;
    document.getElementById("progress-fill").style.width = percentage + "%";
    document.getElementById("progress-text").textContent = `Step ${currentStep + 1} of ${steps.length}`;

    document.querySelectorAll(".back-btn").forEach((btn) => {
      btn.style.display = currentStep === 0 ? "none" : "inline-block";
    });
  }

  function generateDicebearAvatarUrl(user, document) {
    const seed = (document.getElementById("username").value.trim() || document.getElementById("fullName").value.trim() || "user");
  
    // Create the avatar SVG string using Dicebear lorelei
    const avatar = window.Dicebear.createAvatar(
      window.Dicebear.Collection.lorelei,
      { seed }
    );
  
    // Convert SVG string to base64 data URL
    const svgBase64 = btoa(avatar); // encode SVG to base64
  
    return `data:image/svg+xml;base64,${svgBase64}`;
  }
  
  async function submitOnboarding() {
    // Get the authenticated user once
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      alert("User not logged in. Please log in before submitting.");
      window.location.href = "/auth/login.html";  // Keep your auth flow path here
      return;
    }

    // Handle avatar upload or generate fallback
    let avatarUrl = null;

if (avatarFile) {
  const fileExt = avatarFile.name.split('.').pop();
  const fileName = `${session.user.id}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, avatarFile, { upsert: true });

  if (uploadError) {
    alert('Failed to upload avatar.');
    return;
  }

  // Get public URL (option 1: if bucket is public)
  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  avatarUrl = publicData.publicUrl;

  // -- OR --

  // Option 2: Use signed URL if bucket is private
  // const { data: signedData, error: signedError } = await supabase
  //   .storage
  //   .from('avatars')
  //   .createSignedUrl(filePath, 60 * 60);
  // if (signedError) {
  //   alert('Could not generate signed avatar URL');
  //   return;
  // }
  // avatarUrl = signedData.signedUrl;
}

    // Prepare profile data with authenticated user ID
    const profileData = {
      id: user.id,
      full_name: document.getElementById("fullName").value || null,
      role: document.getElementById("role").value || null,
      language: document.getElementById("language").value || null,
      use_case: document.getElementById("useCase").value || null,
      username: document.getElementById("username").value || null,
      bio: document.getElementById("bio").value || null,
      location: document.getElementById("location").value || null,
      avatar_url,
      tags: (document.getElementById("tags").value || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    // Check if username is unique (excluding current user)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", profileData.username)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      alert("Username already taken. Please choose another.");
      return;
    }

    // Upsert profile record (insert or update)
    const { error: profileError } = await supabase.from("profiles").upsert(profileData);
    if (profileError) {
      alert("Error saving profile: " + profileError.message);
      return;
    }

    alert("Profile saved successfully!");
    localStorage.clear();

    // Then handle project creation logic (optional here, or separate step)
    // For example, redirect to project creation or dashboard
    window.location.href = "/summarizer/summarizer.html"; // Redirect to summarizer page
  }

  // Project creation logic (as you had)
  const yesBtn = document.getElementById("yes-btn");
  const noBtn = document.getElementById("no-btn");
  const projectChoiceButtons = document.getElementById("project-choice-buttons");
  const projectNameSection = document.getElementById("project-name-section");
  const submitProjectBtn = document.getElementById("submit-project-btn");
  const projectNameInput = document.getElementById("project-name");

  yesBtn?.addEventListener("click", () => {
    projectChoiceButtons.style.display = "none";
    projectNameSection.style.display = "block";
    projectNameInput.focus();
  });

  noBtn?.addEventListener("click", () => {
    window.location.href = "/summarizer/summarizer.html"; // Redirect to summarizer page
  });

  submitProjectBtn?.addEventListener("click", async () => {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      alert("Please enter a project name.");
      projectNameInput.focus();
      return;
    }

    // Get user before insert
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("User not authenticated. Please log in.");
      return;
    }

    // Insert project with user_id from auth
    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: projectName, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project, try again.");
      return;
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
    

    // Redirect after success
    window.location.href = "../dashboard/dashboard.html"; // Redirect to dashboard or project page
  });

  // Initialize progress UI on load
  updateProgress();
  steps[currentStep].classList.add("active");
});
