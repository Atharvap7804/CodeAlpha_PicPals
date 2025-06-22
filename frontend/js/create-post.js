document.getElementById("media").addEventListener('change', async (event) => {
  const file = event.target.files[0]
  const preview = document.getElementById('media-preview')
  preview.innerHTML = ''


    if (file) {
      const url = URL.createObjectURL(file)
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img')
        img.src = url
        img.style.maxWidth = '100%'
        preview.appendChild(img)
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.src = url
        video.controls = true
        video.style.maxWidth = '100%'
        preview.appendChild(video)
      }
    }
  })

// Handle form submission
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('media', document.getElementById('media').files[0]);
  formData.append('caption', document.getElementById('caption').value);

  try {
    const response = await fetch('http://localhost:4000/posts/create', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    let data = {};
    const contentType = response.headers.get("content-type");

    // ✅ Only parse if JSON
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn("⚠️ Unexpected response format:", text);
    }

    if (response.ok) {
      alert('✅ Post created successfully!');
      window.location.href = 'profile.html';

    } else {
      console.error('❌ Server returned non-200:', data);
      alert('❌ Failed to create post. ' + (data.message || ''));
    }
  } catch (error) {
    console.error('🔥 Network/Fetch error:', error);
    alert('❌ Network error. Please try again.');
  }
});
