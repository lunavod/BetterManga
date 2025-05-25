import { Module } from "./module";
import { MangaPage } from "./modules/manga_page";
import { ChapterPage } from "./modules/chapter_page";
import { HomePage } from "./modules/home_page";

console.log("Hey there")

const modules: Module[] = [
  new MangaPage(),
  new ChapterPage(),
  new HomePage(),
]

function initModules() {
  modules.forEach(module => {
    const regexps = Array.isArray(module.urlMatch) ? module.urlMatch : [module.urlMatch];
    if (regexps.some(regexp => regexp.test(window.location.pathname))) {
      module.init();
      console.log(`Module ${module.name} initialized for ${window.location.pathname}`);
    }
  })
}

initModules();
