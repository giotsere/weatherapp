require('./style.css');

const h1 = document.createElement('h1');
h1.textContent = 'helo';
h1.classList.add('text-blue-400');

document.body.appendChild(h1);
document.body.classList.add('bg-slate-500');
