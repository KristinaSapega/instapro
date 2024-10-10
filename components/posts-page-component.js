import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { dislikePost, likePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  // TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const postsHtml = posts.length
    ? posts
        .map((post) => {
          return `
            <li class="post">
              <div class="post-header" data-user-id="${post.user.id}">
                  <img src="${post.user.imageUrl}" class="post-header__user-image">
                  <p class="post-header__user-name">${post.user.name}</p>
              </div>
              <div class="post-image-container">
                <img class="post-image" src="${post.imageUrl}">
              </div>
              <div class="post-likes">
                <button data-post-id="${post.id}" class="like-button">
                  <img src="./assets/images/${post.isLiked ? 'like-active' : 'like-not-active'}.svg">
                </button>
                <p class="post-likes-text">
                  Нравится: <strong>${
                    post.likes.length === 0
                      ? 0
                      : post.likes.length === 1
                      ? post.likes[0].name
                      : post.likes[post.likes.length - 1].name +
                        " и еще " +
                        (post.likes.length - 1)
                  }</strong>
                </p>
              </div>
              <p class="post-text">
                <span class="user-name">${post.user.name}</span>
                ${post.description}
              </p>
              <p class="post-date">
                ${new Date(post.createdAt).toLocaleString()}
              </p>
            </li>
          `;
        })
        .join("")
    : `<p style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 24px;
        text-align: center;
        color: #333;
      ">Нет постов для отображения</p>`;

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">${postsHtml}</ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for(let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", (event) => {
      const postId = event.currentTarget.dataset.postId;
      const isLiked = posts.find(post => postId === postId).isLiked;
      const token = user ? `Bearer ${user.token}` : undefined;

      if(!token) {
        alert("Необходимо авторизоваться, чтобы поставить лайк");
        return;
      }

      if (isLiked) {
        dislikePost ({token, postId})
        .then((updatePost) => {
          const postIndex = posts.findIndex(post => postId ===postId);
          postIndex = updatePost;
          renderPostsPageComponent({appEl});
        })
        .catch((error) => {
          console.error("Ошибка при убирании лайка:", error);
          alert("Не удалось убрать лайк. Попробуйте снова.");
        });
      }else {
        likePost({ token, postId })
          .then((updatedPost) => {
            const postIndex = posts.findIndex(post => post.id === postId);
            posts[postIndex] = updatedPost;
            renderPostsPageComponent({ appEl });
          })
          .catch((error) => {
            console.error("Ошибка при добавлении лайка:", error);
            alert("Не удалось поставить лайк. Попробуйте снова.");
          });
      }
    });
  }



  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
