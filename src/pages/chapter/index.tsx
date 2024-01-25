import CustomHead from "@/components/Global/CustomHead";
import ChapterCard from "@/components/Story/ChapterCard/ChapterCard";
import ChangeThemeButton from "@/components/UI/NavBar/ChangeThemeButton";
import NavBar from "@/components/UI/NavBar/NavBar";
import { useChapterStore } from "@/entities/chapter";
import { ImportFromJsonButton, CreateChapterButton } from "@/features/chapter";
import { ChapterType } from "@/shared/lib/type/chapter.type";
import { logger } from "@/store/utils/logger";
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
          <ChangeThemeButton rounded={true} />
        </NavBar>
        <Box h="calc(100vh - 73px)" px={2} overflowY="auto">
          <Box overflowY="auto">
            <Text my={2}>История {storyId}</Text>
            <SimpleGrid columns={5} spacing={2}>
              {chapters.map((chapter: ChapterType) => (
                <ChapterCard
                  storyId={id as string}
                  chapter={chapter}
                  setOpenChapter={() => {}}
                  onOpen={() => {}}
                  key={chapter.id}
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
