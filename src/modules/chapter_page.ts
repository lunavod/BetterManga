import { Module } from "../module";

export class ChapterPage extends Module {
    name = "Chapter Page";
    urlMatch = /\/manga\/[^\/]+\/chapter-[\d\.]+$/;

    init() {
        this.updateChapterNavigation();
        console.log("Chapter Page module initialized");
    }

    updateChapterNavigation() {
        const buttons = document.querySelectorAll(".btn-navigation-chap .back") as NodeListOf<HTMLAnchorElement>;
        const chapterSelect = document.querySelector(".navi-change-chapter") as HTMLSelectElement;
        
        if (!chapterSelect || buttons.length === 0) {
            console.log("Required elements not found");
            return;
        }

        const fullChapterName = chapterSelect.value;
        console.log("Full chapter name:", fullChapterName);
        
        // Extract chapter number
        const chapterNum = fullChapterName.includes(":")
            ? fullChapterName.split(":")[0].replace("Chapter ", "")
            : fullChapterName.replace("Chapter ", "");

        if (chapterNum.includes("-") || chapterNum.includes(".")) {
            console.log("Current chapter is half chapter, skipping");
            return;
        }

        const currentChapter = parseInt(chapterNum);
        console.log("Current chapter number:", currentChapter);

        // Check if next full chapter exists
        const chapters = document.querySelectorAll(".navi-change-chapter option");
        const targetChapter = (currentChapter + 1).toString();
        
        const nextChapterExists = Array.from(chapters).some(option => {
            const n = option.getAttribute("data-c")?.replace(/.+\/chapter-([\d\.\-]+)$/, "$1");
            return n === targetChapter && !n.includes(".") && !n.includes("-");
        });

        if (!nextChapterExists) {
            console.log("No next chapter, exiting");
            return;
        }

        const nextUrl = location.href.replace(/\/chapter-(.+)/, `/chapter-${currentChapter + 1}`);
        console.log("Next chapter url:", nextUrl);

        // Update navigation buttons
        buttons.forEach(button => {
            // Create original next chapter button if it doesn't exist
            if (!button.parentElement?.querySelector(".original")) {
                const clone = button.cloneNode(true) as HTMLAnchorElement;
                clone.classList.add("next", "original");
                clone.classList.remove("back");

                const originalNext = clone.href.replace(/.+\/chapter-([\d\.\-]+)$/, "$1");
                if (originalNext !== targetChapter) {
                    clone.textContent = `NEXT CHAPTER (${originalNext.replace(/-/g, ".")})`;
                    button.parentElement!.appendChild(clone);
                }
            }

            // Update current button to point to next full chapter
            button.href = nextUrl;
            button.innerHTML = `NEXT FULL CHAPTER (${currentChapter + 1})`;
        });
    }

    destroy() {
        // Clean up the module, e.g., remove event listeners or revert DOM changes
        console.log("Chapter Page module destroyed");
    }
}