/** Top navigation tabs of the dashboard. */

export function initTabs() {
  const buttons = document.querySelectorAll('.admin-tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById(btn.dataset.tab).classList.add('is-active');
    });
  });
}
