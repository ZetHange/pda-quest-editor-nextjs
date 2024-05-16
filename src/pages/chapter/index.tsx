import CustomHead from "@/components/Global/CustomHead";
import ChangeThemeButton from "@/components/UI/NavBar/ChangeThemeButton";
import NavBar from "@/components/UI/NavBar/NavBar";
import { useChapterStore } from "@/entities/chapter";
import { CreateChapterButton, ImportFromJsonButton } from "@/features/chapter";
import { ShareStoryButton } from "@/features/cooperative";
import { logger } from "@/shared/lib/logger.ts";
import { ChapterType } from "@/shared/lib/type/chapter.type";
import { ChapterCard } from "@/widgets/chapter-card";
import { Box, Button, SimpleGrid, Spacer, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { chapters, setChapters, setStoryId, storyId } = useChapterStore();

  useEffect(() => {
    setStoryId(Number(id as string));

    let chapters: ChapterType[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`story_${id}_chapter`)) {
        const chapter = JSON.parse(localStorage.getItem(key) as string);
        chapters.push(chapter);
      }
    });
    chapters = chapters.sort((a, b) => a.id - b.id);
    setChapters(chapters);
    logger.info("Loaded chapters:", chapters);

    return () => setChapters([]);
  }, []);
  // const jsonRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <CustomHead title="Редактирование истории" />
      <main className="main">
        <NavBar>
          <Button fontWeight="normal" onClick={() => navigate("/")}>
            Назад
          </Button>
          <CreateChapterButton />
          <ImportFromJsonButton />
          <Spacer />
          <ShareStoryButton />
          <ChangeThemeButton rounded={true} />
        </NavBar>
        <Box h="calc(100vh - 73px)" px={2} overflowY="auto">
          <Box overflowY="auto">
            <Text my={2}>История {storyId}</Text>
            <SimpleGrid columns={1} spacing={2}>
              {chapters.map((chapter: ChapterType) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  storyId={storyId}
                />
              ))}
            </SimpleGrid>
          </Box>
        </Box>
        {/* <EditChapterDrawer
          isOpen={isOpen}
          onClose={onClose}
          storyId={+storyId!}
          chapter={openChapter!}
          setChapter={setOpenChapter as any}
          onUpdate={onUpdate}
          deleteChapter={deleteChapter}
        /> */}
      </main>
    </>
  );
};

export default Story;
