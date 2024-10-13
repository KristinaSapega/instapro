import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, renderApp, setNewPosts } from "../index.js";
import { dislikePost, getPosts, likePost } from "../api.js";
import {formatDistanceToNow} from "date-fns";
import { ru } from "date-fns/locale";
import { sanitize } from "../helpers";

export function renderPostsPageComponent({ appEl }) {

  const postsHtml = posts.length
    ? posts
        .map((post) => {
          const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru });
          return `
            <li class="post">
              <div class="post-header" data-user-id="${post.user.id}">
                  <img src="${post.user.imageUrl}" class="post-header__user-image">
                  <p class="post-header__user-name">${sanitize(post.user.name)}</p>
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
                      ? sanitize (post.likes[0].name)
                      : post.likes[post.likes.length - 1].name +
                        " и еще " +
                        (post.likes.length - 1)
                  }</strong>
                </p>
              </div>
              <p class="post-text">
                <span class="user-name">${sanitize(post.user.name)}</span>
                ${sanitize(post.description)}
              </p>
              <p class="post-date">
                ${formattedDate}
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
      const isLiked = posts.find(post => post.id === postId).isLiked;
      const token = getToken();

      if(!token) {
        alert("Необходимо авторизоваться, чтобы поставить лайк");
        return;
      }
      const actionLike = isLiked ? dislikePost : likePost;

        actionLike ({token, postId})
        .then(() => {
          return getPosts({token})
         
        }).then((newPost) => {
          setNewPosts(newPost);
          renderApp();
        })         
        .catch((error) => {
          console.error("Ошибка при убирании лайка:", error);
          alert("Не удалось убрать лайк. Попробуйте снова.");
        });
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
