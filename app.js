const organizations = [
  { name: 'AgriSahel Coop', initials: 'AS', city: 'Niamey, Niger', category: 'agriculture', label: 'Agriculture', description: 'Agriculture régénératrice et souveraineté alimentaire.' },
  { name: 'Niger Solar', initials: 'NS', city: 'Maradi, Niger', category: 'énergie', label: 'Énergie', description: 'Solutions solaires accessibles aux communautés rurales.' },
  { name: 'RecycLab', initials: 'RL', city: 'Dakar, Sénégal', category: 'déchets', label: 'Déchets', description: 'Transformer les déchets plastiques en ressources locales.' },
  { name: 'Terra Sahel', initials: 'TS', city: 'Ouagadougou, Burkina Faso', category: 'agriculture', label: 'Agriculture', description: 'Restaurer les sols et accompagner les producteurs.' },
  { name: 'Kivu Énergie', initials: 'KE', city: 'Goma, RDC', category: 'énergie', label: 'Énergie', description: 'Mini-réseaux propres pour les territoires isolés.' },
  { name: 'Cycle Afrique', initials: 'CA', city: 'Abidjan, Côte d’Ivoire', category: 'déchets', label: 'Déchets', description: 'Une économie circulaire pensée avec les quartiers.' },
];

const grid = document.querySelector('#organization-grid');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');

function renderOrganizations() {
  const query = searchInput.value.trim().toLocaleLowerCase('fr');
  const category = categoryFilter.value;
  const filtered = organizations.filter((org) => {
    const matchesQuery = !query || `${org.name} ${org.city} ${org.description}`.toLocaleLowerCase('fr').includes(query);
    return matchesQuery && (category === 'all' || org.category === category);
  });
  grid.innerHTML = filtered.map((org) => `
    <article class="org-card">
      <div class="org-top"><span class="org-logo" aria-hidden="true">${org.initials}</span><span class="verified">✦ Vérifié</span></div>
      <h3>${org.name}</h3><p>${org.city}</p><p>${org.description}</p>
      <div class="org-meta"><span class="tag">${org.label}</span><span class="tag">Badge 2026</span></div>
    </article>`).join('');
  emptyState.hidden = filtered.length > 0;
}

searchInput.addEventListener('input', renderOrganizations);
categoryFilter.addEventListener('change', renderOrganizations);
renderOrganizations();
