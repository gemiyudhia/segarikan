export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1 class="text-blue-500 font-bold">Home Page</h1>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
