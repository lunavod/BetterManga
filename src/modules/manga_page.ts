import { Module } from "../module";
import { sanitizeDescription } from "../utils/manga";

export class MangaPage extends Module {
    name = "Manga Page";
    urlMatch = /\/manga\/[^\/]+$/;

    init() {
        const descriptionElement = document.querySelector("#contentBox")
        if (!descriptionElement) {
            console.log("Description element not found on the manga page.");
            return;
        }
        const textNode = descriptionElement.lastChild;
        const description = sanitizeDescription(textNode!.textContent?.replaceAll("  ", "").replaceAll("\n", " ") ?? "");
        textNode!.textContent = description;

        console.log("Description sanitized");
    }

    destroy() {
        // Clean up the module, e.g., remove event listeners or revert DOM changes
        console.log("MangaPage module destroyed");
    }
}