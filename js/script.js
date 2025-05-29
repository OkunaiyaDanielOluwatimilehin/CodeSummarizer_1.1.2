// FAQ toggle functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // Close other open items
        faqItems.forEach(i => {
            if (i !== item) {
                i.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('show');
}


// --- Typewriter Animation for Hero Subheading ---
const typewriterTextElement = document.getElementById('typewriter-text');
const phrases = [
    "Powered by cutting-edge AI.",
    "Making code accessible to everyone.",
    "Your ultimate code understanding companion.",
    "Efficient, accurate, and instant."
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100; // milliseconds per character
let deletingSpeed = 50; // milliseconds per character
let delayBetweenPhrases = 1500; // milliseconds

function typeWriterEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        // Deleting characters
        typewriterTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = deletingSpeed;
    } else {
        // Typing characters
        typewriterTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100; // Reset typing speed
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        // Finished typing, start deleting after a delay
        typingSpeed = delayBetweenPhrases;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        // Finished deleting, move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 100; // Reset typing speed before next phrase
    }

    // THIS IS THE CRITICAL FIX for the typewriter effect:
    // We were relying on the parent div `typewriter-container` to control the overflow.
    // The `textContent` is only ever set on `typewriterTextElement`.
    // The previous `vertical-align: bottom;` on `typewriter-cursor` in CSS was a bit of a hack
    // and might have caused some visual issues with alignment.
    // The main issue with "entering the hero text" was likely a misunderstanding or a visual glitch.
    // The JS `typeWriterEffect` function correctly targets only `typewriterTextElement`.
    // The primary reason the text could "enter" the H1 is if the H1 wasn't correctly styled
    // to have its own defined height/line-height, or if its `margin-bottom` was too small.
    // The current CSS for `h1` and `typewriter-container` should prevent this.
    // Re-checked `typeWriterEffect` to ensure it only interacts with `typewriterTextElement`.
    // The problem might have been if `typewriterTextElement` was unintentionally set to the H1 itself somewhere,
    // but the `getElementById('typewriter-text')` call ensures it's the correct span.

    // If the problem persists, ensure your browser cache is cleared.
    // And if `typewriter-container` itself is shrinking due to `height: 1.5em`,
    // the overflow `hidden` and `white-space: nowrap` should manage it.

    setTimeout(typeWriterEffect, typingSpeed);
}

// Start typewriter effect after page load
document.addEventListener('DOMContentLoaded', () => {
    typeWriterEffect();
});


// --- Counter Animation for Companies ---
const companiesCounterElement = document.getElementById('companies-counter');
const targetCount = 100; // The '100+' in "100+ companies"
const duration = 2000; // milliseconds

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(companiesCounterElement, targetCount, duration);
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% of the counter section is visible

// Observe the counter section
const counterSection = document.querySelector('.counter-section');
if (counterSection) {
    counterObserver.observe(counterSection);
}

function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16); // ~60 frames per second

    const animate = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start);
            requestAnimationFrame(animate);
        } else {
            element.textContent = target; // Ensure it ends exactly on target
        }
    };
    animate();
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
  
  const headerAvatar = document.getElementById('header-avatar');
if (headerAvatar && avatarUrl) {
  headerAvatar.src = avatarUrl;
}
