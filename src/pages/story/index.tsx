import { logger } from "@/shared/lib/logger.ts";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import store from "store2";

import CustomHead from "@/components/Global/CustomHead";
import ChangeThemeButton from "@/components/UI/NavBar/ChangeThemeButton";
import NavBar from "@/components/UI/NavBar/NavBar";
import { useStoryService, useStoryStore } from "@/entities/story";
import {
  CreateStoryButton,
  EditStoryDrawer,
  ImportFromFolderButton,
  ImportFromServerButton,
  ImportFromZipButton,
} from "@/features/story";
import { StoryType } from "@/shared/lib/type/story.type";
import ExportToServer from "@/features/story/export-to-server/ui/export-to-server.tsx";
import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Spacer,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { BiEdit } from "react-icons/bi";
import { BsCloudUpload } from "react-icons/bs";

interface Author {
  id: string;
  login: string;
  name: string;
  nickname: string;
  avatar: string;
  pdaId: number;
  xp: number;
  achievements: number;
  gang: string;
  registration: string;
  lastLoginAt: string;
}

export interface StoryFromServer {
  storageId: string;
  storyId: number;
  title: string;
  icon: string;
  needs: number[];
  access: string;
  message: string;
  archive: boolean;
  type: string;
  timestamp: string;
  author: Author;
  hashcode: number;
}

const Home = () => {
  const { stories, setStories, setEditStory, setUploadConfig } =
    useStoryStore();
  const { downloadStoryAsZip } = useStoryService();
  const {
    isOpen: editDrawerIsOpen,
    onOpen: editDrawerOnOpen,
    onClose: editDrawerOnClose,
  } = useDisclosure();

  const {
    isOpen: exportDrawerIsOpen,
    onOpen: exportDrawerOnOpen,
    onClose: exportDrawerOnClose,
  } = useDisclosure();

  useEffect(() => {
    logger.info("Editor loaded");

    let stories: StoryType[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key?.includes("info")) {
        const value = JSON.parse(localStorage.getItem(key) as string);
        stories.push(value as StoryType);
      }
    });

    stories.sort((a, b) => a.id - b.id);
    logger.success("Get stories from localStorage:", stories);
    setStories(stories);
  }, []);

  return (
    <>
      <CustomHead title="Редактор историй" />
      <Box w="100vw">
        <NavBar>
          <CreateStoryButton />
          <ImportFromFolderButton />
          <ImportFromZipButton />
          <Spacer />
          <ChangeThemeButton rounded={true} />
          <ImportFromServerButton />
          <Button
            fontWeight="normal"
            onClick={() => {
              const requiredStoryKey: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key?.includes(`story`)) {
                  requiredStoryKey.push(key!);
                }
              }
              requiredStoryKey.forEach((key) => {
                store.remove(key);
              });
              window.location.reload();
            }}
          >
            Удалить всё
          </Button>
        </NavBar>
        <Box
          h="calc(100vh - 57px)"
          overflowY="auto"
          backgroundColor="blackAlpha.50"
        >
          <VStack gap={2} p={2}>
            {stories.map((story) => (
              <Card
                variant="outline"
                key={story.id}
                w="100%"
                p={2}
                color="black"
                _dark={{ color: "white" }}
              >
                <Flex gap={1}>
                  <Box>
                    <Link to={`/edit/story/${story.id}`}>
                      <Text fontSize="large">{story.title}</Text>
                      <Text fontSize="small">ID: {story.id}</Text>
                      <Text fontSize="smaller">
                        {story.desc.substring(0, 30)}...
                      </Text>
                    </Link>
                  </Box>
                  <Spacer />
                  <Button
                    fontWeight="normal"
                    size="sm"
                    onClick={() => downloadStoryAsZip(story.id)}
                  >
                    Скачать
                  </Button>
                  <IconButton
                    size="sm"
                    aria-label="Загрузить на сервер"
                    icon={<BsCloudUpload />}
                    onClick={() => {
                      exportDrawerOnOpen();
                      setUploadConfig({
                        id: story.id,
                      });
                    }}
                  />
                  <IconButton
                    size="sm"
                    aria-label="Редактировать"
                    icon={<BiEdit />}
                    onClick={() => {
                      setEditStory(story);
                      editDrawerOnOpen();
                    }}
                  />
                </Flex>
              </Card>
            ))}
          </VStack>
        </Box>
      </Box>
      <ExportToServer
        exportDrawerOnClose={exportDrawerOnClose}
        isOpen={exportDrawerIsOpen}
      />
      <EditStoryDrawer isOpen={editDrawerIsOpen} onClose={editDrawerOnClose} />
    </>
  );
};

export default Home;
