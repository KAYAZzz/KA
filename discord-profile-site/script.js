document.addEventListener('DOMContentLoaded', function() {
  const userId = "747411610389446747";
  const apiUrl = `https://lanyard.rest/v1/users/${userId}`;

  // Music control logic
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const bgMusic = document.getElementById('bg-music');
  const musicVolume = document.getElementById('music-volume');
  const musicCompartment = document.querySelector('.music-volume-compartment');
  let musicOn = true;
  let hideCompartmentTimeout = null;

  // Prevent skew on slider drag
  if (musicBtn && musicVolume) {
    musicVolume.addEventListener('mousedown', function() {
      musicBtn.classList.add('noactive');
    });
    musicVolume.addEventListener('touchstart', function() {
      musicBtn.classList.add('noactive');
    });
    document.addEventListener('mouseup', function() {
      musicBtn.classList.remove('noactive');
    });
    document.addEventListener('touchend', function() {
      musicBtn.classList.remove('noactive');
    });
  }

  // Volume compartment hover logic
  function showCompartment() {
    if (musicCompartment) {
      musicCompartment.style.opacity = '1';
      musicCompartment.style.pointerEvents = 'auto';
      musicCompartment.style.transform = 'translateY(-50%) scaleX(1)';
    }
    if (hideCompartmentTimeout) {
      clearTimeout(hideCompartmentTimeout);
      hideCompartmentTimeout = null;
    }
  }
  function hideCompartment() {
    if (hideCompartmentTimeout) clearTimeout(hideCompartmentTimeout);
    hideCompartmentTimeout = setTimeout(() => {
      if (musicCompartment) {
        musicCompartment.style.opacity = '';
        musicCompartment.style.pointerEvents = '';
        musicCompartment.style.transform = '';
      }
    }, 1000);
  }
  if (musicBtn && musicCompartment) {
    musicBtn.addEventListener('mouseenter', showCompartment);
    musicBtn.addEventListener('mouseleave', hideCompartment);
    musicCompartment.addEventListener('mouseenter', showCompartment);
    musicCompartment.addEventListener('mouseleave', hideCompartment);
  }

  // Enter overlay logic
  const enterOverlay = document.getElementById('enter-overlay');
  const enterBtn = document.getElementById('enter-btn');
  if (enterOverlay && enterBtn) {
    // Pause music until user enters
    if (bgMusic) bgMusic.pause();
    // Hide overlay and start music on click
    enterBtn.addEventListener('click', function() {
      enterOverlay.classList.add('hide');
      setTimeout(() => {
        enterOverlay.style.display = 'none';
      }, 700);
      if (bgMusic && musicOn) {
        bgMusic.play();
      }
    });
  }

  function updateMusicBtn() {
    if (musicOn) {
      musicBtn.classList.add('on');
      musicBtn.classList.remove('off');
      musicIcon.textContent = '\uD83C\uDFB5'; // 🎵
    } else {
      musicBtn.classList.remove('on');
      musicBtn.classList.add('off');
      musicIcon.textContent = '\uD83C\uDFB5'; // 🎵
    }
  }

  if (musicBtn && bgMusic) {
    updateMusicBtn();
    bgMusic.volume = musicVolume ? parseFloat(musicVolume.value) : 0.5;
    if (musicVolume) {
      musicVolume.value = bgMusic.volume;
      musicVolume.addEventListener('input', function(e) {
        bgMusic.volume = parseFloat(this.value);
        // Prevent toggling animation if adjusting volume
        e.stopPropagation();
      });
      // Prevent mousedown/touchstart on slider from triggering button animation
      musicVolume.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      musicVolume.addEventListener('touchstart', function(e) { e.stopPropagation(); });
    }
    musicBtn.addEventListener('click', function(e) {
      // Don't toggle music or animate if clicking the slider
      if (e.target === musicVolume) return;
      musicOn = !musicOn;
      if (musicOn) {
        bgMusic.play();
      } else {
        bgMusic.pause();
      }
      musicBtn.classList.add('toggling');
      setTimeout(() => musicBtn.classList.remove('toggling'), 250);
      updateMusicBtn();
    });
  }

  fetch(apiUrl)
    .then(res => res.json())
    .then(({ data }) => {
      // Profile Picture
      const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
      const discordPfp = document.getElementById('discord-pfp');
      if (discordPfp) discordPfp.src = avatarUrl;

      // Username
      const usernameElem = document.getElementById('username');
      if (usernameElem) usernameElem.textContent = data.discord_user.username;
      const statusUsernameElem = document.getElementById('status-username');
      if (statusUsernameElem) statusUsernameElem.textContent = data.discord_user.username;

      // Status Icon and Text
      const statusIcon = document.getElementById('status-icon');
      const statusTextElem = document.getElementById('status-text');
      let activityText = "currently doing nothing";
      let iconUrl = "bored.png"; // Default to bored image
      let spinning = false;

      if (data.activities && data.activities.length > 0) {
        // Spotify (type 2)
        const spotify = data.activities.find(act => act.type === 2);
        if (spotify) {
          activityText = `Listening to ${spotify.details} by ${spotify.state}`;
          iconUrl = spotify.assets && spotify.assets.large_image
            ? `https://i.scdn.co/image/${spotify.assets.large_image.replace("spotify:", "")}`
            : avatarUrl;
          spinning = true;
        } else {
          // Game or other activity
          const game = data.activities.find(act => act.type === 0 || act.type === 4);
          if (game) {
            activityText = `Playing ${game.name}`;
            if (game.assets && game.assets.large_image) {
              iconUrl = `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`;
            } else {
              iconUrl = avatarUrl;
            }
            spinning = true;
          }
        }
      }

      if (statusIcon) {
        statusIcon.src = iconUrl;
        statusIcon.classList.toggle('spin', spinning);
      }
      if (statusTextElem) statusTextElem.textContent = activityText;
    })
    .catch((err) => {
      const statusTextElem = document.getElementById('status-text');
      if (statusTextElem) statusTextElem.textContent = "Could not fetch Discord data.";
    });

  // 3D hover effect for profile picture
  const pfp3d = document.getElementById('pfp-3d');
  if (pfp3d) {
    pfp3d.addEventListener('mousemove', (e) => {
      const rect = pfp3d.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      pfp3d.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
      pfp3d.classList.add('tilt');
    });
    pfp3d.addEventListener('mouseleave', () => {
      pfp3d.style.transform = '';
      pfp3d.classList.remove('tilt');
    });
  }
});