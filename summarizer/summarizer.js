// Initialize Supabase client
const supabase = supabase.createClient(
    "https://dkixivngylkrisvcocvm.supabase.co",
     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
  );
  
  document.addEventListener("DOMContentLoaded", async () => {
    // Load user info
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      alert("You must be logged in");
      window.location.href = "/auth/login.html";
      return;
    }
  
    // Load profile from DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, email")
      .eq("id", user.id)
      .single();
  
    if (profile) {
      document.getElementById("user-name").textContent = profile.full_name || "Unnamed User";
      document.getElementById("user-email").textContent = user.email;
      document.getElementById("user-avatar").src = profile.avatar_url || "/default-avatar.png";
    }
  
    // Logout button
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/auth/login.html";
    });
  
    // Summarize button (placeholder, plug your logic here)
    document.getElementById("summarize-btn").addEventListener("click", () => {
      const inputText = document.getElementById("input-text").value.trim();
      if (!inputText) {
        alert("Please enter text to summarize.");
        return;
      }
      // Simple dummy summary:
      const summary = inputText.length > 100 ? inputText.slice(0, 100) + "..." : inputText;
      document.getElementById("summary-result").textContent = summary;
    });
  
    // Hook up other buttons (edit profile, change password, settings) as needed
    document.getElementById("edit-profile-btn").addEventListener("click", () => {
      alert("Edit Profile functionality not implemented yet.");
    });
  
    document.getElementById("change-password-btn").addEventListener("click", () => {
      alert("Change Password functionality not implemented yet.");
    });
  
    document.getElementById("settings-btn").addEventListener("click", () => {
      alert("Settings functionality not implemented yet.");
    });
    document.getElementById("chat-input-form").addEventListener("submit", async (e) => {
        e.preventDefault();
      
        const input = document.getElementById("chat-input");
        const output = document.getElementById("chat-output");
        const text = input.value.trim();
      
        if (!text) return;
      
        // Clear previous output and show the output container
        output.textContent = "";
        output.classList.add("show");
      
        // Show loading text while summarizing (you can improve this with spinner)
        output.textContent = "Summarizing...";
      
        // Call your summarization function or API here
        // For now, simple dummy summary logic:
        await new Promise(r => setTimeout(r, 800)); // simulate async delay
      
        let summary = text.length > 150 ? text.slice(0, 150) + "..." : text;
      
        output.textContent = summary;
      
        // Clear input and keep focus for next entry
        input.value = "";
        input.focus();
      
        // Scroll output to bottom
        output.scrollTop = output.scrollHeight;
      });
      
      // const chatInput = document.getElementById("chat-input");

      // chatInput.addEventListener("input", () => {
      //   chatInput.style.height = "auto"; // reset height to shrink if needed
      //   chatInput.style.height = chatInput.scrollHeight + "px"; // expand to fit content
      // });

  });
  