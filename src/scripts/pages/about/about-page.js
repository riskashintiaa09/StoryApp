export default class AboutPage {
  async render() {
    return `
     <section class="container fade-in">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
      
      </section>
    `;
  }

  async afterRender() {
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
      aboutContent.classList.add('fade-in');
    }
  }
}