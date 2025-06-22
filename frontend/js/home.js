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
      <span>${user.username}</span>
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

document.addEventListener('DOMContentLoaded',async()=>{
  const feedContainer=document.getElementById('feed-container')
  try{
    const res=await fetch('http://localhost:4000/posts/feed',{
      credentials:'include'
    })
    const posts=await res.json()
    feedContainer.innerHTML=''
    posts.forEach(post=>{
      const card=document.createElement('div')
      card.className='feed-post-card'
      card.innerHTML=`
       <div class="feed-post-header">
         <a href="user-profile.html?userId=${post.author._id}" style="text-decoration:none;color:inherit;">
        ${post.author.username}
      </a>
        </div>
         ${post.image ? `<img src="http://localhost:4000/uploads/${post.image}" class="feed-post-img">` : ''}
        <div class="feed-post-content">${post.content || ''}</div>
        <div class="feed-post-actions">
          <button class="like-btn" data-post-id="${post._id}">❤️(${post.likes.length})</button>
          <button class="comment-btn" data-post-id="${post._id}"><i class="fa-solid fa-comment"></i> (${post.comments.length})</button>
        </div>
      <small>${new Date(post.createdAt).toLocaleString()}</small>
      `
      feedContainer.appendChild(card)
    })
  }catch(err){
    feedContainer.innerHTML='<p>Failed to load feed</p>'
  }
})

document.getElementById('logoutBtn').addEventListener('click',async()=>{
  confirm('Are you sure you want to logout?')
  try{
    const response=await fetch('http://localhost:4000/users/logout',{
      method:'GET',
      credentials:'include'
    })
 const data=await response.json()
 if(response.ok){
  alert('Logout successful!');
  window.location.href = 'login.html';
 }else{
  alert('Logout failed. Please try again.', +data.message);
 }
  }catch(error){
    console.error('Logout failed:', error);
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
        e.target.textContent = `❤️(${newLikeCount})`
      } else {
        console.log('❌ Failed to like post:', data.message)
      }
    } catch (error) {
      console.log('❌ Error liking post:', error)
    }
  }

if(e.target.classList.contains('comment-btn')){
  const postId=e.target.dataset.postId
  try{
    const res=await fetch(`http://localhost:4000/posts/${postId}`,{
      method:'GET',
      credentials:'include'
    })
   const posts=await res.json()
  
   if (!posts) {
  console.error('Post not found for ID:', postId);
  document.getElementById('modal-post-preview').innerHTML = '<div>Post not found.</div>';
  return;
}
   currentModalPost=posts
   document.getElementById('modal-post-preview').innerHTML = `
      ${posts.image ? `<img src="http://localhost:4000/uploads/${posts.image}" alt="Post Image" style="max-width:200px;">` : ''}
      <div class="caption">${posts.content}</div>
    `;

    const commentList=document.getElementById('modal-comments-list')
    if(posts.comments && posts.comments.length > 0){
  commentList.innerHTML = posts.comments.map(comment => {
    const date = comment.createdAt ? new Date(comment.createdAt) : '';
    return `<div class="comment">
      <b>@${comment.user.username}:</b> ${comment.text}
      <div class="comment-time" style="font-size:0.8em;color:#888;">
        ${date ? date.toLocaleString() : ''}
      </div>
    </div>`;
  }).join('');
    }else{
      commentList.innerHTML='<div>No comments yet</div>'
    }

    document.getElementById('comment-modal').style.display='block';
    document.getElementById('modal-comment-input').value=''
    document.getElementById('modal-comment-form').dataset.postId = postId;
  }catch(error){
    console.log('❌ Error loading comments:', error)
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
      // Optionally, reload posts to update main feed
      
    } else {
      alert('Failed to comment');
    }
  } catch (err) {
    alert('Error commenting');
  }
});