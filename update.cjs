const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');
let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Colors
  content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-nhs-blue');
  content = content.replace(/bg-blue-[56]00/g, 'bg-nhs-blue');
  content = content.replace(/hover:bg-blue-[67]00/g, 'hover:bg-nhs-dark');
  content = content.replace(/text-blue-[567]00/g, 'text-nhs-blue');
  content = content.replace(/bg-indigo-[56]00/g, 'bg-nhs-blue');
  content = content.replace(/hover:bg-indigo-[67]00/g, 'hover:bg-nhs-dark');
  content = content.replace(/text-indigo-[567]00/g, 'text-nhs-blue');
  content = content.replace(/bg-purple-[56]00/g, 'bg-nhs-blue');
  content = content.replace(/hover:bg-purple-[67]00/g, 'hover:bg-nhs-dark');
  content = content.replace(/text-purple-[567]00/g, 'text-nhs-blue');
  content = content.replace(/bg-teal-[56]00/g, 'bg-nhs-blue');
  content = content.replace(/hover:bg-teal-[67]00/g, 'hover:bg-nhs-dark');
  content = content.replace(/text-teal-[567]00/g, 'text-nhs-blue');
  
  content = content.replace(/text-gray-600/g, 'text-nhs-muted');
  content = content.replace(/text-gray-500/g, 'text-nhs-muted');
  content = content.replace(/text-gray-700/g, 'text-nhs-muted');
  content = content.replace(/text-gray-[89]00/g, 'text-nhs-text');
  content = content.replace(/text-slate-600/g, 'text-nhs-muted');
  content = content.replace(/text-slate-500/g, 'text-nhs-muted');
  content = content.replace(/text-slate-[89]00/g, 'text-nhs-text');
  content = content.replace(/bg-slate-50/g, 'bg-gray-50');
  content = content.replace(/bg-slate-100/g, 'bg-gray-50');

  // Shadows
  content = content.replace(/shadow-(xl|2xl|lg)/g, 'shadow-sm');

  // Borders & Rounded
  content = content.replace(/rounded-(2xl|3xl)/g, 'rounded-lg');
  content = content.replace(/border-gray-200/g, 'border-nhs-border');
  content = content.replace(/border-gray-100/g, 'border-nhs-border');
  content = content.replace(/border-slate-200/g, 'border-nhs-border');
  
  // Glassmorphism and animations
  content = content.replace(/backdrop-blur(-\w+)?/g, '');
  content = content.replace(/bg-white\/(10|20|30|40|50|60|70|80|90|5)/g, '');
  content = content.replace(/hover:-translate-y-1/g, 'hover:border-nhs-blue hover:bg-gray-50');
  content = content.replace(/hover:scale-105/g, 'hover:border-nhs-blue hover:bg-gray-50');
  content = content.replace(/transition-all/g, '');
  content = content.replace(/transition-transform/g, '');
  content = content.replace(/duration-300/g, '');
  
  // Typography
  content = content.replace(/font-extrabold/g, 'font-semibold');
  content = content.replace(/font-bold/g, 'font-semibold');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
  }
});
console.log('Modified ' + totalChanges + ' files.');
