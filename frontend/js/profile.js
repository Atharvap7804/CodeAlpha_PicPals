console.log("profile.js loaded");
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('http://localhost:4000/users/profile', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json()
    if (response.ok) {
      document.getElementById('username').textContent = data.user.username
      document.getElementById('fullname').textContent = `${data.user.firstName} ${data.user.lastName}`
      document.getElementById('total-posts').textContent = data.user.postCount || 0
      document.getElementById('followers').textContent = data.user.followerCount || 0
      document.getElementById('following').textContent = data.user.followingCount || 0
    } else {
      alert("Unauthorized. Please login again")
      window.location.href = 'login.html'
    }
  } catch (error) {
    console.log(error)
  }
});






async function loadUserPosts() {
  try {
    const response = await fetch('http://localhost:4000/posts/all', {
      method: 'GET',
      credentials: 'include'
    })
    const data = await response.json()

    if (response.ok) {
      const postContainer = document.getElementById('user-post-container')
      postContainer.innerHTML = ''
      const currentUserId = data[0]?.author?._id

      data.forEach(post => {
        const card = document.createElement('div')
        card.classList.add('post-card')
       
        let deleteBtn=''
if (post.author._id ===currentUserId) {
    // Or use your current user's id if available
    deleteBtn = `<button class="delete-post-btn" data-post-id="${post._id}">🗑️ Delete</button>`;
  }
        card.innerHTML = `
      <div class="author">@${post.author.username}</div>
          ${post.image ? `<img src="http://localhost:4000/uploads/${post.image}" alt="Post Image">` : ''}
          ${post.video ? `<video controls src="http://localhost:4000/uploads/${post.video}"></video>` : ''}
          <div class="caption">${post.content}</div>
          <div class='interaction'>
          <button class="like-btn" data-post-id="${post._id}">❤️(${post.likes.length})</button>
          <button class="comment-btn" data-post-id="${post._id}"><i class="fa-solid fa-comment"></i>(${post.comments.length})</button>
          ${deleteBtn}
  </div>`
        postContainer.appendChild(card);
      })
    } else {
      console.log('❌ Failed to load posts:', data.message)
    }
  } catch (error) {
    console.log('❌ Error loading posts:', error)
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadUserPosts()
})

let currentModalPost = null

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('like-btn')) {
    const postId = e.target.dataset.postId
    console.log("Like button clicked for Post ID:", postId);
    try {
      const res = await fetch(`http://localhost:4000/posts/like/${postId}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        console.log('✅ Liked post:', data)
        const newLikeCount = data.post.likes.length;
        e.target.textContent = `❤️(${newLikeCount})`
      } else {
        console.log('❌ Failed to like post:', data.message)
      }
    } catch (error) {
      console.log('❌ Error liking post:', error)
    }
  }

  if (e.target.classList.contains('comment-btn')) {
    const postId = e.target.dataset.postId
    try {
      const res = await fetch(`http://localhost:4000/posts/all`, {
        method: 'GET',
        credentials: 'include'
      })
      const posts = await res.json()
      const post = posts.find(post => post._id === postId)
      currentModalPost = post
      document.getElementById('modal-post-preview').innerHTML = `
      ${post.image ? `<img src="http://localhost:4000/uploads/${post.image}" alt="Post Image" style="max-width:200px;">` : ''}
      <div class="caption">${post.content}</div>
    `;

      const commentList = document.getElementById('modal-comments-list')
      if (post.comments && post.comments.length > 0) {
        commentList.innerHTML = post.comments.map(comment => {
          const date = comment.createdAt ? new Date(comment.createdAt) : '';
          return `<div class="comment">
      <b>@${comment.user.username}:</b> ${comment.text}
      <div class="comment-time" style="font-size:0.8em;color:#888;">
        ${date ? date.toLocaleString() : ''}
      </div>
    </div>`;
        }).join('');
      } else {
        commentList.innerHTML = '<div>No comments yet</div>'
      }

      document.getElementById('comment-modal').style.display = 'block';
      document.getElementById('modal-comment-input').value = ''
      document.getElementById('modal-comment-form').dataset.postId = postId;
    } catch (error) {
      console.log('❌ Error loading comments:', error)
    }

  }
  document.getElementById('close-modal').onclick = () => {
    document.getElementById('comment-modal').style.display = 'none';
  };

  if(e.target.classList.contains('delete-post-btn')){
    const postId = e.target.dataset.postId;
    if (confirm('Are you sure you want to delete this post?')) {
      try {
       const res = await fetch(`http://localhost:4000/posts/delete/${postId}`, {
  method: 'DELETE',
  credentials: 'include'
});;
        const data = await res.json();
        if (res.ok) {
          alert('Post deleted successfully');
          loadUserPosts(); // Reload posts after deletion
        } else {
          alert('Failed to delete post');
        }
      } catch (error) {
        console.log('❌ Error deleting post:', error);
      }
    }
  }
})
document.getElementById('modal-comment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const postId = e.target.dataset.postId;
  const commentText = document.getElementById('modal-comment-input').value.trim();
  if (!commentText) return;
  try {
    const res = await fetch(`http://localhost:4000/posts/comment/${postId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText })
    });
    const data = await res.json();
    if (res.ok) {
      // Update modal comments list
      const commentsList = document.getElementById('modal-comments-list');
      const date = data.createdAt ? new Date(data.comment.createdAt) : new Date();
      const newCommentHTML = `<div class="comment">
        <b>@${data.comment.user.username}:</b> ${data.comment.text}
        <div class="comment-time" style="font-size:0.8em;color:#888;">${date.toLocaleString()}</div>
      </div>`;
      commentsList.innerHTML += newCommentHTML;
      document.getElementById('modal-comment-input').value = '';
      // Optionally, reload posts to update main feed
      loadUserPosts();
    } else {
      alert('Failed to comment');
    }
  } catch (err) {
    alert('Error commenting');
  }
});
//Toggle panel
document.getElementById('open-search').addEventListener('click', () => {
  document.getElementById('search-panel').classList.add('active')
})
document.getElementById('close-search').addEventListener('click', () => {
  document.getElementById('search-panel').classList.remove('active')
})

//Live searrch
document.getElementById('search-input').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (!query) return;


  try {
    await fetchCurrentUser();
    const res = await fetch(`http://localhost:4000/users/search?q=${query}`, {
      credentials: 'include'
    });

    const users = await res.json();

    if (!Array.isArray(users)) {
      console.error('Invalid response:', users);
      return;
    }
    renderSearchResults(users);
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
});



let currentUserFollowing = [];

async function fetchCurrentUser() {
  try {
    const res = await fetch('http://localhost:4000/users/me', {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user');
    }
    const data = await res.json();
    currentUserFollowing = data.following || [];

    const followingCount = document.getElementById('following')
    if (followingCount) {
      followingCount.textContent = data.following.length
    }
  } catch (err) {
    console.error('Failed to fetch current user:', err);
  }
}

function isUserFollowing(userId) {
  return currentUserFollowing.includes(userId);
}


function renderSearchResults(users) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';

  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-card';
    const isFollowing = isUserFollowing(user._id);

    div.innerHTML = `
       <a href="/user-profile.html?userId=${user._id}" class="username-link">
    ${user.username}
  </a>
      <button data-uid="${user._id}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;
    container.appendChild(div);
  });
}
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCurrentUser();
});

document.addEventListener('click', async (e) => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.uid) {
    const userId = e.target.dataset.uid;

    try {
      const res = await fetch(`http://localhost:4000/users/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        // 🔁 Refresh the user's following list
        await fetchCurrentUser();

        // 🔁 Toggle button text based on response from backend
        if (data.isFollowing) {
          e.target.textContent = 'Following';
        } else {
          e.target.textContent = 'Follow';
        }
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  }
});

document.getElementById('show-update-profile-btn').addEventListener('click', () => {
  document.getElementById('update-profile-form').style.display = 'flex';
});

document.getElementById('cancel-update-profile-btn').addEventListener('click', () => {
  document.getElementById('update-profile-form').style.display = 'none';
});

document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('edit-username').value;
  const firstName = document.getElementById('edit-firstname').value;
  const lastName=document.getElementById('edit-lastname').value
  await fetch('http://localhost:4000/users/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, name })
  });
  alert('Profile updated!');
  location.reload();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  confirm('Are you sure you want to logout?')
  try {
    const response = await fetch('http://localhost:4000/users/logout', {
      method: 'GET',
      credentials: 'include'
    })
    const data = await response.json()
    if (response.ok) {
      alert('Logout successful!');
      window.location.href = 'login.html';
    } else {
      alert('Logout failed. Please try again.', +data.message);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
})


document.getElementById('delete-account-btn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    try {
      const res = await fetch('http://localhost:4000/users/delete', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Account deleted');
        window.location.href = 'register.html';
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting account');
    }
  }
});


document.getElementById('followers').addEventListener('click', () => {
  openFollowModal('followers');
});
document.getElementById('following').addEventListener('click', () => {
  openFollowModal('following');
});

document.getElementById('close-follow-modal').onclick = () => {
  document.getElementById('follow-modal').style.display = 'none';
};
async function openFollowModal(type) {
  // type: 'followers' or 'following'

  // Get the profile userId from the URL (for own profile, fallback to current user)
  let userId;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('userId')) {
    userId = urlParams.get('userId');
  } else {
    // For own profile, fetch from backend
    const res = await fetch('http://localhost:4000/users/me', { credentials: 'include' });
    const data = await res.json();
    userId = data._id;
  }

  // Get current logged-in user id
  let currentUserId = null;
  try {
    const res = await fetch('http://localhost:4000/users/me', { credentials: 'include' });
    const data = await res.json();
    currentUserId = data._id;
  } catch (err) {
    currentUserId = null;
  }

  document.getElementById('follow-modal-title').innerText = type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById('follow-modal').style.display = 'block';
  document.getElementById('follow-list').innerHTML = 'Loading...';

  try {
    const res = await fetch(`http://localhost:4000/users/${type}/${userId}`, {
      credentials: 'include'
    });
    const users = await res.json();
    document.getElementById('follow-list').innerHTML = users.map(user => {
      let btn = '';
      if (user._id !== currentUserId) {
        btn = `<button class="follow-toggle-btn" data-user-id="${user._id}">${user.isFollowing ? 'Following' : 'Follow'}</button>`;
      }
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;">
        <span>${user.username}</span>
        ${btn}
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('follow-list').innerHTML = 'Failed to load list.';
  }
}

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('follow-toggle-btn')) {
    const userId = e.target.dataset.userId;
    try {
      const res = await fetch(`http://localhost:4000/users/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        // Toggle button text
        e.target.textContent = e.target.textContent === 'Follow' ? 'Following' : 'Follow';
      }
    } catch (err) {
      alert('Failed to update follow status');
    }
  }
});
document.getElementById('follow-list').innerHTML = users.map(user => {
  let btn = '';
  if (user._id !== currentUserId) {
    btn = `<button class="follow-toggle-btn" data-user-id="${user._id}">${user.isFollowing ? 'Following' : 'Follow'}</button>`;
  }
  return `<div class="follow-user-row">
    <span class="follow-username">${user.username}</span>
    ${btn}
  </div>`;
}).join('');