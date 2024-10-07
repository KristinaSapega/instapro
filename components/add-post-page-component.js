import { uploadImage } from '../api.js';

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let uploadedImageUrl = "";

  const render = () => {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="add-post-container">
        <h2 class="form-title">Добавить новый пост</h2>
        <form id="add-post-form" class="form">
          <div class="form-inputs">
            <label for="description">Описание:</label>
            <textarea id="description" class="description-input" rows="4"></textarea>
          
            <label for="image">Загрузить изображение:</label>
            <input type="file" id="image-input" class="image-input file-upload-label" accept="image/*" />
          </div>
          <div class="file-upload-image-conrainer">
            ${uploadedImageUrl ? `<img src="${uploadedImageUrl}" class="file-upload-image" />` : ""}
          </div>

          <div class="form-footer">
            <button type="submit" class="button" id="submit-button">Добавить пост</button>
          </div>
        </form>
      </div>
    </div>
  `;

    appEl.innerHTML = appHtml;

    document.getElementById("image-input").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        uploadImage({ file }).then((response) => {
          uploadedImageUrl = response.fileUrl;
          render(); // Перерисовали для отображения загруженного изображения
        });
      }
    });

    document.getElementById("add-post-form").addEventListener("submit", (event) => {
      event.preventDefault();
      
      const description = document.getElementById("description").value.trim();

      if (!description || !uploadedImageUrl) {
        alert("Пожалуйста, добавьте описание и изображение.");
        return;
      }

      onAddPostClick({
        description,
        imageUrl: uploadedImageUrl,
      });
    });
  };

  render();
}
