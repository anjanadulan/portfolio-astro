const fs=require('fs');
let h=fs.readFileSync('projects.html','utf8');

const simpleDesc = {
  'distributor': 'A full-stack Distribution Management System.',
  'agrochain': 'Smart Agricultural Management System for farmers.',
  'smart-prison': 'IoT security prototype using Arduino.',
  'simple-calc': 'A modern Java Servlet-based web calculator.',
  'bookstore': 'PHP-based template for a bookstore website.',
  'taxi': 'A web-based taxi management interface.',
  'camp-conn': 'A web platform built to connect campers.'
};

h = h.replace(/<div class="project-card">([\s\S]*?)<button class="btn btn-secondary btn-sm open-modal-btn" data-project="([^"]+)">Details<\/button>\s*/g, (m, inner, id) => {
    let sDesc = simpleDesc[id] || 'Click to view full project details.';
    let newInner = inner.replace(/<p class="project-desc">[\s\S]*?<\/p>/, `<p class="project-desc">${sDesc}</p>`);
    return `<div class="project-card" data-project="${id}" style="cursor: pointer;">${newInner}`;
});

fs.writeFileSync('projects.html', h);
