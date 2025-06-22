document.addEventListener('DOMContentLoaded',async()=>{
  const params=new URLSearchParams(window.location.search)
  const userId=params.get('userId')

  if(!userId) return

  try{
    //1.Fetch info
   
    const userResponse=await fetch(`http://localhost:4000/users/${userId}`,{
    method:'GET',
    credentials:'include'
   })
   const userData=await userResponse.json()

   //2.Fetch posts
   const postRes=await fetch(`http://localhost:4000/posts/user/${userId}`,{
    credentials:'include'
   })
   const postData=await postRes.json()

   //3.show user info
  const userInfoDiv=document.getElementById('user-Info')
  userInfoDiv.innerHTML=`
  <h2>${userData.username}</h2>
  <div class='details'>
  <p id="followers">Followers: ${userData.followers.length}</p>
      <p id="following">Following: ${userData.following.length}</p>
      <p>Total Posts: ${postData.length}</p>
    </div>
  `

  //4.Show posts
  const postsDiv=document.getElementById('user-posts')
  postsDiv.innerHTML=''
  postData.forEach(post=>{
    const card=document.createElement('div')
    card.classList.add('post-card')
    card.innerHTML=`
     ${post.image ? `<img src="http://localhost:4000/uploads/${post.image}" width="200">` : ''}
    <div>${post.content}</div>
        <div class='interaction'>
          <button class="like-btn" data-post-id="${post._id}">❤️Like(${post.likes.length})</button>
          <button class="comment-btn" data-post-id="${post._id}">💬Comment(${post.comments.length})</button>
  </div>
    `
    postsDiv.appendChild(card)
  })
  }catch(err){
    console.log('❌ Error fetching user info:', err)
  }
})


let currentModalPost=null
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
        e.target.textContent = `❤️Like(${newLikeCount})`
      } else {
        console.log('❌ Failed to like post:', data.message)
      }
    } catch (error) {
      console.log('❌ Error liking post:', error)
    }
  }

if (e.target.classList.contains('comment-btn')) {
  const postId = e.target.dataset.postId;
  try {
    const res = await fetch(`http://localhost:4000/posts/${postId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Post not found');

    const post = await res.json();
    currentModalPost = post;

    document.getElementById('modal-post-preview').innerHTML = `
      ${post.image ? `<img src="http://localhost:4000/uploads/${post.image}" alt="Post Image" style="max-width:200px;">` : ''}
      <div class="caption">${post.content}</div>
    `;

    const commentList = document.getElementById('modal-comments-list');
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
      commentList.innerHTML = '<div>No comments yet</div>';
    }

    document.getElementById('comment-modal').style.display = 'block';
    document.getElementById('modal-comment-input').value = '';
    document.getElementById('modal-comment-form').dataset.postId = postId;
  } catch (error) {
    console.log('❌ Error loading comments:', error);
  }
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('comment-modal').style.display = 'none';
};
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
      const date=data.createdAt ? new Date(data.comment.createdAt) : new Date();
      const newCommentHTML = `<div class="comment">
        <b>@${data.comment.user.username}:</b> ${data.comment.text}
        <div class="comment-time" style="font-size:0.8em;color:#888;">${date.toLocaleString()}</div>
      </div>`;
      commentsList.innerHTML += newCommentHTML;
      document.getElementById('modal-comment-input').value = '';
   
    } else {
      alert('Failed to comment');
    }
  } catch (err) {
    console.log(err)
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
       <a href="/frontend/user-profile.html?userId=${user._id}" class="username-link">
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